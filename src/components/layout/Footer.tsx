"use client";

import { Divider } from "muka-ui";

export function Footer() {
  return (
    <footer className="app-footer">
      <Divider />
      <div className="app-footer__inner" style={{ marginTop: "var(--spacing-4)" }}>
        <div className="app-footer__links">
          <a href="/privacy" className="footer-link">
            Privacy
          </a>
          <span className="app-footer__divider-vertical">
            <Divider orientation="vertical" />
          </span>
          <a href="/about" className="footer-link">
            Over ons
          </a>
          <span className="app-footer__divider-vertical">
            <Divider orientation="vertical" />
          </span>
          <a href="/feedback" className="footer-link">
            Feedback
          </a>
        </div>
        <p className="app-footer__tagline">
          Voertuig belasting optimalisatie voor ZZP&apos;ers
        </p>
      </div>
    </footer>
  );
}
