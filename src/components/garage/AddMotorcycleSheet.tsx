"use client";

import { useState } from "react";
import { Sheet, Input, Button, Alert } from "muka-ui";
import { useTranslations } from "next-intl";
import { createMotorcycle } from "@/lib/motorcycles";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onCreated: () => void;
}

export function AddMotorcycleSheet({
  open,
  onOpenChange,
  userId,
  onCreated,
}: Props) {
  const t = useTranslations("motorcycleForm");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [nickname, setNickname] = useState("");
  const [mileage, setMileage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setMake("");
    setModel("");
    setYear("");
    setNickname("");
    setMileage("");
    setError(null);
    setSaving(false);
  };

  const handleSave = async () => {
    setError(null);
    if (!make.trim() || !model.trim()) {
      setError(t("requireMakeModel"));
      return;
    }
    setSaving(true);
    try {
      await createMotorcycle(
        {
          make: make.trim(),
          model: model.trim(),
          year: year ? Number(year) : undefined,
          nickname: nickname.trim() || undefined,
          mileageKm: mileage ? Number(mileage) : undefined,
        },
        userId,
      );
      reset();
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("saveFailed"));
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
      snapPoints={[0.6, 0.95]}
      title={t("title")}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-4)",
          padding: "var(--spacing-4) var(--spacing-4) var(--spacing-6)",
        }}
      >
        <h2
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
          }}
        >
          {t("title")}
        </h2>

        {error && <Alert variant="error">{error}</Alert>}

        <Input
          label={t("make")}
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder={t("makePlaceholder")}
          required
          fullWidth
        />
        <Input
          label={t("model")}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={t("modelPlaceholder")}
          required
          fullWidth
        />
        <Input
          label={t("year")}
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder={t("yearPlaceholder")}
          helperText={t("optional")}
          fullWidth
        />
        <Input
          label={t("mileage")}
          type="number"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          placeholder={t("mileagePlaceholder")}
          helperText={t("optional")}
          fullWidth
        />
        <Input
          label={t("nickname")}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t("nicknamePlaceholder")}
          helperText={t("optional")}
          fullWidth
        />

        <div
          style={{
            display: "flex",
            gap: "var(--spacing-3)",
            marginTop: "var(--spacing-2)",
          }}
        >
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            fullWidth
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            fullWidth
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
