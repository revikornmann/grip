"use client";

import { useTranslations } from "next-intl";
import { SettingsOptionView } from "@/components/settings/SettingsOptionView";
import { useRegion } from "@/components/RegionProvider";
import { regionOptions, regionLabelKeys } from "@/lib/regions";

export default function RegionSettingsPage() {
  const t = useTranslations("settings");
  const tRegion = useTranslations("region");
  const { region, setRegion } = useRegion();

  return (
    <SettingsOptionView
      title={t("region")}
      name="region"
      options={regionOptions.map((r) => ({
        value: r,
        label: tRegion(regionLabelKeys[r]),
      }))}
      selected={region}
      onSelect={setRegion}
    />
  );
}
