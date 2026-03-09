"use client";

import { Card, Badge, Divider } from "muka-ui";
import { useTranslations } from "next-intl";
import type { CostBreakdown } from "@/lib/calculator";
import { formatCurrency, formatNumber } from "@/lib/formatting";

interface CostSummaryProps {
  breakdown: CostBreakdown;
  annualKilometers: number;
  ownershipType: "private" | "business";
}

export function CostSummary({
  breakdown,
  annualKilometers,
  ownershipType,
}: CostSummaryProps) {
  const t = useTranslations("costs");
  const { totals, running, ownership, tax } = breakdown;

  // Find largest cost component
  const costComponents = [
    { label: t("fuel"), value: running.fuel },
    { label: t("insurance"), value: running.insurance },
    { label: t("roadTax"), value: running.roadTax },
    { label: t("maintenance"), value: running.maintenance },
    { label: t("depreciation"), value: ownership.depreciation },
  ];

  if (ownershipType === "business" && tax.bijtelling > 0) {
    costComponents.push({ label: t("bijtelling"), value: tax.bijtelling });
  }

  const largestCost = costComponents.reduce((max, curr) =>
    curr.value > max.value ? curr : max,
  );

  return (
    <Card>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-4)",
          textAlign: "center",
        }}
      >
        {/* Main totals */}
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-text-subtle-default)",
            }}
          >
            {t("totalAnnualCosts")}
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontSize: "var(--text-heading-lg-semibold-fontSize)",
              fontWeight: "var(--text-heading-lg-semibold-fontWeight)",
            }}
          >
            {formatCurrency(totals.netAnnual, 0)}
          </p>
          <Badge variant={ownershipType === "business" ? "info" : "neutral"}>
            {ownershipType === "business" ? t("businessOwnership") : t("privateOwnership")}
          </Badge>
        </div>

        <Divider />

        {/* Monthly and per-km breakdown */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--spacing-4)",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "var(--text-label-sm-regular-fontSize)",
                color: "var(--color-text-subtle-default)",
              }}
            >
              {t("perMonth")}
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-heading-sm-semibold-fontSize)",
                fontWeight: "var(--text-heading-sm-semibold-fontWeight)",
              }}
            >
              {formatCurrency(totals.monthly, 0)}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "var(--text-label-sm-regular-fontSize)",
                color: "var(--color-text-subtle-default)",
              }}
            >
              {t("perKm")}
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-heading-sm-semibold-fontSize)",
                fontWeight: "var(--text-heading-sm-semibold-fontWeight)",
              }}
            >
              {formatCurrency(totals.perKm, 2)}
            </p>
          </div>
        </div>

        <Divider />

        {/* Largest cost highlight */}
        <div
          style={{
            background: "var(--color-surface-level1)",
            padding: "var(--spacing-3)",
            borderRadius: "var(--border-radius-md)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-text-subtle-default)",
            }}
          >
            {t("largestCostItem")}
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontWeight: 600,
            }}
          >
            {t("costItemPerYear", { label: largestCost.label, amount: formatCurrency(largestCost.value, 0) })}
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-text-subtle-default)",
            }}
          >
            {t("percentOfTotal", { percent: Math.round((largestCost.value / totals.netAnnual) * 100) })}
          </p>
        </div>

        {/* BTW benefit note for business */}
        {ownershipType === "business" && tax.btwAftrek < 0 && (
          <div
            style={{
              background: "var(--color-state-success-background)",
              padding: "var(--spacing-3)",
              borderRadius: "var(--border-radius-md)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--text-label-sm-regular-fontSize)",
                color: "var(--color-state-success-foreground)",
              }}
            >
              {t("vatBenefit", { amount: formatCurrency(Math.abs(tax.btwAftrek), 0) })}
            </p>
          </div>
        )}

        {/* Calculation basis */}
        <p
          style={{
            margin: 0,
            fontSize: "var(--text-label-sm-regular-fontSize)",
            color: "var(--color-text-subtle-default)",
          }}
        >
          {t("basedOnKm", { km: formatNumber(annualKilometers, 0) })}
        </p>
      </div>
    </Card>
  );
}
