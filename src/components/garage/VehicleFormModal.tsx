"use client";

import { useState } from "react";
import { Dialog, Input, Button, RadioTile } from "muka-ui";
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

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
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
  const isEdit = !!vehicle;
  const title = isEdit ? "Voertuig bewerken" : "Voertuig toevoegen";
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
      next.purchasePrice = "Voer een prijs in tussen € 0 en € 500.000";
    }
    if (!annualKm || isNaN(annual) || annual < 0 || annual > 100000) {
      next.annualKm = "Voer een waarde in tussen 0 en 100.000 km";
    }
    if (isNaN(business) || business < 0) {
      next.businessKm = "Voer een geldige waarde in";
    } else if (business > annual) {
      next.businessKm = "Zakelijke km mag niet hoger zijn dan totale km";
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
          aria-label="Sluiten"
        >
          <CloseIcon />
        </Button>
      }
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--spacing-3)",
            padding: "var(--spacing-4)",
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Annuleren
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {isEdit ? "Opslaan" : "Sla op"}
          </Button>
        </div>
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
          label="Aankoopprijs (€)"
          type="number"
          value={purchasePrice}
          onChange={(e) => {
            setPurchasePrice(e.target.value);
            if (errors.purchasePrice) clearError("purchasePrice");
          }}
          helperText={
            catalogPrice
              ? `Catalogusprijs: ${formatCurrency(catalogPrice, 0)}`
              : "Werkelijke of verwachte aankoopprijs"
          }
          error={!!errors.purchasePrice}
          errorMessage={errors.purchasePrice}
          required
          fullWidth
        />

        {/* Annual km */}
        <Input
          label="Jaarkilometers"
          type="number"
          value={annualKm}
          onChange={(e) => {
            setAnnualKm(e.target.value);
            if (errors.annualKm) clearError("annualKm");
          }}
          helperText="Gemiddeld rijden Nederlanders 15.000 km per jaar"
          error={!!errors.annualKm}
          errorMessage={errors.annualKm}
          required
          fullWidth
        />

        {/* Business km */}
        <Input
          label="Zakelijke kilometers"
          type="number"
          value={businessKm}
          onChange={(e) => {
            setBusinessKm(e.target.value);
            if (errors.businessKm) clearError("businessKm");
          }}
          helperText="Aantal km per jaar voor zakelijk gebruik"
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
            Eigendomstype
          </p>
          <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
            <RadioTile
              label="Privé"
              caption="Eigen voertuig"
              name="ownershipType"
              value="private"
              checked={ownershipType === "private"}
              onChange={() => setOwnershipType("private")}
            />
            <RadioTile
              label="Zakelijk"
              caption="Op de zaak"
              name="ownershipType"
              value="business"
              checked={ownershipType === "business"}
              onChange={() => setOwnershipType("business")}
            />
          </div>
        </div>

        {/* Nickname (optional) */}
        <Input
          label="Bijnaam"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Bijv. 'Dagelijkse auto'"
          helperText="Optioneel"
          fullWidth
        />

        {/* Notes (optional) */}
        <Input
          label="Notities"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Eventuele opmerkingen"
          helperText="Optioneel"
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
