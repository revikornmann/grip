"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  TopBar,
  ControlBar,
  SearchInput,
  Button,
  Icon,
  ListItem,
  Section,
  Container,
  Spinner,
  Toast,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { searchModels, listYears, findModelId } from "@/lib/catalog";
import { prettifyMake } from "@/lib/makes";
import { useRecentSearches } from "@/lib/useRecentSearches";

interface Props {
  /** Close the overlay and return to the Search home screen. */
  onClose: () => void;
}

type Result = { id: string; make: string; model: string; year: number };

const overlineStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--alias-font-brand-family)",
  fontWeight: 600,
  fontSize: "var(--font-size-md)",
  lineHeight: 1,
  textTransform: "uppercase",
  color: "var(--color-text-subtle-default)",
};

/**
 * Full-screen search experience opened from the Search top bar.
 *
 * Empty query → "Recent searches". Typing → live catalog autocomplete. Picking
 * a model fills the input with its name and reveals the list of catalog years
 * for that model; picking a year resolves the specific catalog row and navigates
 * to the model preview. Recent searches still navigate directly. Rendered as a
 * fixed overlay so it covers the bottom navigation, matching the sub-level view
 * in the design.
 */
export function SearchOverlay({ onClose }: Props) {
  const t = useTranslations("search");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const recent = useRecentSearches(10);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  // Once a model is picked from autocomplete we switch to "year mode": the input
  // holds the model name and the body lists its catalog years instead of
  // autocomplete matches. Cleared the moment the user edits the query again.
  const [picked, setPicked] = useState<{ make: string; model: string } | null>(
    null,
  );
  const [years, setYears] = useState<number[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState(false);

  const trimmed = query.trim();

  // Debounced catalog search while typing. Suspended in year mode so the picked
  // model name in the input doesn't re-trigger autocomplete over the year list.
  useEffect(() => {
    if (picked) return;
    if (trimmed.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const handle = setTimeout(() => {
      searchModels(trimmed)
        .then((r) => {
          if (!cancelled) setResults(r);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [trimmed, picked]);

  // Close on Escape (desktop / hardware keyboard).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Recent searches resolve to a specific catalog row already — go straight to
  // the preview.
  const openModel = (id: string) => {
    onClose();
    router.push(`/model/${id}`);
  };

  // Autocomplete pick: fill the input with the model name and load its years.
  const pickModel = (r: Result) => {
    setPicked({ make: r.make, model: r.model });
    setQuery(`${prettifyMake(r.make)} ${r.model}`);
    setResults([]);
    setYears([]);
    setYearsLoading(true);
    listYears(r.make, r.model)
      .then((ys) => setYears(ys))
      .catch(() => setError(true))
      .finally(() => setYearsLoading(false));
  };

  // Year pick: resolve the specific catalog row, then hand off to the preview.
  const openYear = async (year: number) => {
    if (!picked || resolving) return;
    setResolving(true);
    try {
      const id = await findModelId(picked.make, picked.model, year);
      if (id) openModel(id);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setResolving(false);
    }
  };

  // Any edit to the query leaves year mode and returns to autocomplete.
  const onQueryChange = (value: string) => {
    setQuery(value);
    if (picked) setPicked(null);
  };

  const back = (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={tNav("back")}
      onClick={onClose}
    >
      <Icon name="arrow-left" size="md" />
    </Button>
  );

  return (
    <div className="search-overlay" role="dialog" aria-modal="true">
      <div className="search-overlay__bar">
        <TopBar
          title={tNav("search")}
          leading={back}
          controlBar={
            <ControlBar>
              <SearchInput
                value={query}
                onChange={onQueryChange}
                placeholder={t("searchPlaceholder")}
                autoFocus
                loading={loading || yearsLoading}
                onSubmit={() => {
                  if (picked) {
                    if (years[0] !== undefined) openYear(years[0]);
                  } else if (results[0]) {
                    pickModel(results[0]);
                  }
                }}
              />
            </ControlBar>
          }
        />
      </div>

      <div className="search-overlay__body">
        <Section padding="default">
          <Container maxWidth="large" gap="default">
            {picked ? (
              yearsLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "var(--spacing-8)",
                  }}
                >
                  <Spinner />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {years.map((year) => (
                    <ListItem
                      key={year}
                      label={`${prettifyMake(picked.make)} ${picked.model} ${year}`}
                      disabled={resolving}
                      onClick={() => openYear(year)}
                    />
                  ))}
                </div>
              )
            ) : trimmed.length === 0 ? (
              recent.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-6)",
                  }}
                >
                  <h2 style={overlineStyle}>{t("recentTitle")}</h2>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {recent.map((r, i) => (
                      <ListItem
                        key={r.id}
                        label={`${prettifyMake(r.make)} ${r.model}`}
                        caption={String(r.year)}
                        showChevron
                        showDivider={i < recent.length - 1}
                        onClick={() => openModel(r.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            ) : (
              results.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {results.map((r) => (
                    <ListItem
                      key={`${r.make}-${r.model}`}
                      label={`${prettifyMake(r.make)} ${r.model}`}
                      onClick={() => pickModel(r)}
                    />
                  ))}
                </div>
              )
            )}
          </Container>
        </Section>
      </div>

      <Toast
        variant="warning"
        open={error}
        onClose={() => setError(false)}
        duration={3000}
      >
        {t("loadFailed")}
      </Toast>
    </div>
  );
}
