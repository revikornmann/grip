import type { Metadata } from "next";
import "./globals.css";
import "muka-ui/styles/index.css";
import { TopNav, BottomNav, Footer, MainContent } from "@/components/layout";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Tax Calculator - Dutch ZZP Vehicle Tax Optimization",
  description: "Vehicle tax optimization tool for Dutch ZZP professionals",
};

const themeScript = `
(function() {
  try {
    var raw = localStorage.getItem('tax-calc:theme');
    var parsed = raw ? JSON.parse(raw) : null;
    var theme = parsed && parsed.data ? parsed.data : 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    if (resolved === 'dark') {
      var link = document.createElement('link');
      link.id = 'muka-dark-tokens';
      link.rel = 'stylesheet';
      link.href = '/themes/tokens-muka-dark.css';
      document.head.appendChild(link);
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
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
