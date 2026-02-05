"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationProps {
  orientation: "horizontal" | "vertical";
  onNavigate?: () => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/garage", label: "Garage" },
  { href: "/calculator", label: "Calculator" },
  { href: "/compare", label: "Vergelijk" },
];

export function Navigation({ orientation, onNavigate }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Hoofdnavigatie">
      <ul
        className={`nav-list${orientation === "vertical" ? " nav-list--vertical" : ""}`}
      >
        {NAV_ITEMS.map(({ href, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link${isActive ? " nav-link--active" : ""}`}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
