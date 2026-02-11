"use client";

import type { ReactNode } from "react";
import { Container, Section } from "muka-ui";

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <Section padding="default">
      <Container maxWidth="large" gap="default">
        <>{children}</>
      </Container>
    </Section>
  );
}
