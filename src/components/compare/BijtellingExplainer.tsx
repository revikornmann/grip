"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Button, Icon, Badge, Divider } from "muka-ui";
import type { GarageVehicle } from "@/types/garage";
import {
  getBijtellingPercentage,
  isElectric,
  isYoungtimer,
  TAX_CONSTANTS,
} from "@/lib/calculator";
import { formatCurrency, formatPercentage } from "@/lib/formatting";

interface BijtellingExplainerProps {
  vehicle: GarageVehicle;
  taxBracket: number;
}

export function BijtellingExplainer({
  vehicle,
  taxBracket,
}: BijtellingExplainerProps) {
  const t = useTranslations("bijtelling");
  const tCompare = useTranslations("compare");
  const [expanded, setExpanded] = useState(false);

  const catalogValue = vehicle.rdw.catalogusprijs ?? vehicle.user.purchasePrice;
  const bijtellingPercent = getBijtellingPercentage(vehicle);
  const bijtellingAmount = catalogValue * bijtellingPercent;
  const taxCost = bijtellingAmount * taxBracket;

  const isEV = isElectric(vehicle);
  const isYT = isYoungtimer(vehicle);
  const co2 = vehicle.rdw.co2_uitstoot_gecombineerd;

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: 0,
            border: "none",
            background: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
            <Icon name="info" size="sm" />
            <span style={{ fontWeight: 600 }}>{t("title")}</span>
          </div>
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size="sm" />
        </button>

        {expanded && (
          <>
            <Divider />

            <p style={{ margin: 0, color: "var(--color-text-subtle-default)" }}>
              {t("explanation")}
            </p>

            {/* Vehicle-specific calculation */}
            <div
              style={{
                background: "var(--color-surface-level1)",
                padding: "var(--spacing-3)",
                borderRadius: "var(--border-radius-md)",
              }}
            >
              <p
                style={{
                  margin: "0 0 var(--spacing-2) 0",
                  fontWeight: 600,
                }}
              >
                {t("calculationTitle")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t("catalogValue")}</span>
                  <span>{formatCurrency(catalogValue, 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t("percentage")}</span>
                  <span>× {formatPercentage(bijtellingPercent, 1)}</span>
                </div>
                <Divider />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t("taxableAmount")}</span>
                  <span>{formatCurrency(bijtellingAmount, 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t("taxRate")}</span>
                  <span>× {formatPercentage(taxBracket, 1)}</span>
                </div>
                <Divider />
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                  <span>{t("annualTaxCost")}</span>
                  <span>{formatCurrency(taxCost, 0)}</span>
                </div>
              </div>
            </div>

            {/* Rate explanation */}
            <div>
              <p style={{ margin: "0 0 var(--spacing-2) 0", fontWeight: 600 }}>
                {t("percentagesTitle")}
              </p>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  {t("standard")}
                  {!isEV && co2 !== null && co2 > 50 && (
                    <span style={{ marginLeft: "var(--spacing-2)" }}>
                      <Badge variant="info" size="sm">{t("thisVehicle")}</Badge>
                    </span>
                  )}
                </li>
                <li>
                  {t("electricRate")}
                  {isEV && (
                    <span style={{ marginLeft: "var(--spacing-2)" }}>
                      <Badge variant="success" size="sm">{t("thisVehicle")}</Badge>
                    </span>
                  )}
                </li>
                <li>
                  {t("phevRate")}
                  {!isEV && co2 !== null && co2 > 0 && co2 <= 50 && (
                    <span style={{ marginLeft: "var(--spacing-2)" }}>
                      <Badge variant="info" size="sm">{t("thisVehicle")}</Badge>
                    </span>
                  )}
                </li>
              </ul>
            </div>

            {/* Youngtimer info */}
            {isYT && (
              <div
                style={{
                  background: "var(--color-state-warning-background)",
                  padding: "var(--spacing-3)",
                  borderRadius: "var(--border-radius-md)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-2)" }}>
                  <Badge variant="warning">{tCompare("youngtimerAlert")}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)" }}>
                  {t("youngtimerNote", { discount: formatPercentage(TAX_CONSTANTS.bijtelling.youngtimerReduction, 0), effective: formatPercentage(bijtellingPercent, 1) })}
                </p>
              </div>
            )}

            {/* EV info */}
            {isEV && (
              <div
                style={{
                  background: "var(--color-state-info-background)",
                  padding: "var(--spacing-3)",
                  borderRadius: "var(--border-radius-md)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-2)" }}>
                  <Badge variant="info">{t("evTitle")}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)" }}>
                  {t("evNote")}
                </p>
              </div>
            )}

            {/* Link to source */}
            <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
              {t("moreInfo")}{" "}
              <a
                href="https://www.belastingdienst.nl/wps/wcm/connect/nl/auto-en-vervoer/content/bijtelling-privgebruik-auto"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-action-default)" }}
              >
                {t("taxAuthority")}
              </a>
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
