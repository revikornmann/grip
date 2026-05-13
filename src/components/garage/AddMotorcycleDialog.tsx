"use client";

import { useState } from "react";
import { Dialog, Input, Button, Alert } from "muka-ui";
import { useTranslations } from "next-intl";
import { createMotorcycle } from "@/lib/motorcycles";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onCreated: () => void;
}

export function AddMotorcycleDialog({
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

  const handleClose = () => {
    if (saving) return;
    reset();
    onOpenChange(false);
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
    <Dialog
      open={open}
      onClose={handleClose}
      size="lg"
      modal
      title={t("title")}
      mobileLeadingLabel={t("cancel")}
      onMobileLeadingClick={handleClose}
      mobileTrailingLabel={saving ? t("saving") : t("save")}
      onMobileTrailingClick={handleSave}
      footerActions={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-4)",
        }}
      >
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
      </div>
    </Dialog>
  );
}
