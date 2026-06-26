import type { Metadata } from "next";
import "./globals.css";
import "@revikornmann/muka-ui/styles";
import { TopNav, BottomNav, Footer, MainContent } from "@/components/layout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LocaleProvider } from "@/components/LocaleProvider";

export const metadata: Metadata = {
  title: "Grip - Dutch ZZP Vehicle Tax Optimization",
  description: "Vehicle tax optimization tool for Dutch ZZP professionals",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LocaleProvider>
          <ThemeProvider>
            <AuthProvider>
              <div className="app-layout">
                <div className="app-topnav">
                  <TopNav />
                </div>
                <main className="app-main">
                  <MainContent>{children}</MainContent>
                  <Footer />
                </main>
                <BottomNav />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
