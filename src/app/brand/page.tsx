"use client";

import { Suspense, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  View,
  Container,
  Card,
  ListItem,
  Button,
  Icon,
  Spinner,
  Toast,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { listModelsRanked } from "@/lib/catalog";
import { prettifyMake } from "@/lib/makes";
import { useAuth } from "@/components/auth/AuthProvider";

const POPULAR_COUNT = 10;

const overlineStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--alias-font-brand-family)",
  fontWeight: 600,
  fontSize: "var(--font-size-md)",
  lineHeight: 1,
  textTransform: "uppercase",
  color: "var(--color-text-subtle-default)",
};

function ModelList({
  models,
  onSelect,
}: {
  models: string[];
  onSelect: (model: string) => void;
}) {
  return (
    <Card padding="none">
      {models.map((model, i) => (
        <ListItem
          key={model}
          label={model}
          showChevron
          showDivider={i < models.length - 1}
          onClick={() => onSelect(model)}
        />
      ))}
    </Card>
  );
}

function BrandContent() {
  const t = useTranslations("search");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const make = searchParams.get("make") ?? "";

  const [ranked, setRanked] = useState<{ model: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);

  // The catalog is readable only by an authenticated session, so wait for
  // AuthProvider before querying (mirrors the Search screen).
  useEffect(() => {
    if (!user || !make) return;
    let cancelled = false;
    listModelsRanked(make)
      .then((rows) => {
        if (!cancelled) setRanked(rows);
      })
      .catch(() => {
        if (!cancelled) setToastOpen(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, make]);

  // "Popular" = most catalog coverage (already ordered by the RPC); "all" is the
  // complete list A–Z. When a make has ≤10 models the popular section alone
  // covers everything, so there's nothing left to list under "all".
  const popular = useMemo(
    () => ranked.slice(0, POPULAR_COUNT).map((r) => r.model),
    [ranked],
  );
  const all = useMemo(
    () =>
      ranked.length > POPULAR_COUNT
        ? [...ranked]
            .map((r) => r.model)
            .sort((a, b) => a.localeCompare(b))
        : [],
    [ranked],
  );

  const goToModel = (model: string) => {
    router.push(
      `/brand/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
    );
  };

  const back = (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={tNav("back")}
      onClick={() => router.push("/")}
    >
      <Icon name="arrow-left" size="md" />
    </Button>
  );

  return (
    <View level="sub" title={prettifyMake(make)} leading={back}>
      <div style={{ padding: "var(--spacing-6) var(--spacing-4)" }}>
        <Container maxWidth="large" gap="none">
          {loading ? (
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-8)",
              }}
            >
              {popular.length > 0 && (
                <section
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-4)",
                  }}
                >
                  <h2 style={overlineStyle}>{t("popularModelsTitle")}</h2>
                  <ModelList models={popular} onSelect={goToModel} />
                </section>
              )}
              {all.length > 0 && (
                <section
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-4)",
                  }}
                >
                  <h2 style={overlineStyle}>{t("allModelsTitle")}</h2>
                  <ModelList models={all} onSelect={goToModel} />
                </section>
              )}
            </div>
          )}
        </Container>
      </div>

      <Toast
        variant="warning"
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={3000}
      >
        {t("loadFailed")}
      </Toast>
    </View>
  );
}

export default function BrandPage() {
  return (
    <Suspense>
      <BrandContent />
    </Suspense>
  );
}
