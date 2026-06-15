"use client";

import { Toggle } from "@revikornmann/muka-ui";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Toggle
      label="Donker thema"
      checked={resolvedTheme === "dark"}
      onChange={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      name="theme-toggle"
    />
  );
}
