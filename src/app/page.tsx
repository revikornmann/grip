"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SearchInput,
  Card,
  Input,
  Button,
  Select,
  Toast,
  type SelectOption,
} from "muka-ui";
import { useTranslations } from "next-intl";
import { listMakes, listModels, listYears, findModelId } from "@/lib/catalog";
import { findMotorcycleModel } from "@/lib/motorcycles";
import { lookupVehicle, RDWError } from "@/lib/rdw";

function toOptions(values: string[]): SelectOption[] {
  return values.map((v) => ({ value: v, label: v }));
}

export default function SearchPage() {
  const t = useTranslations("search");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [plate, setPlate] = useState("");
  const [plateLoading, setPlateLoading] = useState(false);

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

  useEffect(() => {
    listMakes()
      .then(setMakes)
      .catch(() => showToast(t("loadFailed")));
  }, [t]);

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

  const handlePlateSearch = async () => {
    if (!plate.trim()) {
      showToast(t("enterPlate"));
      return;
    }
    setPlateLoading(true);
    try {
      const vehicle = await lookupVehicle(plate);
      const regYear = vehicle.firstRegistrationDate
        ? Number(vehicle.firstRegistrationDate.slice(0, 4))
        : null;
      const match = await findMotorcycleModel(
        vehicle.make,
        vehicle.model,
        regYear,
      );
      if (match) {
        router.push(`/model/${match.id}`);
      } else {
        showToast(t("noMotorcycleData"));
      }
    } catch (e) {
      showToast(e instanceof RDWError ? e.message : t("loadFailed"));
    } finally {
      setPlateLoading(false);
    }
  };

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

      <Card padding="lg">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-4)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>
            {t("plateTitle")}
          </h2>
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-3)",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1 }}>
              <Input
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder={t("platePlaceholder")}
                aria-label={t("plateLabel")}
                fullWidth
              />
            </div>
            <Button
              variant="primary"
              onClick={handlePlateSearch}
              disabled={plateLoading}
            >
              {plateLoading ? t("searching") : t("plateSearch")}
            </Button>
          </div>
        </div>
      </Card>

      <p
        style={{
          margin: 0,
          padding: "0 var(--spacing-1)",
          fontSize: "var(--font-size-xs)",
          fontWeight: "var(--font-weight-semibold)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--color-text-subtle-default)",
        }}
      >
        {t("orSelect")}
      </p>

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
