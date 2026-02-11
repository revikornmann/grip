"use client";

import { Card, Badge, Divider } from "muka-ui";
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
  const { totals, running, ownership, tax } = breakdown;

  // Find largest cost component
  const costComponents = [
    { label: "Brandstof", value: running.fuel },
    { label: "Verzekering", value: running.insurance },
    { label: "Wegenbelasting", value: running.roadTax },
    { label: "Onderhoud", value: running.maintenance },
    { label: "Afschrijving", value: ownership.depreciation },
  ];

  if (ownershipType === "business" && tax.bijtelling > 0) {
    costComponents.push({ label: "Bijtelling", value: tax.bijtelling });
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
            Totale jaarlijkse kosten
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
            {ownershipType === "business" ? "Zakelijk eigendom" : "Privé eigendom"}
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
              Per maand
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
              Per kilometer
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
            Grootste kostenpost
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontWeight: 600,
            }}
          >
            {largestCost.label}: {formatCurrency(largestCost.value, 0)}/jaar
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-text-subtle-default)",
            }}
          >
            {Math.round((largestCost.value / totals.netAnnual) * 100)}% van totaal
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
              BTW voordeel: {formatCurrency(Math.abs(tax.btwAftrek), 0)}/jaar
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
          Berekend op basis van {formatNumber(annualKilometers, 0)} km/jaar
        </p>
      </div>
    </Card>
  );
}
