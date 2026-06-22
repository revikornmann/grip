"use client";

import type { IconName } from "@revikornmann/muka-ui";
import { usePathname, useRouter } from "next/navigation";
import { BottomBar, BottomBarTab, Icon } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";

const NAV_ITEMS: { href: string; labelKey: string; iconName: IconName }[] = [
  { href: "/", labelKey: "bottomSearch", iconName: "search" },
  { href: "/garage", labelKey: "bottomGarage", iconName: "motorbike" },
  { href: "/assistant", labelKey: "bottomAssistant", iconName: "chat1" },
  { href: "/settings", labelKey: "bottomSettings", iconName: "settings4" },
];

/**
 * NavTabs — the shared set of navigation tab items.
 *
 * Rendered inside a BottomBar in two places (see the Muka AppShell pattern):
 * the floating mobile bottom bar (top-level View footer) and the desktop
 * sidebar rail. Active state and routing are identical in both.
 */
export function NavTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <>
      {NAV_ITEMS.map(({ href, labelKey, iconName }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <BottomBarTab
            key={href}
            icon={
              <Icon
                name={iconName}
                size="md"
                variant={isActive ? "fill" : "line"}
              />
            }
            label={t(labelKey)}
            active={isActive}
            onClick={() => router.push(href)}
          />
        );
      })}
    </>
  );
}

/**
 * SidebarNav — desktop navigation rail for the AppShell `sidebar` slot.
 *
 * `desktopAs="sidebar"` turns the navigation BottomBar into a fixed 240px left
 * rail at the large tier (≥1024px); the AppShell hides this slot below it.
 */
export function SidebarNav() {
  return (
    <BottomBar variant="navigation" desktopAs="sidebar">
      <NavTabs />
    </BottomBar>
  );
}
