"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert, Button, Badge } from "@revikornmann/muka-ui";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { getGarage } from "@/lib/garage";
import { getDefaultInputs, isElectric, isYoungtimer, type CostInputs } from "@/lib/calculator";
import { compareOwnership, type ComparisonResult } from "@/lib/comparison";
import type { GarageVehicle } from "@/types/garage";
import { VehicleSelector } from "@/components/calculator/VehicleSelector";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { DifferenceSummary } from "@/components/compare/DifferenceSummary";
import { ComparisonInputs } from "@/components/compare/ComparisonInputs";
import { BijtellingExplainer } from "@/components/compare/BijtellingExplainer";

export default function ComparePage() {
  const t = useTranslations("compare");
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const searchParams = useSearchParams();
  const vehicleIdFromUrl = searchParams.get("vehicle");

  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(vehicleIdFromUrl);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<Omit<CostInputs, "vehicle"> | null>(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedId) ?? null,
    [vehicles, selectedId],
  );

  // Load garage
  const loadGarage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGarage(userId);
      setVehicles(data);
      // Auto-select from URL or first vehicle
      if (data.length > 0 && !selectedId) {
        setSelectedId(vehicleIdFromUrl || data[0].id);
      }
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedId, vehicleIdFromUrl]);

  useEffect(() => {
    loadGarage();
  }, [loadGarage]);

  // Initialize inputs when vehicle changes
  useEffect(() => {
    if (selectedVehicle) {
      setInputs(getDefaultInputs(selectedVehicle));
    } else {
      setInputs(null);
    }
  }, [selectedVehicle]);

  // Handle input changes
  const handleInputChange = useCallback(
    (updates: Partial<Omit<CostInputs, "vehicle">>) => {
      setInputs((prev) => (prev ? { ...prev, ...updates } : null));
    },
    [],
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    if (selectedVehicle) {
      setInputs(getDefaultInputs(selectedVehicle));
    }
  }, [selectedVehicle]);

  // Calculate comparison
  const comparisonResult: ComparisonResult | null = useMemo(() => {
    if (!selectedVehicle || !inputs) return null;
    return compareOwnership(selectedVehicle, {
      vehicle: selectedVehicle,
      ...inputs,
    });
  }, [selectedVehicle, inputs]);

  if (loading) {
    return null;
  }

  // Empty state
  if (vehicles.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <Alert variant="info" title={t("noVehicles")}>
          {t("noVehiclesDescription")}
        </Alert>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/lookup">
            <Button variant="primary">{t("lookupButton")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "var(--spacing-4)",
      }}
    >
      {/* Vehicle selector */}
      <VehicleSelector
        vehicles={vehicles}
        selectedId={selectedId}
        onSelect={setSelectedId}
        loading={loading}
      />

      {selectedVehicle && inputs && comparisonResult && (
        <>
          {/* EV/Youngtimer badges */}
          {(isElectric(selectedVehicle) || isYoungtimer(selectedVehicle)) && (
            <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
              {isElectric(selectedVehicle) && (
                <Alert variant="info" title={t("evAlert")}>
                  {t("evAlertDescription")}
                </Alert>
              )}
              {isYoungtimer(selectedVehicle) && (
                <Alert variant="warning" title={t("youngtimerAlert")}>
                  {t("youngtimerAlertDescription")}
                </Alert>
              )}
            </div>
          )}

          {/* Main comparison result */}
          <DifferenceSummary result={comparisonResult} />

          {/* Two-column layout for inputs and table on larger screens */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "var(--spacing-4)",
            }}
          >
            {/* Comparison inputs */}
            <ComparisonInputs
              inputs={inputs}
              onChange={handleInputChange}
              onReset={handleReset}
            />

            {/* Bijtelling explainer */}
            <BijtellingExplainer
              vehicle={selectedVehicle}
              taxBracket={inputs.taxBracket}
            />
          </div>

          {/* Detailed comparison table */}
          <ComparisonTable result={comparisonResult} />

          {/* Disclaimer */}
          <Alert variant="info" title={t("disclaimerTitle")}>
            {t("disclaimerText")}
          </Alert>

          {/* Back to calculator CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "var(--spacing-4)",
            }}
          >
            <Link href={`/calculator?vehicle=${selectedId}`}>
              <Button variant="secondary">{t("backToCalculator")}</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
