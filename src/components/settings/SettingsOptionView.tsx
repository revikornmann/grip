"use client";

import { useRouter } from "next/navigation";
import {
  View,
  Breadcrumb,
  Button,
  Icon,
  RadioTile,
  Container,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";

export interface SettingsOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  /** TopBar title for the sub-page */
  title: string;
  /** Radio group name */
  name: string;
  /** Selectable options */
  options: SettingsOption<T>[];
  /** Currently selected value */
  selected: T;
  /** Selection handler */
  onSelect: (value: T) => void;
}

/**
 * Full-screen sub-page that presents a single-choice setting as a list of
 * RadioTiles, with a back button in the TopBar. Used for Language, Units and
 * Theme settings (see the Settings design).
 */
export function SettingsOptionView<T extends string>({
  title,
  name,
  options,
  selected,
  onSelect,
}: Props<T>) {
  const router = useRouter();
  const tNav = useTranslations("nav");

  const back = (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={tNav("back")}
      onClick={() => router.push("/settings")}
    >
      <Icon name="arrow-left" size="md" />
    </Button>
  );

  // Desktop breadcrumb (shown ≥1024px in place of the back button).
  const breadcrumb = (
    <Breadcrumb
      size="sm"
      items={[
        { label: tNav("settings"), onClick: () => router.push("/settings") },
        { label: title },
      ]}
    />
  );

  return (
    <View
      level="sub"
      surfaceLevel={3}
      title={title}
      leading={back}
      breadcrumb={breadcrumb}
    >
      <div style={{ padding: "var(--spacing-6) var(--spacing-4)" }}>
        <Container maxWidth="large" gap="none">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-4)",
            }}
          >
            {options.map((option) => (
              <RadioTile
                key={option.value}
                name={name}
                value={option.value}
                label={option.label}
                checked={selected === option.value}
                onChange={() => onSelect(option.value)}
              />
            ))}
          </div>
        </Container>
      </div>
    </View>
  );
}
