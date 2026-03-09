"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Select, Dialog, Button, Alert, Toast, Icon } from "muka-ui";
import { useTranslations } from "next-intl";
import type { GarageVehicle } from "@/types/garage";
import {
  getGarage,
  addVehicle,
  updateVehicle,
  removeVehicle,
  duplicateVehicle,
  updateVehicleRdw,
  vehicleToRdw,
} from "@/lib/garage";
import { lookupVehicle } from "@/lib/rdw";
import { useAuth } from "@/components/auth/AuthProvider";
import { GarageCard } from "@/components/garage/GarageCard";
import { EmptyGarage } from "@/components/garage/EmptyGarage";
import { VehicleFormModal } from "@/components/garage/VehicleFormModal";

const PENDING_VEHICLE_KEY = "pendingVehicle";

type SortKey = "addedAt" | "name" | "price";

function sortVehicles(
  vehicles: GarageVehicle[],
  key: SortKey,
): GarageVehicle[] {
  const sorted = [...vehicles];
  switch (key) {
    case "addedAt":
      return sorted.sort(
        (a, b) =>
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      );
    case "name":
      return sorted.sort((a, b) => {
        const nameA = `${a.rdw.merk} ${a.rdw.handelsbenaming}`.toLowerCase();
        const nameB = `${b.rdw.merk} ${b.rdw.handelsbenaming}`.toLowerCase();
        return nameA.localeCompare(nameB, "nl");
      });
    case "price":
      return sorted.sort(
        (a, b) => b.user.purchasePrice - a.user.purchasePrice,
      );
  }
}

