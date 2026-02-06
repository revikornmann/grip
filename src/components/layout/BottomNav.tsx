"use client";

import { usePathname, useRouter } from "next/navigation";
import { BottomBar, BottomBarTab, Icon } from "muka-ui";

function HomeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 11l2-5h10l2 5" />
      <path d="M3 11h18v6c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1v-6z" />
      <circle cx="7.5" cy="15.5" r="1.5" />
      <circle cx="16.5" cy="15.5" r="1.5" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8" y2="10.01" />
      <line x1="12" y1="10" x2="12" y2="10.01" />
      <line x1="16" y1="10" x2="16" y2="10.01" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="16" y1="14" x2="16" y2="18" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/garage", label: "Garage", icon: CarIcon },
  { href: "/calculator", label: "Calculator", icon: CalculatorIcon },
  { href: "/compare", label: "Vergelijk", icon: CompareIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="app-bottomnav">
      <BottomBar variant="navigation" floating>
        {NAV_ITEMS.map(({ href, label, icon: NavIcon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <BottomBarTab
              key={href}
              icon={
                <Icon size="md">
                  <NavIcon />
                </Icon>
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
