"use client";

import { useState } from "react";
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
            <span style={{ fontWeight: 600 }}>Wat is bijtelling?</span>
          </div>
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size="sm" />
        </button>

        {expanded && (
          <>
            <Divider />

            <p style={{ margin: 0, color: "var(--color-text-subtle-default)" }}>
              Bij zakelijk eigendom wordt privégebruik van de auto als inkomen
              belast. Dit heet <strong>bijtelling</strong>. De hoogte hangt af van
              de cataloguswaarde en het bijtellingpercentage.
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
                Berekening voor dit voertuig:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Cataloguswaarde</span>
                  <span>{formatCurrency(catalogValue, 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Bijtellingpercentage</span>
                  <span>× {formatPercentage(bijtellingPercent, 1)}</span>
                </div>
                <Divider />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Bijtelling (belastbaar)</span>
                  <span>{formatCurrency(bijtellingAmount, 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Belastingtarief</span>
                  <span>× {formatPercentage(taxBracket, 1)}</span>
                </div>
                <Divider />
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                  <span>Jaarlijkse belastingkosten</span>
                  <span>{formatCurrency(taxCost, 0)}</span>
                </div>
              </div>
            </div>

            {/* Rate explanation */}
            <div>
              <p style={{ margin: "0 0 var(--spacing-2) 0", fontWeight: 600 }}>
                Bijtellingpercentages (2024):
              </p>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <strong>22%</strong> — Standaard voor alle voertuigen
                  {!isEV && co2 !== null && co2 > 50 && (
                    <span style={{ marginLeft: "var(--spacing-2)" }}>
                      <Badge variant="info" size="sm">Dit voertuig</Badge>
                    </span>
                  )}
                </li>
                <li>
                  <strong>16%</strong> — Elektrische voertuigen (0 g/km CO₂)
                  {isEV && (
                    <span style={{ marginLeft: "var(--spacing-2)" }}>
                      <Badge variant="success" size="sm">Dit voertuig</Badge>
                    </span>
                  )}
                </li>
                <li>
                  <strong>16%</strong> — Plug-in hybride (≤50 g/km CO₂)
                  {!isEV && co2 !== null && co2 > 0 && co2 <= 50 && (
                    <span style={{ marginLeft: "var(--spacing-2)" }}>
                      <Badge variant="info" size="sm">Dit voertuig</Badge>
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
                  <Badge variant="warning">Youngtimer</Badge>
                </div>
                <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)" }}>
                  Dit voertuig is 15+ jaar oud en kwalificeert als youngtimer.
                  De bijtelling is {formatPercentage(TAX_CONSTANTS.bijtelling.youngtimerReduction, 0)} lager,
                  wat resulteert in een effectief percentage van{" "}
                  {formatPercentage(bijtellingPercent, 1)}.
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
                  <Badge variant="info">Elektrisch voertuig</Badge>
                </div>
                <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)" }}>
                  Elektrische voertuigen profiteren van een verlaagd
                  bijtellingpercentage van 16%. Let op: dit percentage kan in
                  toekomstige jaren stijgen.
                </p>
              </div>
            )}

            {/* Link to source */}
            <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
              Meer informatie:{" "}
              <a
                href="https://www.belastingdienst.nl/wps/wcm/connect/nl/auto-en-vervoer/content/bijtelling-privgebruik-auto"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-action-default)" }}
              >
                Belastingdienst.nl
              </a>
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
