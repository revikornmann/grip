"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert, Button } from "muka-ui";
import { useAuth } from "@/components/auth/AuthProvider";
import { getGarage } from "@/lib/garage";
import {
  calculateCosts,
  getDefaultInputs,
  type CostInputs,
  type CostBreakdown,
} from "@/lib/calculator";
import type { GarageVehicle } from "@/types/garage";
import { VehicleSelector } from "@/components/calculator/VehicleSelector";
import { CostInputs as CostInputsForm } from "@/components/calculator/CostInputs";
import { CostBreakdown as CostBreakdownDisplay } from "@/components/calculator/CostBreakdown";
import { CostSummary } from "@/components/calculator/CostSummary";
import Link from "next/link";

export default function CalculatorPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      // Auto-select first vehicle if none selected
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedId]);

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

  // Calculate costs
  const breakdown: CostBreakdown | null = useMemo(() => {
    if (!selectedVehicle || !inputs) return null;
    return calculateCosts({
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
        <Alert variant="info" title="Geen voertuigen">
          Voeg eerst een voertuig toe aan je garage om de kosten te berekenen.
        </Alert>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/lookup">
            <Button variant="primary">Voertuig opzoeken</Button>
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

      {selectedVehicle && inputs && breakdown && (
        <>
          {/* Two-column layout for inputs and summary on larger screens */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "var(--spacing-4)",
            }}
          >
            {/* Cost inputs */}
            <CostInputsForm
              inputs={inputs}
              vehicle={selectedVehicle}
              onChange={handleInputChange}
              onReset={handleReset}
            />

            {/* Cost summary */}
            <CostSummary
              breakdown={breakdown}
              annualKilometers={inputs.annualKilometers}
              ownershipType={selectedVehicle.user.ownershipType}
            />
          </div>

          {/* Cost breakdown table */}
          <CostBreakdownDisplay
            breakdown={breakdown}
            ownershipType={selectedVehicle.user.ownershipType}
          />

          {/* Compare CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "var(--spacing-4)",
            }}
          >
            <Link href={`/compare?vehicle=${selectedId}`}>
              <Button variant="secondary">
                Vergelijk privé vs zakelijk eigendom
              </Button>
            </Link>
          </div>

          {/* Disclaimer */}
          <Alert variant="info" title="Disclaimer">
            Deze berekening is indicatief en gebaseerd op gemiddelde waarden.
            Raadpleeg een boekhouder voor definitief advies over uw specifieke
            situatie.
          </Alert>
        </>
      )}
    </div>
  );
}
