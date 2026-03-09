"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button, Dialog, Alert, Toast, Icon, Tabs, TabList, Tab, TabPanel } from "muka-ui";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { getGarage } from "@/lib/garage";
import {
  getTripsThisYear,
  getTripStats,
  getPrivateKmStatus,
  addTrip,
  updateTrip,
  deleteTrip,
  type Trip,
  type TripInput,
  type TripStats,
} from "@/lib/trips";
import type { GarageVehicle } from "@/types/garage";
import { TripForm } from "@/components/tracking/TripForm";
import { TripList } from "@/components/tracking/TripList";
import { KilometerDashboard } from "@/components/tracking/KilometerDashboard";

export default function TrackingPage() {
  const t = useTranslations("tracking");
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [privateKmStatus, setPrivateKmStatus] = useState<{
    currentKm: number;
    limit: number;
    status: "ok" | "warning" | "exceeded";
    remainingKm: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>(undefined);

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState<Trip | undefined>(undefined);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "warning">("success");

  // Tab state
  const [activeTab, setActiveTab] = useState("dashboard");

  const showToast = (message: string, variant: "success" | "warning" = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastOpen(true);
  };

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehicleData, tripData, statsData, privateStatus] = await Promise.all([
        getGarage(userId),
        getTripsThisYear(undefined, userId),
        getTripStats(undefined, userId),
        getPrivateKmStatus(undefined, userId),
      ]);
      setVehicles(vehicleData);
      setTrips(tripData);
      setStats(statsData);
      setPrivateKmStatus(privateStatus);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add trip
  const handleAddTrip = async (input: TripInput) => {
    try {
      await addTrip(input, userId);
      showToast(t("tripAdded"));
      setShowForm(false);
      await loadData();
    } catch {
      showToast(t("tripAddFailed"), "warning");
    }
  };

  // Edit trip
  const handleEditClick = (trip: Trip) => {
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleUpdateTrip = async (input: TripInput) => {
    if (!editingTrip) return;
    try {
      await updateTrip(editingTrip.id, input, userId);
      showToast(t("tripUpdated"));
      setShowForm(false);
      setEditingTrip(undefined);
      await loadData();
    } catch {
      showToast(t("tripUpdateFailed"), "warning");
    }
  };

  // Delete trip
  const handleDeleteClick = (trip: Trip) => {
    setDeletingTrip(trip);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTrip) return;
    try {
      await deleteTrip(deletingTrip.id, userId);
      showToast(t("tripDeleted"));
      setDeleteOpen(false);
      setDeletingTrip(undefined);
      await loadData();
    } catch {
      showToast(t("tripDeleteFailed"), "warning");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTrip(undefined);
  };

  if (loading) {
    return null;
  }

  // Empty state - no vehicles
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      {/* Header with add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-heading-md-semibold-fontSize)" }}>
          {t("title")}
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingTrip(undefined);
            setShowForm(true);
          }}
        >
          <Icon name="plus" size="sm" />
          {t("newTrip")}
        </Button>
      </div>

      {/* Tabs for Dashboard and Trip List */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="dashboard">{t("dashboard")}</Tab>
          <Tab value="trips">{t("tripsTab", { count: trips.length })}</Tab>
        </TabList>

        <TabPanel value="dashboard">
          {stats && privateKmStatus && (
            <KilometerDashboard stats={stats} privateKmStatus={privateKmStatus} />
          )}
        </TabPanel>

        <TabPanel value="trips">
          <TripList
            trips={trips}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            loading={loading}
          />
        </TabPanel>
      </Tabs>

      {/* Add/Edit form dialog */}
      <Dialog
        open={showForm}
        onClose={handleFormClose}
        size="lg"
        title={editingTrip ? t("editTrip") : t("newTrip")}
        trailing={
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={handleFormClose}
            aria-label={t("close")}
          >
            <Icon name="x" size="sm" />
          </Button>
        }
      >
        <TripForm
          vehicles={vehicles}
          trip={editingTrip}
          onSave={editingTrip ? handleUpdateTrip : handleAddTrip}
          onCancel={handleFormClose}
        />
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        size="sm"
        title={t("deleteTrip")}
        trailing={
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setDeleteOpen(false)}
            aria-label={t("close")}
          >
            <Icon name="x" size="sm" />
          </Button>
        }
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handleDeleteConfirm}>
              {t("delete")}
            </Button>
          </>
        }
      >
        <Alert variant="warning">
          {t("deleteConfirm")}
          {deletingTrip && (
            <p style={{ margin: "var(--spacing-2) 0 0 0" }}>
              <strong>
                {t("tripRoute", { from: deletingTrip.startLocation, to: deletingTrip.endLocation })}
              </strong>
              <br />
              {t("tripDetails", { distance: deletingTrip.distanceKm, date: deletingTrip.date })}
            </p>
          )}
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
    </div>
  );
}
