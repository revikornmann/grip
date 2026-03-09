"use client";

import {
  Card,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "muka-ui";
import { useTranslations } from "next-intl";
import type { CostBreakdown as CostBreakdownType } from "@/lib/calculator";
import { formatCurrency } from "@/lib/formatting";

interface CostBreakdownProps {
  breakdown: CostBreakdownType;
  ownershipType: "private" | "business";
}

interface CostRow {
  label: string;
  annual: number;
  monthly: number;
  category: "running" | "ownership" | "tax";
  highlight?: "positive" | "negative";
}

export function CostBreakdown({ breakdown, ownershipType }: CostBreakdownProps) {
  const t = useTranslations("costs");

  const rows: CostRow[] = [
    // Running costs
    {
      label: t("fuelCharging"),
      annual: breakdown.running.fuel,
      monthly: breakdown.running.fuel / 12,
      category: "running",
    },
    {
      label: t("insurance"),
      annual: breakdown.running.insurance,
      monthly: breakdown.running.insurance / 12,
      category: "running",
    },
    {
      label: t("roadTaxMrb"),
      annual: breakdown.running.roadTax,
      monthly: breakdown.running.roadTax / 12,
      category: "running",
    },
    {
      label: t("maintenance"),
      annual: breakdown.running.maintenance,
      monthly: breakdown.running.maintenance / 12,
      category: "running",
    },
    // Ownership costs
    {
      label: t("depreciation"),
      annual: breakdown.ownership.depreciation,
      monthly: breakdown.ownership.depreciation / 12,
      category: "ownership",
    },
  ];

  // Add tax rows for business ownership
  if (ownershipType === "business") {
    if (breakdown.tax.bijtelling > 0) {
      rows.push({
        label: t("bijtellingTax"),
        annual: breakdown.tax.bijtelling,
        monthly: breakdown.tax.bijtelling / 12,
        category: "tax",
        highlight: "negative",
      });
    }
    if (breakdown.tax.btwAftrek < 0) {
      rows.push({
        label: t("vatDeduction"),
        annual: breakdown.tax.btwAftrek,
        monthly: breakdown.tax.btwAftrek / 12,
        category: "tax",
        highlight: "positive",
      });
    }
  }

  const runningTotal =
    breakdown.running.fuel +
    breakdown.running.insurance +
    breakdown.running.roadTax +
    breakdown.running.maintenance;

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            {t("overview")}
          </h3>
          <Badge variant={ownershipType === "business" ? "info" : "neutral"}>
            {ownershipType === "business" ? t("business") : t("private")}
          </Badge>
        </div>

        <Table size="sm">
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t("costItem")}</TableHeaderCell>
              <TableHeaderCell align="right">{t("perMonth")}</TableHeaderCell>
              <TableHeaderCell align="right">{t("perYear")}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Running costs */}
            {rows
              .filter((r) => r.category === "running")
              .map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell align="right">{formatCurrency(row.monthly, 0)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.annual, 0)}</TableCell>
                </TableRow>
              ))}

            {/* Running subtotal */}
            <TableRow>
              <TableCell>
                <strong>{t("subtotalVariable")}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{formatCurrency(runningTotal / 12, 0)}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{formatCurrency(runningTotal, 0)}</strong>
              </TableCell>
            </TableRow>

            {/* Ownership costs */}
            {rows
              .filter((r) => r.category === "ownership")
              .map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell align="right">{formatCurrency(row.monthly, 0)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.annual, 0)}</TableCell>
                </TableRow>
              ))}

            {/* Tax rows (business only) */}
            {rows
              .filter((r) => r.category === "tax")
              .map((row) => (
                <TableRow key={row.label}>
                  <TableCell>
                    <span
                      style={{
                        color:
                          row.highlight === "positive"
                            ? "var(--color-state-success-foreground)"
                            : row.highlight === "negative"
                            ? "var(--color-state-error-foreground)"
                            : undefined,
                      }}
                    >
                      {row.label}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span
                      style={{
                        color:
                          row.highlight === "positive"
                            ? "var(--color-state-success-foreground)"
                            : row.highlight === "negative"
                            ? "var(--color-state-error-foreground)"
                            : undefined,
                      }}
                    >
                      {row.annual < 0 ? "-" : "+"}{formatCurrency(Math.abs(row.monthly), 0)}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span
                      style={{
                        color:
                          row.highlight === "positive"
                            ? "var(--color-state-success-foreground)"
                            : row.highlight === "negative"
                            ? "var(--color-state-error-foreground)"
                            : undefined,
                      }}
                    >
                      {row.annual < 0 ? "-" : "+"}{formatCurrency(Math.abs(row.annual), 0)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}

            {/* Total */}
            <TableRow>
              <TableCell>
                <strong>{t("totalCosts")}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{formatCurrency(breakdown.totals.monthly, 0)}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{formatCurrency(breakdown.totals.netAnnual, 0)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
