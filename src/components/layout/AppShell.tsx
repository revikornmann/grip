"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { MainContent } from "./MainContent";
import { isSubLevelRoute } from "@/lib/routes";

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const subLevel = isSubLevelRoute(pathname);

  if (subLevel) {
    return <div className="app-layout app-layout--sub">{children}</div>;
  }

  return (
    <div className="app-layout">
      <div className="app-topnav">
        <TopNav />
      </div>
      <main className="app-main">
        <MainContent>{children}</MainContent>
      </main>
      <BottomNav />
    </div>
  );
}
