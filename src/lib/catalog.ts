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

/**
 * Free-text catalog search for the Search overlay's autocomplete.
 *
 * The query is matched as a contiguous phrase against the combined
 * "make model" label, so "BMW R" surfaces "BMW R1100 GS" — not every BMW whose
 * name merely contains the letter r. Each whitespace-separated token first
 * narrows the rows server-side (every token must appear in the make or model);
 * the authoritative contiguous match then runs client-side, since the phrase can
 * straddle the make/model boundary and can't be expressed as a single column
 * filter. Results are deduped to one entry per make+model, keeping the most
 * recent year as the representative link target.
 */
export async function searchModels(
  query: string,
  limit = 8,
): Promise<{ id: string; make: string; model: string; year: number }[]> {
  const phrase = query.trim();
  const tokens = phrase
    .split(/\s+/)
    .map((tok) => tok.replace(/[%,*().:]/g, ""))
    .filter(Boolean);
  if (tokens.length === 0) return [];

  const supabase = createClient();
  let q = supabase
    .from("motorcycle_models")
    .select("id, make, model, year")
    .order("make", { ascending: true })
    .order("model", { ascending: true })
    .order("year", { ascending: false });

  // Multiple .or() calls are AND-combined, so each token must hit make or model.
  for (const token of tokens) {
    q = q.or(`make.ilike.%${token}%,model.ilike.%${token}%`);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const needle = phrase.toLowerCase();
  const seen = new Set<string>();
  const out: { id: string; make: string; model: string; year: number }[] = [];
  for (const row of (data ?? []) as {
    id: string;
    make: string;
    model: string;
    year: number;
  }[]) {
    if (!`${row.make} ${row.model}`.toLowerCase().includes(needle)) continue;
    const key = `${row.make}|${row.model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
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
