// Supabase Edge Function: translate-specs
//
// Translates the canonical (English) technical specs of a catalogue motorcycle
// into a target locale, caching the result per-locale in
// `motorcycle_model_spec_translations`. The English specs in
// `motorcycle_models.specs` remain the single source of truth — only the worded
// fields (label, group, the prose part of hint) are translated; numeric values
// and unit tokens are preserved byte-for-byte, and each row's `source` tag is
// carried over so provenance never drifts.
//
// Triggered from the client (`supabase.functions.invoke("translate-specs", ...)`)
// after the canonical specs are ready, when the active locale is not English.
// The client then polls the translations row until `status` becomes `ready`
// (or `failed`). See `useModelSpecs`.
//
// Secrets (set via `supabase secrets set` or the dashboard):
//   ANTHROPIC_API_KEY            – Claude API key
// Auto-injected by the platform:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY – RLS-bypassing DB access

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

// locale → English language name, used in the translation prompt. English is a
// no-op (served straight from the canonical specs) so it is intentionally absent.
const LANGUAGE_NAMES: Record<string, string> = {
  nl: "Dutch",
  de: "German",
  fr: "French",
  es: "Spanish",
  pt: "Portuguese",
  id: "Indonesian",
  vi: "Vietnamese",
  ja: "Japanese",
  zh: "Chinese (Simplified)",
  hi: "Hindi",
};

// After a failed translation, don't re-call Claude for the same (model, locale)
// until this cooldown elapses — a permanently-failing translation otherwise burns
// one API call on every view. Keep in sync with the client guard in
// `src/lib/useModelSpecs.ts`.
const FAILED_RETRY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Row = Record<string, unknown>;
type Specs = Record<string, Row[]>;

// Pull the JSON object out of the model's text response. We ask for raw JSON, but
// strip any stray prose or ```fences``` defensively by taking the outermost
// braces. (Structured outputs / `output_config.format` are deliberately NOT used
// here: compiling a grammar for the 11-category specs schema takes longer than the
// Edge Function's wall-clock budget, so the call gets killed mid-flight and the
// row is left stuck `pending`. Prompt-driven JSON returns in ~2s, and
// `mergeTranslation` already falls back to the English row on any shape mismatch.)
function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return text.slice(start, end + 1);
}

function systemPrompt(language: string): string {
  return `You are a translator for a motorcycle technical-data UI. You will receive a JSON object of motorcycle specifications grouped into categories, each category an array of rows like { label, value, hint?, group? }.

Translate the spec text into ${language}.

Rules:
- Translate ONLY the worded fields: "label", "group", and the worded portion of "hint". Use the natural, idiomatic ${language} term a motorcycle owner's manual would use.
- Copy "value" through EXACTLY, byte-for-byte. Never translate, reformat, or convert numbers or unit tokens (cc, kg, Nm, mm, mph, hp, L, bar, °, etc.).
- In "hint", keep numeric/symbolic tokens such as "@ 9000 rpm" unchanged; translate only surrounding words.
- Keep the SAME categories, the SAME number of rows per category, and the SAME order. Do not add, remove, reorder, merge, or split rows or categories.
- Return ONLY a single JSON object mirroring the input shape (same keys, same array lengths). No commentary, no explanation, no markdown code fences.`;
}

