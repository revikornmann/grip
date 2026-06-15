"use client";

import {
  Fragment,
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
  Divider,
  Tabs,
  TabList,
  Tab,
  type IconName,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { useUnits } from "@/components/UnitsProvider";
import { convertSpecs, kmToMiles } from "@/lib/unitConversion";
import type {
  MotorcycleSpecs,
  MotorcycleSpecCategory,
  MotorcycleSpecRow,
} from "@/types/motorcycle";

/** Borderless spec table — first column fixed at 140px, all text left-aligned
 *  and text-default, no borders or background. */
function SpecTable({
  rows,
  columns = "140px 1fr",
}: {
  rows: MotorcycleSpecRow[];
  /** Grid template for the two columns. Defaults to a fixed 140px label column;
   *  torque-spec groups pass "1fr 1fr" for equal halves. */
  columns?: string;
}) {
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: columns,
        columnGap: "var(--spacing-4)",
        rowGap: "var(--spacing-3)",
        alignItems: "start",
        margin: 0,
        color: "var(--color-text-default-default)",
        fontSize: "var(--font-size-md)",
        lineHeight: "var(--text-body-base-regular-lineHeight)",
      }}
    >
      {rows.map((row) => (
        <Fragment key={row.label}>
          <dt style={{ margin: 0, textAlign: "left" }}>{row.label}</dt>
          <dd style={{ margin: 0, textAlign: "left" }}>
            {row.value}
            {row.hint && (
              <span style={{ display: "block", fontSize: "var(--font-size-sm)" }}>
                {row.hint}
              </span>
            )}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}

/** Group spec rows by their `group` field, preserving first-seen order. */
function groupRows(
  rows: MotorcycleSpecRow[],
): [string, MotorcycleSpecRow[]][] {
  const groups = new Map<string, MotorcycleSpecRow[]>();
  for (const row of rows) {
    const key = row.group ?? "";
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }
  return [...groups.entries()];
}

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
  "torqueSpecs",
];

/** Current epoch ms. Wrapped so the impure `Date.now` call lives outside the
 * component, keeping the React purity lint rule happy. */
function now(): number {
  return Date.now();
}

// Icon names map to the muka-ui (RemixIcon) registry keys used in the Figma
// design. Note the registry kebab-cases digits without a separator, e.g.
// RiDashboard2Line → "dashboard2", RiScales2Line → "scales2".
const CATEGORY_ICONS: Record<MotorcycleSpecCategory, IconName> = {
  identification: "information" as IconName,
  engine: "fire" as IconName,
  electrical: "flashlight" as IconName,
  engineOutput: "dashboard2" as IconName,
  drivetrain: "steam" as IconName,
  chassis: "motorbike" as IconName,
  brakes: "stop-circle" as IconName,
  wheelsTyres: "mastercard" as IconName,
  dimensions: "scales2" as IconName,
  fuelEconomy: "gas-station" as IconName,
  torqueSpecs: "tools" as IconName,
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
  const { units } = useUnits();

  // Spec values are stored in metric; convert to the chosen unit system for
  // display. Metric is the identity case, so this is a no-op cost-wise.
  const displaySpecs = useMemo(
    () => convertSpecs(specs, units),
    [specs, units],
  );

  const categories = useMemo(
    () =>
      SPEC_CATEGORY_ORDER.filter((c) => (displaySpecs[c]?.length ?? 0) > 0),
    [displaySpecs],
  );

  const [activeTab, setActiveTab] = useState<string>("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  // The tab bar stays hidden until the category cards scroll out of view.
  const [stuck, setStuck] = useState(false);
  const [tabBarH, setTabBarH] = useState(49);
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const tilesSentinelRef = useRef<HTMLDivElement>(null);
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
        if (now() < suppressUntil.current) return;
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

  // Reveal the sticky tab bar only once the category cards are scrolled past.
  useEffect(() => {
    if (!categories.length) return;
    const container = rootRef.current?.closest<HTMLElement>(".muka-view__body");
    const sentinel = tilesSentinelRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const rootTop = entry.rootBounds?.top ?? 0;
        setStuck(!entry.isIntersecting && entry.boundingClientRect.top <= rootTop);
      },
      { root: container, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [categories]);

  // Measure the tab bar so it can be overlaid (negative margin) without leaving
  // a gap in the layout while hidden.
  useEffect(() => {
    if (stickyRef.current) setTabBarH(stickyRef.current.offsetHeight);
  }, [categories]);

  // Keep the active tab centred in the (horizontally scrollable) tab strip.
  useEffect(() => {
    const scroller = tabScrollRef.current;
    const active = scroller?.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]',
    );
    if (!scroller || !active) return;
    const sRect = scroller.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    const delta =
      aRect.left + aRect.width / 2 - (sRect.left + sRect.width / 2);
    scroller.scrollTo({ left: scroller.scrollLeft + delta, behavior: "smooth" });
  }, [currentTab, stuck]);

  // Clicking the TopBar title scrolls the view back to the top.
  useEffect(() => {
    if (loading || error) return;
    const container = rootRef.current?.closest<HTMLElement>(".muka-view__body");
    const title = rootRef.current
      ?.closest(".muka-view")
      ?.querySelector<HTMLElement>(".muka-topbar__title");
    if (!container || !title) return;
    const onClick = () => container.scrollTo({ top: 0, behavior: "smooth" });
    title.style.cursor = "pointer";
    title.addEventListener("click", onClick);
    return () => title.removeEventListener("click", onClick);
  }, [loading, error]);

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
    suppressUntil.current = now() + 700;
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
    <View level="sub" surfaceLevel={3} title={title} leading={back} footer={footer}>
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
          {/* Header — scrolls away */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-2)",
              padding: "var(--spacing-8) var(--spacing-6) var(--spacing-4)",
              maxWidth: "720px",
              margin: "0 auto",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "var(--font-size-3xl)" }}>
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  margin: 0,
                  color: "var(--color-text-subtle-default)",
                  fontSize: "var(--font-size-xl)",
                }}
              >
                {subtitle}
              </p>
            )}
            {mileageKm != null && (
              <p
                style={{
                  margin: 0,
                  color: "var(--color-text-subtle-default)",
                }}
              >
                {t("mileageLabel")}:{" "}
                {units === "imperial"
                  ? `${kmToMiles(mileageKm).toLocaleString()} ${t("milesUnit")}`
                  : `${mileageKm.toLocaleString()} ${t("kilometersUnit")}`}
              </p>
            )}
          </div>

          {categories.length === 0 ? (
            <div style={{ padding: "0 var(--spacing-6) var(--spacing-6)" }}>
              <Alert variant="info">{t("noSpecs")}</Alert>
            </div>
          ) : (
            <>
              {/* Specifications heading + category tiles (anchor links) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-6)",
                  padding: "0 var(--spacing-6) var(--spacing-6)",
                  maxWidth: "720px",
                  margin: "0 auto",
                }}
              >
                <Divider />
                <h2 style={{ margin: 0, fontSize: "var(--font-size-2xl)" }}>
                  {t("specifications")}
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "var(--spacing-4)",
                  }}
                >
                  {categories.map((c) => (
                    <Card
                      key={c}
                      variant="interactive"
                      padding="lg"
                      onClick={() => handleTabChange(c)}
                      aria-label={tCat(c)}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "var(--spacing-2)",
                          textAlign: "center",
                        }}
                      >
                        <Icon name={CATEGORY_ICONS[c]} size="lg" />
                        <span style={{ fontSize: "var(--font-size-sm)" }}>
                          {tCat(c)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Marks the bottom of the cards — once it scrolls past the top,
                  the tab bar is revealed. */}
              <div ref={tilesSentinelRef} aria-hidden style={{ height: 0 }} />

              {/* Sticky scrollspy tab bar — hidden until scrolled past the cards.
                  Negative margin removes its flow height so revealing it doesn't
                  shift the layout; it overlays the content below. */}
              <div
                ref={stickyRef}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 3,
                  marginBottom: `${-tabBarH}px`,
                  background: "var(--color-surface-level3)",
                  borderBottom: "1px solid var(--color-border-default)",
                  opacity: stuck ? 1 : 0,
                  transform: stuck ? "translateY(0)" : "translateY(-8px)",
                  pointerEvents: stuck ? "auto" : "none",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                }}
              >
                <div
                  ref={tabScrollRef}
                  className="grip-tab-scroll"
                  style={{ maxWidth: "720px", margin: "0 auto" }}
                >
                  <div className="grip-tab-scroll__inner">
                  <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    alignment="left"
                  >
                    <TabList>
                      {categories.map((c) => (
                        <Tab key={c} value={c}>
                          {tCat(c)}
                        </Tab>
                      ))}
                    </TabList>
                  </Tabs>
                  </div>
                </div>
              </div>

              {/* Sections — spec tables rendered directly on the page */}
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
                {categories.map((c, i) => (
                  <Fragment key={c}>
                    {i > 0 && <Divider />}
                    <section
                      data-category={c}
                      ref={(el) => {
                        if (el) sectionRefs.current.set(c, el);
                        else sectionRefs.current.delete(c);
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-4)",
                        scrollMarginTop: "var(--spacing-12)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--spacing-3)",
                        }}
                      >
                        <Icon name={CATEGORY_ICONS[c]} size="md" />
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "var(--font-size-xl)",
                          }}
                        >
                          {tCat(c)}
                        </h2>
                      </div>
                      {displaySpecs[c]!.some((row) => row.group) ? (
                        // Long lists (torque specs) split into expandable subgroups.
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {groupRows(displaySpecs[c]!).map(([group, rows], gi) => {
                            const key = `${c}:${group}`;
                            const open = openGroups[key] ?? false;
                            return (
                              <div key={key}>
                                {gi > 0 && <Divider />}
                                <button
                                  type="button"
                                  aria-expanded={open}
                                  onClick={() =>
                                    setOpenGroups((p) => ({
                                      ...p,
                                      [key]: !open,
                                    }))
                                  }
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "var(--spacing-3)",
                                    width: "100%",
                                    padding: "var(--spacing-3) 0",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    font: "inherit",
                                    textAlign: "left",
                                    color: "var(--color-text-default-default)",
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "flex",
                                      alignItems: "baseline",
                                      gap: "var(--spacing-2)",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "var(--font-size-md)",
                                        fontWeight:
                                          "var(--alias-font-plain-weight-semibold)",
                                      }}
                                    >
                                      {group}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "var(--font-size-sm)",
                                        color:
                                          "var(--color-text-subtle-default)",
                                      }}
                                    >
                                      {rows.length}
                                    </span>
                                  </span>
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      transition: "transform 0.15s ease",
                                      transform: open
                                        ? "rotate(180deg)"
                                        : "none",
                                    }}
                                  >
                                    <Icon name="arrow-down-s" size="md" />
                                  </span>
                                </button>
                                {open && (
                                  <div style={{ padding: "var(--spacing-2) 0 var(--spacing-4)" }}>
                                    <SpecTable rows={rows} columns="1fr 1fr" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <SpecTable rows={displaySpecs[c]!} />
                      )}
                    </section>
                  </Fragment>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </View>
  );
}
