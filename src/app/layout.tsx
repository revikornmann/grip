import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@revikornmann/muka-ui/styles/index.css";
import "@revikornmann/muka-ui/styles/fonts-grip.css";
import { AppShell } from "@/components/layout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { UnitsProvider } from "@/components/UnitsProvider";
import { RegionProvider } from "@/components/RegionProvider";

export const metadata: Metadata = {
  title: "Grip — Motorcycle garage",
  description: "Manage your motorcycles, track maintenance, and ask an AI mechanic anything.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const themeScript = `
(function() {
  try {
    var raw = localStorage.getItem('grip:theme');
    var parsed = raw ? JSON.parse(raw) : null;
    var theme = parsed && parsed.data ? parsed.data : 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    var lightLink = document.createElement('link');
    lightLink.id = 'grip-light-tokens';
    lightLink.rel = 'stylesheet';
    lightLink.href = '/themes/tokens-grip-light.css';
    document.head.appendChild(lightLink);
    if (resolved === 'dark') {
      var darkLink = document.createElement('link');
      darkLink.id = 'grip-dark-tokens';
      darkLink.rel = 'stylesheet';
      darkLink.href = '/themes/tokens-grip-dark.css';
      document.head.appendChild(darkLink);
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LocaleProvider>
          <RegionProvider>
            <UnitsProvider>
              <ThemeProvider>
                <AuthProvider>
                  <AppShell>{children}</AppShell>
                </AuthProvider>
              </ThemeProvider>
            </UnitsProvider>
          </RegionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
