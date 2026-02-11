"use client";

import { Card, Badge, Icon } from "muka-ui";
import type { ComparisonResult } from "@/lib/comparison";
import { formatCurrency, formatPercentage } from "@/lib/formatting";

interface DifferenceSummaryProps {
  result: ComparisonResult;
}

export function DifferenceSummary({ result }: DifferenceSummaryProps) {
  const { difference, scenarios } = result;
  const { cheaperOption, annual, fiveYear, savingsPercent, breakEvenBusinessPercent } =
    difference;

  const cheaperLabel = cheaperOption === "business" ? "Zakelijk" : "Privé";
  const moreExpensiveLabel = cheaperOption === "business" ? "Privé" : "Zakelijk";
  const savings = Math.abs(annual);

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
        {/* Main headline */}
        <div
          style={{
            background: "var(--color-state-success-background)",
            padding: "var(--spacing-4)",
            borderRadius: "var(--border-radius-md)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--spacing-2)" }}>
            <Badge variant="success" size="lg">
              <Icon name="check" size="sm" />
              {cheaperLabel} is voordeliger
            </Badge>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-heading-lg-semibold-fontSize)",
              fontWeight: "var(--text-heading-lg-semibold-fontWeight)",
              color: "var(--color-state-success-foreground)",
            }}
          >
            {formatCurrency(savings, 0)} besparing per jaar
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-state-success-foreground)",
            }}
          >
            ({formatPercentage(savingsPercent, 0)} goedkoper dan {moreExpensiveLabel.toLowerCase()})
          </p>
        </div>

        {/* Five year projection */}
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
              Besparing over 5 jaar
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-heading-sm-semibold-fontSize)",
                fontWeight: "var(--text-heading-sm-semibold-fontWeight)",
              }}
            >
              {formatCurrency(Math.abs(fiveYear), 0)}
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
              Verschil per maand
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-heading-sm-semibold-fontSize)",
                fontWeight: "var(--text-heading-sm-semibold-fontWeight)",
              }}
            >
              {formatCurrency(savings / 12, 0)}
            </p>
          </div>
        </div>

        {/* Break-even info */}
        {breakEvenBusinessPercent !== null && (
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
              Break-even punt
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontWeight: 600,
              }}
            >
              Bij {formatPercentage(breakEvenBusinessPercent, 0)} zakelijk gebruik zijn de kosten gelijk
            </p>
          </div>
        )}

        {/* Cost comparison */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--spacing-3)",
            paddingTop: "var(--spacing-2)",
          }}
        >
          <div
            style={{
              padding: "var(--spacing-3)",
              borderRadius: "var(--border-radius-md)",
              border: `2px solid ${
                cheaperOption === "private"
                  ? "var(--color-state-success-default)"
                  : "var(--color-border-subtle)"
              }`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--text-label-sm-regular-fontSize)",
                color: "var(--color-text-subtle-default)",
              }}
            >
              Privé eigendom
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-heading-sm-semibold-fontSize)",
                fontWeight: "var(--text-heading-sm-semibold-fontWeight)",
                color:
                  cheaperOption === "private"
                    ? "var(--color-state-success-foreground)"
                    : undefined,
              }}
            >
              {formatCurrency(scenarios.private.netAnnualCost, 0)}/jaar
            </p>
          </div>
          <div
            style={{
              padding: "var(--spacing-3)",
              borderRadius: "var(--border-radius-md)",
              border: `2px solid ${
                cheaperOption === "business"
                  ? "var(--color-state-success-default)"
                  : "var(--color-border-subtle)"
              }`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--text-label-sm-regular-fontSize)",
                color: "var(--color-text-subtle-default)",
              }}
            >
              Zakelijk eigendom
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontSize: "var(--text-heading-sm-semibold-fontSize)",
                fontWeight: "var(--text-heading-sm-semibold-fontWeight)",
                color:
                  cheaperOption === "business"
                    ? "var(--color-state-success-foreground)"
                    : undefined,
              }}
            >
              {formatCurrency(scenarios.business.netAnnualCost, 0)}/jaar
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
