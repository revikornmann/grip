"use client";

import { useTranslations } from "next-intl";
import { Card, Badge, Icon } from "@revikornmann/muka-ui";
import type { ComparisonResult } from "@/lib/comparison";
import { formatCurrency, formatPercentage } from "@/lib/formatting";

interface DifferenceSummaryProps {
  result: ComparisonResult;
}

export function DifferenceSummary({ result }: DifferenceSummaryProps) {
  const t = useTranslations("compare");
  const tCosts = useTranslations("costs");
  const { difference, scenarios } = result;
  const { cheaperOption, annual, fiveYear, savingsPercent, breakEvenBusinessPercent } =
    difference;

  const cheaperLabel = cheaperOption === "business" ? tCosts("business") : tCosts("private");
  const moreExpensiveLabel = cheaperOption === "business" ? tCosts("private") : tCosts("business");
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
              {cheaperOption === "business" ? t("businessCheaper") : t("privateCheaper")}
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
            {t("savingsPerYear", { amount: formatCurrency(savings, 0) })}
          </p>
          <p
            style={{
              margin: "var(--spacing-1) 0 0 0",
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-state-success-foreground)",
            }}
          >
            {t("cheaperThan", { percent: formatPercentage(savingsPercent, 0), label: moreExpensiveLabel.toLowerCase() })}
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
              {t("savingsOver5Years")}
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
              {t("differencePerMonth")}
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
              {t("breakEvenPoint")}
            </p>
            <p
              style={{
                margin: "var(--spacing-1) 0 0 0",
                fontWeight: 600,
              }}
            >
              {t("breakEvenDescription", { percent: formatPercentage(breakEvenBusinessPercent, 0) })}
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
              {tCosts("privateOwnership")}
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
              {formatCurrency(scenarios.private.netAnnualCost, 0)}{t("perYear")}
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
              {tCosts("businessOwnership")}
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
              {formatCurrency(scenarios.business.netAnnualCost, 0)}{t("perYear")}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
