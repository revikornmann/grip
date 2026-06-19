"use client";

import { Suspense, useEffect, useState, type CSSProperties } from "react";
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
import { listYears, findModelId } from "@/lib/catalog";
import { prettifyMake } from "@/lib/makes";
import { useAuth } from "@/components/auth/AuthProvider";

const overlineStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--alias-font-brand-family)",
  fontWeight: 600,
  fontSize: "var(--font-size-md)",
  lineHeight: 1,
  textTransform: "uppercase",
  color: "var(--color-text-subtle-default)",
};

function YearsContent() {
  const t = useTranslations("search");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const make = searchParams.get("make") ?? "";
  const model = searchParams.get("model") ?? "";

  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (!user || !make || !model) return;
    let cancelled = false;
    listYears(make, model)
      .then((rows) => {
        if (!cancelled) setYears(rows);
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
  }, [user, make, model]);

  // Resolve the specific catalog row for make+model+year, then hand off to the
  // shared model detail page.
  const goToYear = async (year: number) => {
    if (resolving) return;
    setResolving(true);
    try {
      const id = await findModelId(make, model, year);
      if (id) router.push(`/model/${id}`);
      else setToastOpen(true);
    } catch {
      setToastOpen(true);
    } finally {
      setResolving(false);
    }
  };

  const back = (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={tNav("back")}
      onClick={() => router.push(`/brand?make=${encodeURIComponent(make)}`)}
    >
      <Icon name="arrow-left" size="md" />
    </Button>
  );

  const title = [make && prettifyMake(make), model].filter(Boolean).join(" ");

  return (
    <View level="sub" title={title} leading={back}>
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
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-4)",
              }}
            >
              <h2 style={overlineStyle}>{t("year")}</h2>
              <Card padding="none">
                {years.map((year, i) => (
                  <ListItem
                    key={year}
                    label={String(year)}
                    showChevron
                    showDivider={i < years.length - 1}
                    onClick={() => goToYear(year)}
                  />
                ))}
              </Card>
            </section>
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

export default function YearsPage() {
  return (
    <Suspense>
      <YearsContent />
    </Suspense>
  );
}
