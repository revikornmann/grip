"use client";

import { Divider, Container, Section } from "muka-ui";

export function Footer() {
  return (
    <footer>
      <Divider />
      <Section padding="compact" as="div">
        <Container maxWidth="xlarge">
          <div className="app-footer__inner">
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
        </Container>
      </Section>
    </footer>
  );
}
