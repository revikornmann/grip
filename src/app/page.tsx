"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Select,
  ListItem,
  Toast,
  type SelectOption,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { listMakes, listModels, listYears, findModelId } from "@/lib/catalog";
import { useRecentSearches } from "@/lib/useRecentSearches";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRegion } from "@/components/RegionProvider";
import { popularBrandsForRegion, regionLabelKeys } from "@/lib/regions";
import { prettifyMake } from "@/lib/makes";

function toOptions(values: string[]): SelectOption[] {
  return values.map((v) => ({ value: v, label: v }));
}

/** Make options keep the raw catalog value but show a prettified label. */
function toMakeOptions(values: string[]): SelectOption[] {
  return values.map((v) => ({ value: v, label: prettifyMake(v) }));
}

const overlineStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--alias-font-brand-family)",
  fontWeight: 600,
  fontSize: "var(--font-size-md)",
  lineHeight: 1,
  textTransform: "uppercase",
  color: "var(--color-text-subtle-default)",
};

export default function SearchPage() {
  const t = useTranslations("search");
  const tRegion = useTranslations("region");
  const router = useRouter();
  const { user } = useAuth();
  const { region } = useRegion();
  const recent = useRecentSearches(5);

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastOpen(true);
  };

  // The catalog tables are readable only by an authenticated session, so wait
  // for AuthProvider to establish one (anonymous or Google) before querying.
  useEffect(() => {
    if (!user) return;
    listMakes()
      .then(setMakes)
      .catch(() => showToast(t("loadFailed")));
  }, [user, t]);

  useEffect(() => {
    setModel("");
    setYear("");
    setModels([]);
    setYears([]);
    if (!make) return;
    listModels(make)
      .then(setModels)
      .catch(() => showToast(t("loadFailed")));
  }, [make, t]);

  useEffect(() => {
    setYear("");
    setYears([]);
    if (!make || !model) return;
    listYears(make, model)
      .then(setYears)
      .catch(() => showToast(t("loadFailed")));
  }, [make, model, t]);

  // Navigate to the catalog preview once all three selects are set.
  useEffect(() => {
    if (!make || !model || !year) return;
    let cancelled = false;
    findModelId(make, model, Number(year))
      .then((id) => {
        if (!cancelled && id) router.push(`/model/${id}`);
      })
      .catch(() => {
        if (!cancelled) showToast(t("loadFailed"));
      });
    return () => {
      cancelled = true;
    };
  }, [make, model, year, router, t]);

  const popularBrands = popularBrandsForRegion(region, makes);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-8)",
      }}
    >
      {/* Recently viewed */}
      {recent.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-6)",
          }}
        >
          <h2 style={overlineStyle}>{t("recentTitle")}</h2>
          <Card padding="none">
            {recent.map((r, i) => (
              <ListItem
                key={r.id}
                label={`${prettifyMake(r.make)} ${r.model}`}
                caption={String(r.year)}
                showChevron
                showDivider={i < recent.length - 1}
                onClick={() => router.push(`/model/${r.id}`)}
              />
            ))}
          </Card>
        </div>
      )}

      {/* Popular brands in {region} */}
      {popularBrands.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-6)",
          }}
        >
          <h2 style={overlineStyle}>
            {t("popularBrandsTitle", { region: tRegion(regionLabelKeys[region]) })}
          </h2>
          <Card padding="none">
            {popularBrands.map((brand, i) => (
              <ListItem
                key={brand}
                label={prettifyMake(brand)}
                showChevron
                showDivider={i < popularBrands.length - 1}
                onClick={() =>
                  router.push(`/brand?make=${encodeURIComponent(brand)}`)
                }
              />
            ))}
          </Card>
        </div>
      )}

      {/* Browse all motorcycles */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-6)",
        }}
      >
        <h2 style={overlineStyle}>{t("browseAllTitle")}</h2>
        <Card padding="lg">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-4)",
            }}
          >
            <Select
              label={t("make")}
              placeholder={t("selectPlaceholder")}
              options={toMakeOptions(makes)}
              value={make}
              onChange={(e) => setMake(e.target.value)}
              fullWidth
            />
            <Select
              label={t("model")}
              placeholder={t("selectPlaceholder")}
              options={toOptions(models)}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!make}
              fullWidth
            />
            <Select
              label={t("year")}
              placeholder={t("selectPlaceholder")}
              options={toOptions(years.map(String))}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={!model}
              fullWidth
            />
          </div>
        </Card>
      </div>

      <Toast
        variant="warning"
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={3000}
      >
        {toastMsg}
      </Toast>
    </div>
  );
}