export default function GaragePage() {
  const t = useTranslations("garage");
  const { user, migrationResult } = useAuth();
  const userId = user?.id ?? null;
  const pendingProcessed = useRef(false);

  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("addedAt");
  const [garageLoading, setGarageLoading] = useState(true);

  const SORT_OPTIONS = [
    { value: "addedAt", label: t("sortDateAdded") },
    { value: "name", label: t("sortMakeModel") },
    { value: "price", label: t("sortPrice") },
  ];

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<
    GarageVehicle | undefined
  >(undefined);

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<
    GarageVehicle | undefined
  >(undefined);

  // Refresh state
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "warning">("success");

  const reload = useCallback(async () => {
    setGarageLoading(true);
    try {
      const data = await getGarage(userId);
      setVehicles(data);
    } catch {
      setVehicles([]);
    } finally {
      setGarageLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Process pending vehicle from sessionStorage (after auth redirect)
  useEffect(() => {
    if (pendingProcessed.current || !userId || garageLoading) return;
    pendingProcessed.current = true;

    try {
      const raw = sessionStorage.getItem(PENDING_VEHICLE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PENDING_VEHICLE_KEY);

      const { rdw, user: userData } = JSON.parse(raw);
      addVehicle(rdw, userData, userId).then(() => {
        reload().then(() => {
          setToastMessage(t("addedToGarage"));
          setToastOpen(true);
        });
      });
    } catch {
      // Invalid or missing pending data
    }
  }, [userId, garageLoading, reload, t]);

  // Show migration toast
  useEffect(() => {
    if (!migrationResult) return;

    if (migrationResult.failed > 0 && migrationResult.migrated > 0) {
      setToastMessage(
        t("migrationPartial", { migrated: migrationResult.migrated, failed: migrationResult.failed })
      );
      setToastVariant("warning");
      setToastOpen(true);
    } else if (migrationResult.failed > 0) {
      setToastMessage(t("migrationFailed"));
      setToastVariant("warning");
      setToastOpen(true);
    } else if (migrationResult.migrated > 0) {
      setToastMessage(t("migrationSuccess"));
      setToastVariant("success");
      setToastOpen(true);
    }
  }, [migrationResult, t]);

  const showToast = (message: string, variant: "success" | "warning" = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastOpen(true);
  };

  // --- Edit ---
  const handleEdit = (vehicle: GarageVehicle) => {
    setEditingVehicle(vehicle);
    setFormOpen(true);
  };

  const handleFormSave = async (
    rdw: GarageVehicle["rdw"],
    user: GarageVehicle["user"],
  ) => {
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, user, userId);
        showToast(t("updated"));
      } else {
        await addVehicle(rdw, user, userId);
        showToast(t("addedToGarage"));
      }
      setFormOpen(false);
      setEditingVehicle(undefined);
      await reload();
    } catch {
      showToast(t("somethingWrong"));
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingVehicle(undefined);
  };

  // --- Duplicate ---
  const handleDuplicate = async (vehicle: GarageVehicle) => {
    try {
      const copy = await duplicateVehicle(vehicle.id, userId);
      if (copy) {
        showToast(
          t("duplicated", { name: `${vehicle.rdw.merk} ${vehicle.rdw.handelsbenaming}` }),
        );
        await reload();
      }
    } catch {
      showToast(t("duplicateFailed"));
    }
  };

  // --- Delete ---
  const handleDeleteClick = (vehicle: GarageVehicle) => {
    setDeletingVehicle(vehicle);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVehicle) return;
    try {
      await removeVehicle(deletingVehicle.id, userId);
      showToast(t("deleted"));
      setDeleteOpen(false);
      setDeletingVehicle(undefined);
      await reload();
    } catch {
      showToast(t("deleteFailed"));
    }
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeletingVehicle(undefined);
  };

  // --- Refresh RDW ---
  const handleRefresh = async (vehicle: GarageVehicle) => {
    setRefreshingId(vehicle.id);
    try {
      const result = await lookupVehicle(vehicle.rdw.kenteken);
      await updateVehicleRdw(vehicle.id, vehicleToRdw(result), userId);
      showToast(t("rdwUpdated"));
      await reload();
    } catch {
      showToast(t("refreshFailed"));
    } finally {
      setRefreshingId(null);
    }
  };

  const sorted = sortVehicles(vehicles, sortKey);
  const isEmpty = vehicles.length === 0;

  if (garageLoading) {
    return null;
  }

  return (
    <>
      {/* Sort control */}
      {!isEmpty && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ minWidth: "180px" }}>
            <Select
              options={SORT_OPTIONS}
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              label={t("sortLabel")}
            />
          </div>
        </div>
      )}

      {/* Content */}
      {isEmpty ? (
        <EmptyGarage />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "var(--spacing-4)",
          }}
        >
          {sorted.map((vehicle, index) => (
            <GarageCard
              key={vehicle.id || `vehicle-${index}`}
              vehicle={vehicle}
              onEdit={() => handleEdit(vehicle)}
              onDuplicate={() => handleDuplicate(vehicle)}
              onDelete={() => handleDeleteClick(vehicle)}
              onRefresh={() => handleRefresh(vehicle)}
              isRefreshing={refreshingId === vehicle.id}
            />
          ))}
        </div>
      )}

      {/* Edit/Add modal */}
      <VehicleFormModal
        open={formOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        vehicle={editingVehicle}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        size="sm"
        title={t("deleteTitle")}
        trailing={
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={handleDeleteClose}
            aria-label={t("close")}
          >
            <Icon name="x" size="sm" />
          </Button>
        }
        footerActions={
          <>
            <Button variant="secondary" onClick={handleDeleteClose}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handleDeleteConfirm}>
              {t("delete")}
            </Button>
          </>
        }
      >
        <Alert variant="warning">
          {t("deleteConfirm", {
            name: `${deletingVehicle?.rdw.merk} ${deletingVehicle?.rdw.handelsbenaming}`,
          })}
        </Alert>
      </Dialog>

      {/* Toast */}
      <Toast
        variant={toastVariant}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={3000}
      >
        {toastMessage}
      </Toast>
    </>
  );
}
