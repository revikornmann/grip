"use client";

import { useTranslations } from "next-intl";
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
import type { ComparisonResult } from "@/lib/comparison";
import { formatCurrency } from "@/lib/formatting";

interface ComparisonTableProps {
  result: ComparisonResult;
}

interface ComparisonRow {
  label: string;
  privateValue: number;
  businessValue: number;
  category: "running" | "ownership" | "tax" | "total";
  isHighlight?: boolean;
  isBenefit?: boolean;
}

export function ComparisonTable({ result }: ComparisonTableProps) {
  const tCosts = useTranslations("costs");
  const tCompare = useTranslations("compare");
  const { scenarios } = result;
  const privateCosts = scenarios.private.costs;
  const businessCosts = scenarios.business.costs;

  const rows: ComparisonRow[] = [
    // Running costs
    {
      label: tCosts("fuelCharging"),
      privateValue: privateCosts.running.fuel,
      businessValue: businessCosts.running.fuel,
      category: "running",
    },
    {
      label: tCosts("insurance"),
      privateValue: privateCosts.running.insurance,
      businessValue: businessCosts.running.insurance,
      category: "running",
    },
    {
      label: tCosts("roadTax"),
      privateValue: privateCosts.running.roadTax,
      businessValue: businessCosts.running.roadTax,
      category: "running",
    },
    {
      label: tCosts("maintenance"),
      privateValue: privateCosts.running.maintenance,
      businessValue: businessCosts.running.maintenance,
      category: "running",
    },
    // Ownership
    {
      label: tCosts("depreciation"),
      privateValue: privateCosts.ownership.depreciation,
      businessValue: businessCosts.ownership.depreciation,
      category: "ownership",
    },
    // Tax (business only)
    {
      label: tCosts("bijtellingTax"),
      privateValue: 0,
      businessValue: businessCosts.tax.bijtelling,
      category: "tax",
    },
    {
      label: tCosts("vatDeduction"),
      privateValue: 0,
      businessValue: businessCosts.tax.btwAftrek,
      category: "tax",
      isBenefit: true,
    },
    // Total
    {
      label: tCosts("netAnnualCosts"),
      privateValue: scenarios.private.netAnnualCost,
      businessValue: scenarios.business.netAnnualCost,
      category: "total",
      isHighlight: true,
    },
  ];

  const cheaperOption = result.difference.cheaperOption;

  const formatValue = (value: number, isBenefit?: boolean) => {
    if (value === 0) return "-";
    if (isBenefit && value < 0) {
      return (
        <span style={{ color: "var(--color-state-success-foreground)" }}>
          -{formatCurrency(Math.abs(value), 0)}
        </span>
      );
    }
    return formatCurrency(value, 0);
  };

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <h3 style={{ margin: 0, fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
          {tCompare("comparisonTitle")}
        </h3>

        <Table size="md">
          <TableHead>
            <TableRow>
              <TableHeaderCell>{tCosts("costItem")}</TableHeaderCell>
              <TableHeaderCell align="right">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
                  {tCosts("private")}
                  {cheaperOption === "private" && (
                    <Badge variant="success" size="sm">{tCompare("cheapest")}</Badge>
                  )}
                </div>
              </TableHeaderCell>
              <TableHeaderCell align="right">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
                  {tCosts("business")}
                  {cheaperOption === "business" && (
                    <Badge variant="success" size="sm">{tCompare("cheapest")}</Badge>
                  )}
                </div>
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell>
                  {row.isHighlight ? <strong>{row.label}</strong> : row.label}
                </TableCell>
                <TableCell align="right">
                  {row.isHighlight ? (
                    <strong
                      style={{
                        color:
                          cheaperOption === "private"
                            ? "var(--color-state-success-foreground)"
                            : undefined,
                      }}
                    >
                      {formatValue(row.privateValue)}
                    </strong>
                  ) : (
                    formatValue(row.privateValue, row.isBenefit)
                  )}
                </TableCell>
                <TableCell align="right">
                  {row.isHighlight ? (
                    <strong
                      style={{
                        color:
                          cheaperOption === "business"
                            ? "var(--color-state-success-foreground)"
                            : undefined,
                      }}
                    >
                      {formatValue(row.businessValue)}
                    </strong>
                  ) : (
                    formatValue(row.businessValue, row.isBenefit)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
