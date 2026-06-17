// Supabase Edge Function: generate-specs
//
// Lazily generates technical specifications for a catalogue motorcycle that has
// no specs yet, using Claude, and writes them back to `motorcycle_models`.
//
// Triggered from the client (`supabase.functions.invoke("generate-specs", ...)`)
// when a detail page opens a model whose `specs_filled_at` is null. The client
// then polls the row until `specs_status` becomes `ready` (or `failed`).
//
// Secrets (set via `supabase secrets set` or the dashboard):
//   ANTHROPIC_API_KEY            – Claude API key
// Auto-injected by the platform:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY – RLS-bypassing DB access
//
// Generated specs are clearly provenance-tagged: every row carries
// `source: "ai"`, and the model row is written with `source = 'ai'`,
// `verified = false`. They are estimates, never presented as verified facts.

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";

const SPEC_CATEGORIES = [
  "identification",
  "engine",
  "electrical",
  "engineOutput",
  "drivetrain",
  "chassis",
  "brakes",
  "wheelsTyres",
  "dimensions",
  "fuelEconomy",
  "torqueSpecs",
] as const;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// A single spec row. `source` is stamped server-side, so the model is only asked
// for label/value/hint/group.
const rowSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    label: { type: "string" },
    value: { type: "string" },
    hint: { type: "string" },
    group: { type: "string" },
  },
  required: ["label", "value"],
};

// specs object: every category optional, each an array of rows.
const specsSchema = {
  type: "object",
  additionalProperties: false,
  properties: Object.fromEntries(
    SPEC_CATEGORIES.map((c) => [c, { type: "array", items: rowSchema }]),
  ),
  required: [],
};

const SYSTEM_PROMPT = `You are a motorcycle technical-data expert. Produce a structured set of technical specifications for a specific motorcycle make/model/year.

Rules:
- Group specs into the provided categories. Only include categories that apply.
- Each row is { label, value } with optional { hint, group }.
- Express measurements with BOTH metric and imperial, in one of these string shapes so a UI can pick a unit system:
  - slash form: "1084 cc / 66.1 cu in", "212 kg / 467 lb"
  - parenthetical form: "20 Nm (15 lb·ft)"
  - single-system values that have no counterpart (tyre codes "120/70 ZR17", bore×stroke "81 × 62.6 mm", angles "24°") pass through as-is.
- "engineOutput" = performance (power, torque). "torqueSpecs" = fastener tightening torques; use the optional "group" to split them (e.g. "Engine", "Brakes", "Final drive").
- These are best-effort reference figures. If a value is genuinely unknown for this exact model/year, omit the row rather than inventing a precise but wrong number. Prefer well-established, widely-published figures.
- Do not include any commentary — only the structured data.`;

async function generateSpecs(
  anthropic: Anthropic,
  make: string,
  model: string,
  year: number,
): Promise<Record<string, Array<Record<string, string>>>> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: specsSchema },
    },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate technical specifications for the ${year} ${make} ${model}.`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No structured output returned from the model");
  }
  return JSON.parse(textBlock.text);
}

// Stamp every row with source: "ai" and drop empty categories.
function tagSpecs(
  raw: Record<string, Array<Record<string, string>>>,
): Record<string, Array<Record<string, unknown>>> {
  const out: Record<string, Array<Record<string, unknown>>> = {};
  for (const category of SPEC_CATEGORIES) {
    const rows = raw[category];
    if (Array.isArray(rows) && rows.length > 0) {
      out[category] = rows.map((r) => ({ ...r, source: "ai" }));
    }
  }
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let modelId: string | undefined;
  try {
    ({ modelId } = await req.json());
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!modelId) return json({ error: "modelId is required" }, 400);

  // Load the catalogue row.
  const { data: row, error: loadError } = await supabase
    .from("motorcycle_models")
    .select("id, make, model, year, specs_filled_at, specs_status")
    .eq("id", modelId)
    .maybeSingle();

  if (loadError) return json({ error: loadError.message }, 500);
  if (!row) return json({ error: "Model not found" }, 404);

  // Already filled, or another invocation is already generating — no-op.
  if (row.specs_filled_at) return json({ status: "ready" });
  if (row.specs_status === "pending") return json({ status: "pending" });

  // Claim it so concurrent viewers don't double-generate.
  await supabase
    .from("motorcycle_models")
    .update({ specs_status: "pending" })
    .eq("id", modelId);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    await supabase
      .from("motorcycle_models")
      .update({ specs_status: "failed" })
      .eq("id", modelId);
    return json({ error: "ANTHROPIC_API_KEY is not configured" }, 500);
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const raw = await generateSpecs(anthropic, row.make, row.model, row.year);
    const specs = tagSpecs(raw);

    const { error: writeError } = await supabase
      .from("motorcycle_models")
      .update({
        specs,
        source: "ai",
        verified: false,
        specs_filled_at: new Date().toISOString(),
        specs_status: "ready",
      })
      .eq("id", modelId);

    if (writeError) throw writeError;
    return json({ status: "ready" });
  } catch (e) {
    await supabase
      .from("motorcycle_models")
      .update({ specs_status: "failed" })
      .eq("id", modelId);
    const messageText = e instanceof Error ? e.message : String(e);
    return json({ status: "failed", error: messageText }, 500);
  }
});
