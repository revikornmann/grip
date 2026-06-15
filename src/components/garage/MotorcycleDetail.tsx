"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  View,
  Button,
  Icon,
  Spinner,
  Alert,
  Card,
  Tabs,
  TabList,
  Tab,
  SpecList,
  SpecRow,
  type IconName,
} from "muka-ui";
import { useTranslations } from "next-intl";
import type {
  MotorcycleSpecs,
  MotorcycleSpecCategory,
} from "@/types/motorcycle";

const SPEC_CATEGORY_ORDER: MotorcycleSpecCategory[] = [
  "identification",
  "engine",
  "electrical",
  "engineOutput",
  "drivetrain",
  "chassis",
  "brakes",
  "wheelsTyres",
  "dimensions",
  "fuelEconomy",
  "measuredPerformance",
];

const CATEGORY_ICONS: Record<MotorcycleSpecCategory, IconName> = {
  identification: "information" as IconName,
  engine: "fire" as IconName,
  electrical: "flashlight" as IconName,
  engineOutput: "dashboard-3" as IconName,
  drivetrain: "settings-3" as IconName,
  chassis: "links" as IconName,
  brakes: "stop-circle" as IconName,
  wheelsTyres: "disc" as IconName,
  dimensions: "ruler-2" as IconName,
  fuelEconomy: "gas-station" as IconName,
  measuredPerformance: "timer" as IconName,
};

interface Props {
  title: string;
  subtitle?: string | null;
  mileageKm?: number | null;
  specs: MotorcycleSpecs;
  loading?: boolean;
  error?: string | null;
  /** Sticky footer slot, e.g. an "Add to garage" button on the catalog preview. */
  footer?: ReactNode;
  onBack: () => void;
}

export function MotorcycleDetail({
  title,
  subtitle,
  mileageKm,
  specs,
  loading = false,
  error = null,
  footer,
  onBack,
}: Props) {
  const t = useTranslations("garage");
  const tNav = useTranslations("nav");
  const tCat = useTranslations("specCategories");

  const categories = useMemo(
    () =>
      SPEC_CATEGORY_ORDER.filter((c) => (specs[c]?.length ?? 0) > 0),
    [specs],
  );

  const [activeTab, setActiveTab] = useState<string>("");
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  // Suppress scrollspy updates briefly while a tab-click smooth-scroll runs.
  const suppressUntil = useRef(0);

  // Default to the first category until the user scrolls or taps a tab.
  const currentTab =
    activeTab && categories.includes(activeTab as MotorcycleSpecCategory)
      ? activeTab
      : (categories[0] ?? "");

  // Scrollspy: mark the top-most section crossing ~45% of the viewport active.
  useEffect(() => {
    if (!categories.length) return;
    const container = rootRef.current?.closest<HTMLElement>(".muka-view__body");
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < suppressUntil.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          const id = visible[0].target.getAttribute("data-category");
          if (id) setActiveTab(id);
        }
      },
      { root: container, rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const container = rootRef.current?.closest<HTMLElement>(".muka-view__body");
    const section = sectionRefs.current.get(value);
    if (!container || !section) return;
    const stickyH = stickyRef.current?.offsetHeight ?? 0;
    const delta =
      section.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      stickyH -
      8;
    suppressUntil.current = Date.now() + 700;
    container.scrollTo({ top: container.scrollTop + delta, behavior: "smooth" });
  };

  const back = (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={tNav("back")}
      onClick={onBack}
    >
      <Icon name="arrow-left" size="md" />
    </Button>
  );

  return (
    <View level="sub" title={title} leading={back} footer={footer}>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "var(--spacing-8) 0",
          }}
        >
          <Spinner />
        </div>
      ) : error ? (
        <div style={{ padding: "var(--spacing-6)" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : (
        <div ref={rootRef}>
          {/* Header card — scrolls away */}
          <div
            style={{
              padding: "var(--spacing-6) var(--spacing-6) var(--spacing-4)",
              maxWidth: "720px",
              margin: "0 auto",
            }}
          >
            <Card padding="lg">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-2)",
                }}
              >
                {subtitle && (
                  <p
                    style={{
                      margin: 0,
                      color: "var(--color-text-subtle-default)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    {subtitle}
                  </p>
                )}
                <h1 style={{ margin: 0, fontSize: "var(--font-size-2xl)" }}>
                  {title}
                </h1>
                {mileageKm != null && (
                  <p
                    style={{
                      margin: 0,
                      color: "var(--color-text-subtle-default)",
                    }}
                  >
                    {t("mileageLabel")}: {mileageKm.toLocaleString()}{" "}
                    {t("kilometersUnit")}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {categories.length === 0 ? (
            <div style={{ padding: "0 var(--spacing-6) var(--spacing-6)" }}>
              <Alert variant="info">{t("noSpecs")}</Alert>
            </div>
          ) : (
            <>
              {/* Sticky scrollspy tab bar */}
              <div
                ref={stickyRef}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  background: "var(--color-surface-level2)",
                  boxShadow: "var(--shadow-level1)",
                }}
              >
                <div style={{ maxWidth: "720px", margin: "0 auto" }}>
                  <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    alignment="left"
                  >
                    <TabList>
                      {categories.map((c) => (
                        <Tab
                          key={c}
                          value={c}
                          icon={<Icon name={CATEGORY_ICONS[c]} />}
                        >
                          {tCat(c)}
                        </Tab>
                      ))}
                    </TabList>
                  </Tabs>
                </div>
              </div>

              {/* Sections */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-6)",
                  padding: "var(--spacing-6)",
                  maxWidth: "720px",
                  margin: "0 auto",
                }}
              >
                {categories.map((c) => (
                  <section
                    key={c}
                    data-category={c}
                    ref={(el) => {
                      if (el) sectionRefs.current.set(c, el);
                      else sectionRefs.current.delete(c);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-3)",
                      scrollMarginTop: "var(--spacing-12)",
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>
                      {tCat(c)}
                    </h2>
                    <Card padding="none">
                      <SpecList>
                        {specs[c]!.map((row) => (
                          <SpecRow
                            key={row.label}
                            label={row.label}
                            value={row.value}
                            hint={row.hint}
                          />
                        ))}
                      </SpecList>
                    </Card>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </View>
  );
}
