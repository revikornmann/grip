"use client";

import { useState } from "react";
import { Card, Badge, Button, Icon, Select, Input } from "muka-ui";
import type { Trip, TripPurpose, TripCategory } from "@/lib/trips";
import { TRIP_PURPOSE_LABELS } from "@/lib/trips";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatting";

interface TripListProps {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  loading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "", label: "Alle categorieën" },
  { value: "business", label: "Zakelijk" },
  { value: "private", label: "Privé" },
];

const MONTH_OPTIONS = [
  { value: "", label: "Alle maanden" },
  ...Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return {
      value: String(i + 1).padStart(2, "0"),
      label: date.toLocaleDateString("nl-NL", { month: "long" }),
    };
  }),
];

export function TripList({ trips, onEdit, onDelete, loading = false }: TripListProps) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Apply filters
  const filteredTrips = trips.filter((trip) => {
    // Category filter
    if (categoryFilter && trip.category !== categoryFilter) return false;

    // Month filter
    if (monthFilter) {
      const tripMonth = trip.date.substring(5, 7);
      if (tripMonth !== monthFilter) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesLocation =
        trip.startLocation.toLowerCase().includes(query) ||
        trip.endLocation.toLowerCase().includes(query);
      const matchesNotes = trip.notes?.toLowerCase().includes(query);
      if (!matchesLocation && !matchesNotes) return false;
    }

    return true;
  });

  // Calculate totals
  const totalKm = filteredTrips.reduce((sum, t) => sum + t.distanceKm, 0);
  const businessKm = filteredTrips
    .filter((t) => t.category === "business")
    .reduce((sum, t) => sum + t.distanceKm, 0);

  if (trips.length === 0) {
    return (
      <Card>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--spacing-3)",
            padding: "var(--spacing-6)",
            textAlign: "center",
          }}
        >
          <Icon name="map-pin" size="lg" />
          <p style={{ color: "var(--color-text-subtle-default)" }}>
            Je hebt nog geen ritten geregistreerd. Voeg je eerste rit toe om te
            beginnen met bijhouden.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      {/* Filters */}
      <Card>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "var(--spacing-3)",
          }}
        >
          <Select
            label="Categorie"
            options={CATEGORY_OPTIONS}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Select
            label="Maand"
            options={MONTH_OPTIONS}
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
          <Input
            label="Zoeken"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Locatie of notitie"
          />
        </div>
      </Card>

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--spacing-3)",
        }}
      >
        <Card>
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-text-subtle-default)",
            }}
          >
            Totaal
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontSize: "var(--text-heading-sm-semibold-fontSize)",
              fontWeight: 600,
            }}
          >
            {formatNumber(totalKm, 0)} km
          </p>
        </Card>
        <Card>
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-text-subtle-default)",
            }}
          >
            Zakelijk
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontSize: "var(--text-heading-sm-semibold-fontSize)",
              fontWeight: 600,
              color: "var(--color-state-success-foreground)",
            }}
          >
            {formatNumber(businessKm, 0)} km
          </p>
        </Card>
        <Card>
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-text-subtle-default)",
            }}
          >
            Ritten
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontSize: "var(--text-heading-sm-semibold-fontSize)",
              fontWeight: 600,
            }}
          >
            {filteredTrips.length}
          </p>
        </Card>
      </div>

      {/* Trip list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
        {filteredTrips.map((trip) => (
          <Card key={trip.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "var(--spacing-3)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-1)" }}>
                  <Badge
                    variant={trip.category === "business" ? "success" : "warning"}
                    size="sm"
                    dot
                  >
                    {trip.category === "business" ? "Zakelijk" : "Privé"}
                  </Badge>
                  <span style={{ fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
                    {formatDate(trip.date)}
                  </span>
                </div>

                <p style={{ margin: 0, fontWeight: 600 }}>
                  {trip.startLocation} → {trip.endLocation}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "var(--spacing-3)",
                    marginTop: "var(--spacing-1)",
                    fontSize: "var(--text-label-sm-regular-fontSize)",
                    color: "var(--color-text-subtle-default)",
                  }}
                >
                  <span>{formatNumber(trip.distanceKm, 1)} km</span>
                  <span>{TRIP_PURPOSE_LABELS[trip.purpose]}</span>
                </div>

                {trip.notes && (
                  <p
                    style={{
                      margin: "var(--spacing-2) 0 0 0",
                      fontSize: "var(--text-label-sm-regular-fontSize)",
                      color: "var(--color-text-subtle-default)",
                      fontStyle: "italic",
                    }}
                  >
                    {trip.notes}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "var(--spacing-1)" }}>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={() => onEdit(trip)}
                  aria-label="Bewerken"
                >
                  <Icon name="edit-2" size="sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={() => onDelete(trip)}
                  aria-label="Verwijderen"
                >
                  <Icon name="trash-2" size="sm" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredTrips.length === 0 && (
          <Card>
            <p style={{ margin: 0, textAlign: "center", color: "var(--color-text-subtle-default)" }}>
              Geen ritten gevonden met deze filters.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
