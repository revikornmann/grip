"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Divider } from "muka-ui";
import { Navigation } from "./Navigation";
import { ThemeToggle } from "../ThemeToggle";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link href="/" className="app-header__title">
          Tax Calculator
        </Link>

        <div className="app-header__nav-desktop">
          <Navigation orientation="horizontal" />
          <ThemeToggle />
        </div>

        <div className="app-header__nav-mobile">
          <Button
            iconOnly
            variant="ghost"
            size="lg"
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </Button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="mobile-menu-backdrop"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div className="mobile-menu" id="mobile-menu" role="navigation">
            <Navigation orientation="vertical" onNavigate={closeMenu} />
            <div style={{ padding: "var(--spacing-4) var(--spacing-6)" }}>
              <ThemeToggle />
            </div>
          </div>
        </>
      )}

      <Divider />
    </header>
  );
}
