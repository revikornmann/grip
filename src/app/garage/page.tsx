"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, Dialog, Button, Alert, Toast, Icon } from "muka-ui";
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
import { GarageCard } from "@/components/garage/GarageCard";
import { EmptyGarage } from "@/components/garage/EmptyGarage";
import { VehicleFormModal } from "@/components/garage/VehicleFormModal";

type SortKey = "addedAt" | "name" | "price";

const SORT_OPTIONS = [
  { value: "addedAt", label: "Datum toegevoegd" },
  { value: "name", label: "Merk / Model" },
  { value: "price", label: "Prijs" },
];

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
  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("addedAt");

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

  const reload = useCallback(() => {
    setVehicles(getGarage());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  // --- Edit ---
  const handleEdit = (vehicle: GarageVehicle) => {
    setEditingVehicle(vehicle);
    setFormOpen(true);
  };

  const handleFormSave = (
    rdw: GarageVehicle["rdw"],
    user: GarageVehicle["user"],
  ) => {
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, user);
      showToast("Voertuig bijgewerkt");
    } else {
      addVehicle(rdw, user);
      showToast("Voertuig toegevoegd aan garage");
    }
    setFormOpen(false);
    setEditingVehicle(undefined);
    reload();
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingVehicle(undefined);
  };

  // --- Duplicate ---
  const handleDuplicate = (vehicle: GarageVehicle) => {
    const copy = duplicateVehicle(vehicle.id);
    if (copy) {
      showToast(
        `${vehicle.rdw.merk} ${vehicle.rdw.handelsbenaming} gedupliceerd`,
      );
      reload();
    }
  };

  // --- Delete ---
  const handleDeleteClick = (vehicle: GarageVehicle) => {
    setDeletingVehicle(vehicle);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingVehicle) return;
    removeVehicle(deletingVehicle.id);
    showToast("Voertuig verwijderd");
    setDeleteOpen(false);
    setDeletingVehicle(undefined);
    reload();
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
      updateVehicleRdw(vehicle.id, vehicleToRdw(result));
      showToast("RDW gegevens bijgewerkt");
      reload();
    } catch {
      showToast("Vernieuwen mislukt — probeer het later opnieuw");
    } finally {
      setRefreshingId(null);
    }
  };

  const sorted = sortVehicles(vehicles, sortKey);
  const isEmpty = vehicles.length === 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-6)",
      }}
    >
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
              label="Sorteren"
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
          {sorted.map((vehicle) => (
            <div key={vehicle.id}>
              <GarageCard
                vehicle={vehicle}
                onEdit={() => handleEdit(vehicle)}
                onDuplicate={() => handleDuplicate(vehicle)}
                onDelete={() => handleDeleteClick(vehicle)}
                onRefresh={() => handleRefresh(vehicle)}
                isRefreshing={refreshingId === vehicle.id}
              />
            </div>
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
        title="Voertuig verwijderen"
        trailing={
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={handleDeleteClose}
            aria-label="Sluiten"
          >
            <Icon name="x" size="sm" />
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
            <Button variant="secondary" onClick={handleDeleteClose}>
              Annuleren
            </Button>
            <Button variant="primary" onClick={handleDeleteConfirm}>
              Verwijderen
            </Button>
          </div>
        }
      >
        <Alert variant="warning">
          Weet je zeker dat je{" "}
          <strong>
            {deletingVehicle?.rdw.merk} {deletingVehicle?.rdw.handelsbenaming}
          </strong>{" "}
          wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
        </Alert>
      </Dialog>

      {/* Toast */}
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
