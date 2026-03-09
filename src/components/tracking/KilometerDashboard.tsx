"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("kmDashboard");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      {/* 500km Warning */}
      {privateKmStatus.status === "warning" && (
        <Alert variant="warning" title={t("warningTitle")}>
          {t("warningText", { driven: formatNumber(privateKmStatus.currentKm, 0), remaining: formatNumber(privateKmStatus.remainingKm, 0), limit: PRIVATE_KM_LIMIT })}
        </Alert>
      )}

      {privateKmStatus.status === "exceeded" && (
        <Alert variant="error" title={t("exceededTitle")}>
          {t("exceededText", { limit: PRIVATE_KM_LIMIT })}
        </Alert>
      )}

      {/* Main stats */}
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <h3 style={{ margin: 0, fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            {t("overviewTitle", { year: new Date().getFullYear() })}
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
              {t("totalDriven")}
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-heading-lg-semibold-fontSize)",
                fontWeight: "var(--text-heading-lg-semibold-fontWeight)",
              }}
            >
              {t("km", { value: formatNumber(stats.totalKm, 0) })}
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-label-sm-regular-fontSize)",
                color: "var(--color-text-subtle-default)",
              }}
            >
              {t("tripCount", { count: stats.tripCount })}
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
              <span>{t("businessLabel")}</span>
              <span style={{ color: "var(--color-state-success-foreground)" }}>
                {t("businessKm", { value: formatNumber(stats.businessKm, 0), percent: formatPercentage(stats.businessPercent, 0) })}
              </span>
            </div>
            <Progress
              variant="bar"
              value={stats.businessPercent * 100}
              size="md"
              aria-label={t("businessKmProgress")}
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
              <span>{t("privateLabel")}</span>
              <span style={{ color: "var(--color-state-warning-foreground)" }}>
                {t("privateKm", { value: formatNumber(stats.privateKm, 0), percent: formatPercentage(stats.privatePercent, 0) })}
              </span>
            </div>
            <Progress
              variant="bar"
              value={stats.privatePercent * 100}
              size="md"
              aria-label={t("privateKmProgress")}
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
                {t("businessTrips")}
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
                {t("privateTrips")}
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
              {t("privateLimitTitle")}
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
                ? t("onTrack")
                : privateKmStatus.status === "warning"
                ? t("almostFull")
                : t("exceeded")}
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
              aria-label={t("privateLimitTitle")}
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
              {t("remainingKm", { value: formatNumber(privateKmStatus.remainingKm, 0) })}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
