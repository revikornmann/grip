"use client";

import { useState } from "react";
import { Dialog, Input, Button, RadioTile, Icon } from "muka-ui";
import { useTranslations } from "next-intl";
import type { GarageVehicle } from "@/types/garage";
import type { Vehicle } from "@/types/vehicle";
import { formatCurrency } from "@/lib/formatting";

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (rdw: GarageVehicle["rdw"], user: GarageVehicle["user"]) => void;
  /** Existing garage vehicle — edit mode */
  vehicle?: GarageVehicle;
  /** Fresh lookup result — add mode */
  rdwData?: Vehicle;
}

/**
 * Inner form component — mounts fresh each time the dialog opens,
 * so useState initializers handle "reset" without useEffect.
 */
function VehicleFormInner({
  onClose,
  onSave,
  vehicle,
  rdwData,
}: Omit<VehicleFormModalProps, "open">) {
  const t = useTranslations("vehicleForm");
  const isEdit = !!vehicle;
  const title = isEdit ? t("editTitle") : t("addTitle");
  const catalogPrice = vehicle?.rdw.catalogusprijs ?? rdwData?.catalogPrice;

  const [purchasePrice, setPurchasePrice] = useState(
    vehicle
      ? String(vehicle.user.purchasePrice)
      : catalogPrice
        ? String(catalogPrice)
        : "",
  );
  const [annualKm, setAnnualKm] = useState(
    vehicle ? String(vehicle.user.annualKilometers) : "15000",
  );
  const [businessKm, setBusinessKm] = useState(
    vehicle ? String(vehicle.user.businessKilometers) : "0",
  );
  const [ownershipType, setOwnershipType] = useState<"private" | "business">(
    vehicle?.user.ownershipType ?? "private",
  );
  const [nickname, setNickname] = useState(vehicle?.user.nickname ?? "");
  const [notes, setNotes] = useState(vehicle?.user.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const price = Number(purchasePrice);
    const annual = Number(annualKm);
    const business = Number(businessKm);

    if (!purchasePrice || isNaN(price) || price < 0 || price > 500000) {
      next.purchasePrice = t("purchasePriceError");
    }
    if (!annualKm || isNaN(annual) || annual < 0 || annual > 100000) {
      next.annualKm = t("annualKmError");
    }
    if (isNaN(business) || business < 0) {
      next.businessKm = t("businessKmError");
    } else if (business > annual) {
      next.businessKm = t("businessKmExceedsTotal");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const rdw: GarageVehicle["rdw"] = vehicle
      ? vehicle.rdw
      : {
          kenteken: rdwData!.plate,
          merk: rdwData!.make,
          handelsbenaming: rdwData!.model,
          brandstof_omschrijving: rdwData!.fuelType,
          co2_uitstoot_gecombineerd: rdwData!.co2Emissions,
          datum_eerste_toelating: rdwData!.firstRegistrationDate,
          catalogusprijs: rdwData!.catalogPrice,
          bruto_bpm: rdwData!.bpmAmount,
        };

    const user: GarageVehicle["user"] = {
      purchasePrice: Number(purchasePrice),
      annualKilometers: Number(annualKm),
      businessKilometers: Number(businessKm),
      ownershipType,
      nickname: nickname.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(rdw, user);
  };

  const clearError = (key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const vehicleName = vehicle
    ? `${vehicle.rdw.merk} ${vehicle.rdw.handelsbenaming}`
    : rdwData
      ? `${rdwData.make} ${rdwData.model}`
      : "";

  return (
    <Dialog
      open
      onClose={onClose}
      size="sm"
      title={title}
      trailing={
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onClose}
          aria-label={t("close")}
        >
          <Icon name="x" size="sm" />
        </Button>
      }
      footerActions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {isEdit ? t("save") : t("saveShort")}
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
        {/* Vehicle name (read-only context) */}
        {vehicleName && (
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle-default)",
              margin: 0,
            }}
          >
            {vehicleName}
          </p>
        )}

        {/* Purchase price */}
        <Input
          label={t("purchasePrice")}
          type="number"
          value={purchasePrice}
          onChange={(e) => {
            setPurchasePrice(e.target.value);
            if (errors.purchasePrice) clearError("purchasePrice");
          }}
          helperText={
            catalogPrice
              ? t("catalogPrice", { price: formatCurrency(catalogPrice, 0) })
              : t("purchasePriceHelper")
          }
          error={!!errors.purchasePrice}
          errorMessage={errors.purchasePrice}
          required
          fullWidth
        />

        {/* Annual km */}
        <Input
          label={t("annualKm")}
          type="number"
          value={annualKm}
          onChange={(e) => {
            setAnnualKm(e.target.value);
            if (errors.annualKm) clearError("annualKm");
          }}
          helperText={t("annualKmHelper")}
          error={!!errors.annualKm}
          errorMessage={errors.annualKm}
          required
          fullWidth
        />

        {/* Business km */}
        <Input
          label={t("businessKm")}
          type="number"
          value={businessKm}
          onChange={(e) => {
            setBusinessKm(e.target.value);
            if (errors.businessKm) clearError("businessKm");
          }}
          helperText={t("businessKmHelper")}
          error={!!errors.businessKm}
          errorMessage={errors.businessKm}
          required
          fullWidth
        />

        {/* Ownership type */}
        <div>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              marginBottom: "var(--spacing-2)",
              margin: 0,
              paddingBottom: "var(--spacing-2)",
            }}
          >
            {t("ownershipType")}
          </p>
          <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
            <RadioTile
              label={t("ownershipPrivate")}
              caption={t("ownershipPrivateCaption")}
              name="ownershipType"
              value="private"
              checked={ownershipType === "private"}
              onChange={() => setOwnershipType("private")}
            />
            <RadioTile
              label={t("ownershipBusiness")}
              caption={t("ownershipBusinessCaption")}
              name="ownershipType"
              value="business"
              checked={ownershipType === "business"}
              onChange={() => setOwnershipType("business")}
            />
          </div>
        </div>

        {/* Nickname (optional) */}
        <Input
          label={t("nickname")}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t("nicknamePlaceholder")}
          helperText={t("optional")}
          fullWidth
        />

        {/* Notes (optional) */}
        <Input
          label={t("notes")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          helperText={t("optional")}
          fullWidth
        />
      </div>
    </Dialog>
  );
}

export function VehicleFormModal({ open, ...rest }: VehicleFormModalProps) {
  if (!open) return null;
  return <VehicleFormInner {...rest} />;
}
