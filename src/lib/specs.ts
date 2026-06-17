import { createClient } from "@/lib/supabase";

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
