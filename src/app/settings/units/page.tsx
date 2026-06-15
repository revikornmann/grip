"use client";

import { useTranslations } from "next-intl";
import { SettingsOptionView } from "@/components/settings/SettingsOptionView";
import { useUnits } from "@/components/UnitsProvider";
import { unitsOptions, unitsLabelKeys } from "@/lib/units";

export default function UnitsSettingsPage() {
  const t = useTranslations("settings");
  const { units, setUnits } = useUnits();

  return (
    <SettingsOptionView
      title={t("units")}
      name="units"
      options={unitsOptions.map((u) => ({ value: u, label: t(unitsLabelKeys[u]) }))}
      selected={units}
      onSelect={setUnits}
    />
  );
}
