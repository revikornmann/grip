import { createClient } from "@/lib/supabase";

/**
 * Read-only queries against the public `motorcycle_models` catalog, used by the
 * Search start screen to populate the Make / Model / Year selects.
 */

export async function listMakes(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycle_models")
    .select("make")
    .order("make", { ascending: true });

  if (error) throw new Error(error.message);
  return uniqueStrings((data ?? []).map((r) => r.make as string));
}

export async function listModels(make: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycle_models")
    .select("model")
    .eq("make", make)
    .order("model", { ascending: true });

  if (error) throw new Error(error.message);
  return uniqueStrings((data ?? []).map((r) => r.model as string));
}

export async function listYears(
  make: string,
  model: string,
): Promise<number[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycle_models")
    .select("year")
    .eq("make", make)
    .eq("model", model)
    .order("year", { ascending: false });

  if (error) throw new Error(error.message);
  const years = (data ?? []).map((r) => r.year as number);
  return Array.from(new Set(years));
}

/**
 * Most recently added catalog models, used to seed the Search screen's "Recent
 * searches" section before the user has previewed anything of their own.
 */
export async function listRecentModels(
  limit = 5,
): Promise<{ id: string; make: string; model: string; year: number }[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycle_models")
    .select("id, make, model, year")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as {
    id: string;
    make: string;
    model: string;
    year: number;
  }[];
}

export async function findModelId(
  make: string,
  model: string,
  year: number,
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycle_models")
    .select("id")
    .eq("make", make)
    .eq("model", model)
    .eq("year", year)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? (data.id as string) : null;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}
