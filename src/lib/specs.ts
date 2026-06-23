import { createClient } from "@/lib/supabase";
import type { MotorcycleSpecs } from "@/types/motorcycle";
import type { MotorcycleModelSpecTranslationRow } from "@/types/database";

/**
 * Ask the backend to generate technical specs for a catalogue model that has
 * none yet. Fire-and-forget — the server claims the row (`specs_status =
 * 'pending'`), generates with Claude, and writes the specs back. The caller
 * then polls `getMotorcycleModel` until the row is filled (see `useModelSpecs`).
 */
export async function triggerSpecGeneration(modelId: string): Promise<void> {
  const supabase = createClient();
  // Invoke sends the user's session JWT in the Authorization header, which the
  // Edge Function (verify_jwt) requires.
  await supabase.functions.invoke("generate-specs", { body: { modelId } });
}

/**
 * Ask the backend to translate a model's canonical (English) specs into the
 * given locale, caching the result in `motorcycle_model_spec_translations`.
 * Fire-and-forget and server-deduped; the caller polls `getSpecTranslation`
 * until the row is `ready` (see `useModelSpecs`). No-op for `en`.
 */
export async function triggerSpecTranslation(
  modelId: string,
  locale: string,
): Promise<void> {
  const supabase = createClient();
  await supabase.functions.invoke("translate-specs", {
    body: { modelId, locale },
  });
}

export interface SpecTranslation {
  specs: MotorcycleSpecs | null;
  status: "pending" | "ready" | "failed";
  /** When the row last changed — used to cooldown failed-translation retries. */
  updatedAt: string | null;
}

/**
 * Read the cached spec translation for a model+locale, or null if none exists
 * yet (translation not requested).
 */
export async function getSpecTranslation(
  modelId: string,
  locale: string,
): Promise<SpecTranslation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycle_model_spec_translations")
    .select("specs, status, updated_at")
    .eq("model_id", modelId)
    .eq("locale", locale)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as Pick<
    MotorcycleModelSpecTranslationRow,
    "specs" | "status" | "updated_at"
  >;
  return {
    specs: row.specs ?? null,
    status: row.status,
    updatedAt: row.updated_at ?? null,
  };
}
