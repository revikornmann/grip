"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  TopBar,
  SearchInput,
  Button,
  Icon,
  ListItem,
  Section,
  Container,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { searchModels } from "@/lib/catalog";
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
 * either navigates to the model preview. Rendered as a fixed overlay so it
 * covers the bottom navigation, matching the sub-level view in the design.
 */
export function SearchOverlay({ onClose }: Props) {
  const t = useTranslations("search");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const recent = useRecentSearches(10);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmed = query.trim();

  // Debounced catalog search while typing.
  useEffect(() => {
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
  }, [trimmed]);

  // Close on Escape (desktop / hardware keyboard).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const openModel = (id: string) => {
    onClose();
    router.push(`/model/${id}`);
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
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t("searchPlaceholder")}
              autoFocus
              loading={loading}
              onSubmit={() => {
                if (results[0]) openModel(results[0].id);
              }}
            />
          }
        />
      </div>

      <div className="search-overlay__body">
        <Section padding="default">
          <Container maxWidth="large" gap="default">
            {trimmed.length === 0
              ? recent.length > 0 && (
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
                          label={`${r.make} ${r.model}`}
                          caption={String(r.year)}
                          showChevron
                          showDivider={i < recent.length - 1}
                          onClick={() => openModel(r.id)}
                        />
                      ))}
                    </div>
                  </div>
                )
              : results.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {results.map((r) => (
                      <ListItem
                        key={`${r.make}-${r.model}`}
                        label={`${r.make} ${r.model}`}
                        onClick={() => openModel(r.id)}
                      />
                    ))}
                  </div>
                )}
          </Container>
        </Section>
      </div>
    </div>
  );
}
