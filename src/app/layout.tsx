import type { Metadata } from "next";
import "./globals.css";
// Import Muka UI styles (includes tokens + component styles)
import "muka-ui/styles/index.css";
import { Header, Footer } from "@/components/layout";

export const metadata: Metadata = {
  title: "Tax Calculator - Dutch ZZP Vehicle Tax Optimization",
  description: "Vehicle tax optimization tool for Dutch ZZP professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <div className="app-layout">
          <Header />
          <main className="app-main">
            <div className="app-main__content">{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
