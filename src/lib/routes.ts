const TOP_LEVEL_ROUTES = new Set<string>([
  "/",
  "/garage",
  "/assistant",
  "/settings",
]);

// Route prefixes that always render as sub-level (own View TopBar, no bottom nav).
const SUB_LEVEL_PREFIXES = ["/garage/", "/model/", "/settings/"];

export function isSubLevelRoute(pathname: string): boolean {
  if (TOP_LEVEL_ROUTES.has(pathname)) return false;
  return SUB_LEVEL_PREFIXES.some((p) => pathname.startsWith(p));
}
