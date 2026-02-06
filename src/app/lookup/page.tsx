"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input, Button, Alert, Toast } from "muka-ui";
import { lookupVehicle, RDWError } from "@/lib/rdw";
import {
  isValidDutchPlate,
  normalizePlate,
  formatPlateDisplay,
} from "@/lib/validation";
import { storage } from "@/lib/storage";
import { isInGarage as checkIsInGarage, addVehicle } from "@/lib/garage";
import type { Vehicle, RecentLookup } from "@/types/vehicle";
import type { GarageVehicle } from "@/types/garage";
import { VehicleCard } from "@/components/lookup/VehicleCard";
import { RecentLookups } from "@/components/lookup/RecentLookups";
import { VehicleFormModal } from "@/components/garage/VehicleFormModal";

const RECENT_LOOKUPS_KEY = "recent-lookups";
const MAX_RECENT = 5;
const MAX_RETRIES = 3;

function LookupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasInitRef = useRef(false);

  const [plate, setPlate] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<{
    message: string;
    code: string;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [recentLookups, setRecentLookups] = useState<RecentLookup[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [vehicleInGarage, setVehicleInGarage] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Focus input on mount
  useEffect(() => {
    document.getElementById("plate")?.focus();
  }, []);

  // Load recent lookups from storage on mount
  useEffect(() => {
    const recent = storage.get<RecentLookup[]>(RECENT_LOOKUPS_KEY);
    if (recent) setRecentLookups(recent);
  }, []);

  const performLookup = useCallback(
    async (normalized: string) => {
      setIsLoading(true);
      setApiError(null);
      setVehicle(null);
      setVehicleInGarage(false);

      try {
        const result = await lookupVehicle(normalized);
        setVehicle(result);
        setRetryCount(0);

        // Update URL
        const formatted = formatPlateDisplay(normalized);
        router.replace(`/lookup?plate=${formatted}`, { scroll: false });

        // Check if already in garage
        setVehicleInGarage(checkIsInGarage(result.plate));

        // Save to recent lookups
        const lookup: RecentLookup = {
          plate: result.plate,
          make: result.make,
          model: result.model,
          lookedUpAt: new Date().toISOString(),
        };
        setRecentLookups((prev) => {
          const filtered = prev.filter((r) => r.plate !== result.plate);
          const updated = [lookup, ...filtered].slice(0, MAX_RECENT);
          storage.set(RECENT_LOOKUPS_KEY, updated);
          return updated;
        });
      } catch (err) {
        if (err instanceof RDWError) {
          setApiError({ message: err.message, code: err.code });
        } else {
          setApiError({
            message: "Er is een onbekende fout opgetreden",
            code: "UNKNOWN",
          });
        }
        console.error("[RDW Lookup Error]", err);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  // Auto-lookup from URL param on mount
  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;

    const plateParam = searchParams.get("plate");
    if (!plateParam) return;

    const normalized = normalizePlate(plateParam);
    setPlate(formatPlateDisplay(normalized));

    if (isValidDutchPlate(normalized)) {
      performLookup(normalized);
    } else {
      setValidationError("Ongeldig kenteken in URL");
    }
  }, [searchParams, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePlate(plate);

    if (!normalized) {
      setValidationError("Voer een kenteken in");
      return;
    }

    if (!isValidDutchPlate(normalized)) {
      setValidationError("Voer een geldig Nederlands kenteken in");
      return;
    }

    setValidationError(null);
    setRetryCount(0);
    performLookup(normalized);
  };

  const handleRetry = () => {
    const newCount = retryCount + 1;
    setRetryCount(newCount);

    if (newCount >= MAX_RETRIES) {
      setApiError({
        message: "Meerdere pogingen mislukt. Probeer het later opnieuw.",
        code: "UNKNOWN",
      });
      return;
    }

    const normalized = normalizePlate(plate);
    performLookup(normalized);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setPlate(value);
    if (validationError) setValidationError(null);
    if (apiError) setApiError(null);
  };

  const handleBlur = () => {
    const normalized = normalizePlate(plate);
    if (normalized && !isValidDutchPlate(normalized)) {
      setValidationError("Voer een geldig Nederlands kenteken in");
    }
  };

  const handleRecentSelect = (selectedPlate: string) => {
    const formatted = formatPlateDisplay(selectedPlate);
    setPlate(formatted);
    setValidationError(null);
    setApiError(null);
    performLookup(selectedPlate);
  };

  const handleClearHistory = () => {
    setRecentLookups([]);
    storage.remove(RECENT_LOOKUPS_KEY);
  };

  const handleAddToGarage = () => {
    if (!vehicle) return;

    if (vehicleInGarage) {
      router.push("/garage");
      return;
    }

    setFormOpen(true);
  };

  const handleFormSave = (
    rdw: GarageVehicle["rdw"],
    user: GarageVehicle["user"],
  ) => {
    addVehicle(rdw, user);
    setVehicleInGarage(true);
    setFormOpen(false);
    setToastMessage(
      `${vehicle?.make} ${vehicle?.model} toegevoegd aan garage`,
    );
    setToastOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMessage("Link gekopieerd");
      setToastOpen(true);
    } catch {
      setToastMessage("Kopiëren mislukt");
      setToastOpen(true);
    }
  };

  const isSubmitDisabled =
    isLoading || !plate.trim() || !isValidDutchPlate(normalizePlate(plate));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-6)",
      }}
    >
      {/* Search form */}
      {/* onBlur wrapper captures blur from child Input for validation */}
      <div onBlur={handleBlur}>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "var(--spacing-3)",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              label="Kenteken"
              placeholder="Bijv. AB-123-CD"
              value={plate}
              onChange={handleInputChange}
              error={!!validationError}
              errorMessage={validationError ?? undefined}
              disabled={isLoading}
              fullWidth
              name="plate"
            />
          </div>
          <div style={{ paddingTop: "var(--spacing-6)" }}>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitDisabled}
            >
              {isLoading ? "Zoeken..." : "Zoeken"}
            </Button>
          </div>
        </form>
      </div>

      {/* API error */}
      {apiError && (
        <Alert variant="error" title={apiError.message}>
          {apiError.code === "NOT_FOUND" ? (
            "Controleer het kenteken op typfouten en probeer het opnieuw."
          ) : retryCount >= MAX_RETRIES ? (
            "Er zijn meerdere pogingen mislukt. Probeer het later opnieuw."
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-3)",
                marginTop: "var(--spacing-2)",
              }}
            >
              <span>Controleer uw verbinding en probeer het opnieuw.</span>
              {retryCount < MAX_RETRIES && (
                <Button variant="secondary" size="sm" onClick={handleRetry}>
                  Opnieuw proberen
                </Button>
              )}
            </div>
          )}
        </Alert>
      )}

      {/* Vehicle result */}
      {vehicle && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-4)",
          }}
        >
          <VehicleCard vehicle={vehicle} />

          {/* Actions */}
          <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
            <Button variant="primary" onClick={handleAddToGarage}>
              {vehicleInGarage
                ? "Bekijk in garage"
                : "Toevoegen aan garage"}
            </Button>
            <Button variant="secondary" onClick={handleCopyLink}>
              Kopieer link
            </Button>
          </div>
        </div>
      )}

      {/* Recent lookups */}
      <RecentLookups
        lookups={recentLookups}
        onSelect={handleRecentSelect}
        onClear={handleClearHistory}
      />

      {/* Add to garage form modal */}
      <VehicleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
        rdwData={vehicle ?? undefined}
      />

      {/* Toast notifications */}
      <Toast
        variant="success"
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={3000}
      >
        {toastMessage}
      </Toast>
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense>
      <LookupContent />
    </Suspense>
  );
}
