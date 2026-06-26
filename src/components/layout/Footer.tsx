"use client";

import { Divider, Container, Section } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer>
      <Divider />
      <Section padding="compact" as="div">
        <Container maxWidth="xlarge">
          <div className="app-footer__inner">
            <div className="app-footer__links">
              <a href="/privacy" className="footer-link">
                {t("privacy")}
              </a>
              <span className="app-footer__divider-vertical">
                <Divider orientation="vertical" />
              </span>
              <a href="/about" className="footer-link">
                {t("about")}
              </a>
              <span className="app-footer__divider-vertical">
                <Divider orientation="vertical" />
              </span>
              <a href="/feedback" className="footer-link">
                {t("feedback")}
              </a>
            </div>
            <p className="app-footer__tagline">
              {t("tagline")}
            </p>
          </div>
        </Container>
      </Section>
    </footer>
  );
}
