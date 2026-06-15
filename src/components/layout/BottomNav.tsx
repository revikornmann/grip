"use client";

import type { IconName } from "muka-ui";
import { usePathname, useRouter } from "next/navigation";
import { BottomBar, BottomBarTab, Icon } from "muka-ui";
import { useTranslations } from "next-intl";

const NAV_ITEMS: { href: string; labelKey: string; iconName: IconName }[] = [
  { href: "/", labelKey: "bottomSearch", iconName: "search" },
  { href: "/garage", labelKey: "bottomGarage", iconName: "motorbike" },
  { href: "/assistant", labelKey: "bottomAssistant", iconName: "chat-1" },
  { href: "/settings", labelKey: "bottomSettings", iconName: "settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <div className="app-bottomnav">
      <BottomBar variant="navigation" floating>
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
      </BottomBar>
    </div>
  );
}
