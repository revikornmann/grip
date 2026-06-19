"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { MainContent } from "./MainContent";
import { SearchProvider } from "@/components/search/SearchContext";
import { isSubLevelRoute, transitionDirection } from "@/lib/routes";

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const subLevel = isSubLevelRoute(pathname);

  // Slide direction is derived from the route depth of the previous vs current
  // pathname (see transitionDirection). Keying the wrapper on the pathname
  // remounts it each navigation so the CSS enter-animation replays.
  const prevPathname = useRef<string | null>(null);
  const direction = transitionDirection(prevPathname.current, pathname);
  useEffect(() => {
    prevPathname.current = pathname;
  }, [pathname]);

  const transitionClass = `app-transition app-transition--${direction}`;

  if (subLevel) {
    return (
      <div className={transitionClass} key={pathname}>
        <div className="app-layout app-layout--sub">{children}</div>
      </div>
    );
  }

  // SearchProvider hosts the search overlay and powers the TopNav search field;
  // only the top-level shell needs it (sub-level routes have no search bar). It
  // sits outside the keyed wrapper so it survives top-level tab switches.
  return (
    <SearchProvider>
      <div className={transitionClass} key={pathname}>
        <div className="app-layout">
          <div className="app-topnav">
            <TopNav />
          </div>
          <main className="app-main">
            <MainContent>{children}</MainContent>
          </main>
          <BottomNav />
        </div>
      </div>
    </SearchProvider>
  );
}