async function translateSpecs(
  anthropic: Anthropic,
  specs: Specs,
  language: string,
): Promise<Specs> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    // Translation is a low-reasoning task; `low` effort and no extended thinking
    // keep latency to a couple of seconds (see extractJson for why structured
    // outputs are avoided).
    output_config: { effort: "low" },
    system: systemPrompt(language),
    messages: [
      {
        role: "user",
        content: `Translate these motorcycle specifications into ${language}:\n\n${JSON.stringify(
          specs,
        )}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text returned from the model");
  }
  return JSON.parse(extractJson(textBlock.text));
}

// Merge the translated label/hint/group onto the canonical rows, keeping the
// canonical `value` and `source` untouched. This guarantees numbers/units and
// provenance never drift. If a category's row count doesn't line up, fall back
// to the canonical rows for that whole category.
function mergeTranslation(canonical: Specs, translated: Specs): Specs {
  const out: Specs = {};
  for (const category of SPEC_CATEGORIES) {
    const base = canonical[category];
    if (!Array.isArray(base) || base.length === 0) continue;
    const tr = translated[category];
    if (!Array.isArray(tr) || tr.length !== base.length) {
      out[category] = base;
      continue;
    }
    out[category] = base.map((row, i) => {
      const t = tr[i] ?? {};
      const merged: Row = { ...row };
      if (typeof t.label === "string" && t.label.trim()) merged.label = t.label;
      if (typeof t.group === "string" && t.group.trim()) merged.group = t.group;
      // Only translate hint if the canonical row actually has one.
      if (row.hint != null && typeof t.hint === "string" && t.hint.trim()) {
        merged.hint = t.hint;
      }
      return merged;
    });
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
  let locale: string | undefined;
  try {
    ({ modelId, locale } = await req.json());
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!modelId) return json({ error: "modelId is required" }, 400);
  if (!locale) return json({ error: "locale is required" }, 400);

  // English is the canonical form — nothing to translate.
  if (locale === "en") return json({ status: "ready" });
  const language = LANGUAGE_NAMES[locale];
  if (!language) return json({ error: `Unsupported locale: ${locale}` }, 400);

  // Load the canonical (English) specs.
  const { data: model, error: loadError } = await supabase
    .from("motorcycle_models")
    .select("id, specs, specs_filled_at")
    .eq("id", modelId)
    .maybeSingle();

  if (loadError) return json({ error: loadError.message }, 500);
  if (!model) return json({ error: "Model not found" }, 404);

  // Canonical specs not ready yet — the client polls generation first and
  // retries translation once they land.
  const canonical = (model.specs ?? {}) as Specs;
  if (!model.specs_filled_at || Object.keys(canonical).length === 0) {
    return json({ status: "pending" });
  }

  // Already translated, or another invocation is in flight — no-op.
  const { data: existing } = await supabase
    .from("motorcycle_model_spec_translations")
    .select("status, updated_at")
    .eq("model_id", modelId)
    .eq("locale", locale)
    .maybeSingle();

  if (existing?.status === "ready") return json({ status: "ready" });
  if (existing?.status === "pending") return json({ status: "pending" });

  // A recent failure is on cooldown — don't re-spend an API call on a translation
  // that just failed. It self-heals once the cooldown elapses (the client stops
  // re-triggering within the same window; see `useModelSpecs`).
  if (existing?.status === "failed" && existing.updated_at) {
    const sinceMs = Date.now() - Date.parse(existing.updated_at);
    if (sinceMs < FAILED_RETRY_COOLDOWN_MS) return json({ status: "failed" });
  }

  // Claim it so concurrent viewers don't double-translate.
  await supabase
    .from("motorcycle_model_spec_translations")
    .upsert(
      { model_id: modelId, locale, status: "pending", updated_at: new Date().toISOString() },
      { onConflict: "model_id,locale" },
    );

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    await supabase
      .from("motorcycle_model_spec_translations")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("model_id", modelId)
      .eq("locale", locale);
    return json({ error: "ANTHROPIC_API_KEY is not configured" }, 500);
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const translated = await translateSpecs(anthropic, canonical, language);
    const specs = mergeTranslation(canonical, translated);

    const { error: writeError } = await supabase
      .from("motorcycle_model_spec_translations")
      .update({
        specs,
        status: "ready",
        updated_at: new Date().toISOString(),
      })
      .eq("model_id", modelId)
      .eq("locale", locale);

    if (writeError) throw writeError;
    return json({ status: "ready" });
  } catch (e) {
    await supabase
      .from("motorcycle_model_spec_translations")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("model_id", modelId)
      .eq("locale", locale);
    const messageText = e instanceof Error ? e.message : String(e);
    return json({ status: "failed", error: messageText }, 500);
  }
});
