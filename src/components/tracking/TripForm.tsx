"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, Input, Select, Button, Label, Divider, DatePicker } from "@revikornmann/muka-ui";
import type { Trip, TripInput, TripPurpose } from "@/lib/trips";
import { TRIP_PURPOSE_LABELS, getCategoryFromPurpose } from "@/lib/trips";
import type { GarageVehicle } from "@/types/garage";

interface TripFormProps {
  vehicles: GarageVehicle[];
  selectedVehicleId?: string;
  trip?: Trip; // For editing
  onSave: (input: TripInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const PURPOSE_OPTIONS = Object.entries(TRIP_PURPOSE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function TripForm({
  vehicles,
  selectedVehicleId,
  trip,
  onSave,
  onCancel,
  loading = false,
}: TripFormProps) {
  const t = useTranslations("tripForm");
  const [vehicleId, setVehicleId] = useState(trip?.vehicleId ?? selectedVehicleId ?? vehicles[0]?.id ?? "");
  const [date, setDate] = useState<Date | null>(trip ? new Date(trip.date) : new Date());
  const [startLocation, setStartLocation] = useState(trip?.startLocation ?? "");
  const [endLocation, setEndLocation] = useState(trip?.endLocation ?? "");
  const [distanceKm, setDistanceKm] = useState(trip?.distanceKm ?? 0);
  const [purpose, setPurpose] = useState<TripPurpose>(trip?.purpose ?? "klantbezoek");
  const [notes, setNotes] = useState(trip?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!trip;
  const category = getCategoryFromPurpose(purpose);

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: v.user.nickname || `${v.rdw.merk} ${v.rdw.handelsbenaming}`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !date || !startLocation || !endLocation || distanceKm <= 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        vehicleId,
        date: date.toISOString().split("T")[0],
        startLocation,
        endLocation,
        distanceKm,
        purpose,
        notes: notes || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <h3 style={{ margin: 0, fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            {isEditing ? t("editTitle") : t("addTitle")}
          </h3>

          {/* Vehicle and date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <div>
              <Select
                label={t("vehicle")}
                options={vehicleOptions}
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={loading || submitting}
              />
            </div>
            <div>
              <Label>{t("date")}</Label>
              <DatePicker
                value={date}
                onChange={(d) => setDate(d)}
                max={new Date()}
                size="md"
              />
            </div>
          </div>

          <Divider />

          {/* Locations */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <Input
              label={t("startLocation")}
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder={t("startPlaceholder")}
              disabled={loading || submitting}
            />
            <Input
              label={t("endLocation")}
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder={t("endPlaceholder")}
              disabled={loading || submitting}
            />
          </div>

          {/* Distance and purpose */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <Input
              label={t("distance")}
              type="number"
              value={String(distanceKm)}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              disabled={loading || submitting}
              helperText={t("distanceHelper")}
            />
            <div>
              <Select
                label={t("purpose")}
                options={PURPOSE_OPTIONS}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as TripPurpose)}
                disabled={loading || submitting}
              />
              <p
                style={{
                  margin: "var(--spacing-1) 0 0 0",
                  fontSize: "var(--text-label-sm-regular-fontSize)",
                  color:
                    category === "business"
                      ? "var(--color-state-success-foreground)"
                      : "var(--color-state-warning-foreground)",
                }}
              >
                {category === "business" ? t("categoryBusiness") : t("categoryPrivate")}
              </p>
            </div>
          </div>

          {/* Notes */}
          <Input
            label={t("notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("notesPlaceholder")}
            disabled={loading || submitting}
          />

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)" }}>
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={submitting}
              >
                {t("cancel")}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={loading || submitting || !vehicleId || !startLocation || !endLocation || distanceKm <= 0}
            >
              {submitting ? t("saving") : isEditing ? t("update") : t("add")}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
