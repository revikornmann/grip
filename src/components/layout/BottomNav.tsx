"use client";

import type { IconName } from "muka-ui";
import { usePathname, useRouter } from "next/navigation";
import { BottomBar, BottomBarTab, Icon } from "muka-ui";

const NAV_ITEMS: { href: string; label: string; iconName: IconName }[] = [
  { href: "/", label: "Home", iconName: "home" },
  { href: "/garage", label: "Garage", iconName: "car" },
  { href: "/calculator", label: "Calculator", iconName: "calculator" },
  { href: "/compare", label: "Vergelijk", iconName: "bar-chart" },
  { href: "/tracking", label: "Ritten", iconName: "map-pin" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="app-bottomnav">
      <BottomBar variant="navigation" floating>
        {NAV_ITEMS.map(({ href, label, iconName }) => {
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
              label={label}
              active={isActive}
              onClick={() => router.push(href)}
            />
          );
        })}
      </BottomBar>
    </div>
  );
}
