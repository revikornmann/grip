"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SearchInput,
  Card,
  Select,
  ListItem,
  Icon,
  Toast,
  type SelectOption,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import {
  listMakes,
  listModels,
  listYears,
  findModelId,
  listRecentModels,
} from "@/lib/catalog";
import {
  getRecentSearches,
  seedRecentSearches,
  type RecentSearch,
} from "@/lib/recentSearches";
import { useAuth } from "@/components/auth/AuthProvider";

function toOptions(values: string[]): SelectOption[] {
  return values.map((v) => ({ value: v, label: v }));
}

export default function SearchPage() {
  const t = useTranslations("search");
  const router = useRouter();
  const { user } = useAuth();

  const [query, setQuery] = useState("");

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const [recent, setRecent] = useState<RecentSearch[]>([]);

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

  // Show any stored recent searches immediately (no auth needed for localStorage).
  useEffect(() => {
    const stored = getRecentSearches();
    if (stored.length > 0) setRecent(stored);
  }, []);

  // First-time fallback: once authenticated, seed from the most recent catalog
  // entries so the section isn't empty before the user has previewed anything.
  useEffect(() => {
    if (!user) return;
    if (getRecentSearches().length > 0) return;
    listRecentModels()
      .then((models) => setRecent(seedRecentSearches(models)))
      .catch(() => {
        /* leave the section empty if the catalog can't be read */
      });
  }, [user]);

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-5)",
      }}
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t("searchPlaceholder")}
      />

      {recent.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-3)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>
            {t("recentTitle")}
          </h2>
          <Card padding="none">
            {recent.map((r, i) => (
              <ListItem
                key={r.id}
                label={`${r.make} ${r.model}`}
                caption={String(r.year)}
                leadingIcon={<Icon name="motorbike" />}
                showChevron
                showDivider={i < recent.length - 1}
                onClick={() => router.push(`/model/${r.id}`)}
              />
            ))}
          </Card>
        </div>
      )}

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
            options={toOptions(makes)}
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
