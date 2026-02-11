"use client";

import { Card, Badge, Progress, Alert, Divider } from "muka-ui";
import type { TripStats } from "@/lib/trips";
import { PRIVATE_KM_LIMIT, PRIVATE_KM_WARNING } from "@/lib/trips";
import { formatNumber, formatPercentage } from "@/lib/formatting";

interface KilometerDashboardProps {
  stats: TripStats;
  privateKmStatus: {
    currentKm: number;
    limit: number;
    status: "ok" | "warning" | "exceeded";
    remainingKm: number;
  };
}

export function KilometerDashboard({ stats, privateKmStatus }: KilometerDashboardProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      {/* 500km Warning */}
      {privateKmStatus.status === "warning" && (
        <Alert variant="warning" title="Opgelet: privékilometers bijna op">
          Je hebt {formatNumber(privateKmStatus.currentKm, 0)} privékilometers gereden.
          Nog {formatNumber(privateKmStatus.remainingKm, 0)} km tot de grens van{" "}
          {formatNumber(PRIVATE_KM_LIMIT, 0)} km. Bij overschrijding geldt volledige bijtelling.
        </Alert>
      )}

      {privateKmStatus.status === "exceeded" && (
        <Alert variant="error" title="Privélimiet overschreden">
          Je hebt de grens van {formatNumber(PRIVATE_KM_LIMIT, 0)} privékilometers overschreden.
          Volledige bijtelling is nu van toepassing op dit voertuig.
        </Alert>
      )}

      {/* Main stats */}
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <h3 style={{ margin: 0, fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            Kilometeroverzicht {new Date().getFullYear()}
          </h3>

          {/* Total km */}
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                margin: 0,
                fontSize: "var(--text-label-sm-regular-fontSize)",
                color: "var(--color-text-subtle-default)",
              }}
            >
              Totaal gereden
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-heading-lg-semibold-fontSize)",
                fontWeight: "var(--text-heading-lg-semibold-fontWeight)",
              }}
            >
              {formatNumber(stats.totalKm, 0)} km
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-label-sm-regular-fontSize)",
                color: "var(--color-text-subtle-default)",
              }}
            >
              {stats.tripCount} ritten
            </p>
          </div>

          <Divider />

          {/* Business vs Private ratio */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "var(--spacing-2)",
              }}
            >
              <span>Zakelijk</span>
              <span style={{ color: "var(--color-state-success-foreground)" }}>
                {formatNumber(stats.businessKm, 0)} km ({formatPercentage(stats.businessPercent, 0)})
              </span>
            </div>
            <Progress
              variant="bar"
              value={stats.businessPercent * 100}
              size="md"
              aria-label="Zakelijke kilometers"
            />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "var(--spacing-2)",
              }}
            >
              <span>Privé</span>
              <span style={{ color: "var(--color-state-warning-foreground)" }}>
                {formatNumber(stats.privateKm, 0)} km ({formatPercentage(stats.privatePercent, 0)})
              </span>
            </div>
            <Progress
              variant="bar"
              value={stats.privatePercent * 100}
              size="md"
              aria-label="Privé kilometers"
            />
          </div>

          <Divider />

          {/* Trip counts */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--spacing-3)",
              textAlign: "center",
            }}
          >
            <div>
              <Badge variant="success" size="sm" dot>
                Zakelijke ritten
              </Badge>
              <p
                style={{
                  margin: "var(--spacing-2) 0 0 0",
                  fontSize: "var(--text-heading-sm-semibold-fontSize)",
                  fontWeight: 600,
                }}
              >
                {stats.businessTripCount}
              </p>
            </div>
            <div>
              <Badge variant="warning" size="sm" dot>
                Privéritten
              </Badge>
              <p
                style={{
                  margin: "var(--spacing-2) 0 0 0",
                  fontSize: "var(--text-heading-sm-semibold-fontSize)",
                  fontWeight: 600,
                }}
              >
                {stats.privateTripCount}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 500km progress */}
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, fontSize: "var(--text-label-md-semibold-fontSize)" }}>
              Privékilometers limiet
            </h4>
            <Badge
              variant={
                privateKmStatus.status === "ok"
                  ? "success"
                  : privateKmStatus.status === "warning"
                  ? "warning"
                  : "error"
              }
              size="sm"
            >
              {privateKmStatus.status === "ok"
                ? "Op schema"
                : privateKmStatus.status === "warning"
                ? "Bijna vol"
                : "Overschreden"}
            </Badge>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "var(--spacing-1)",
                fontSize: "var(--text-label-sm-regular-fontSize)",
              }}
            >
              <span>{formatNumber(privateKmStatus.currentKm, 0)} km</span>
              <span>{formatNumber(PRIVATE_KM_LIMIT, 0)} km</span>
            </div>
            <Progress
              variant="bar"
              value={Math.min(100, (privateKmStatus.currentKm / PRIVATE_KM_LIMIT) * 100)}
              size="lg"
              aria-label="Privékilometers limiet"
            />
          </div>

          {privateKmStatus.status === "ok" && (
            <p
              style={{
                margin: 0,
                fontSize: "var(--text-label-sm-regular-fontSize)",
                color: "var(--color-text-subtle-default)",
              }}
            >
              Nog {formatNumber(privateKmStatus.remainingKm, 0)} km beschikbaar voor privégebruik
              zonder volledige bijtelling.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
