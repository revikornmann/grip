const TOP_LEVEL_ROUTES = new Set<string>([
  "/",
  "/garage",
  "/assistant",
  "/settings",
]);

// Route prefixes that always render as sub-level (own View TopBar, no bottom nav).
// "/brand" (no trailing slash) covers both the brand-models view and its nested
// "/brand/years" year picker — both carry a make/model in the query string.
const SUB_LEVEL_PREFIXES = ["/garage/", "/model/", "/settings/", "/brand"];

export function isSubLevelRoute(pathname: string): boolean {
  if (TOP_LEVEL_ROUTES.has(pathname)) return false;
  return SUB_LEVEL_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Navigation depth, used to pick the slide direction between views: top-level
 * tabs are all depth 0; deeper routes count their path segments (`/brand` = 1,
 * `/brand/years` = 2, `/settings/region` = 2). A larger depth means "further in"
 * (slide forward), a smaller depth means "back".
 */
export function routeDepth(pathname: string): number {
  if (TOP_LEVEL_ROUTES.has(pathname)) return 0;
  return pathname.split("/").filter(Boolean).length;
}

export type TransitionDirection = "forward" | "back" | "none";

/** Slide direction when moving from `prev` to `next` (see `routeDepth`). */
export function transitionDirection(
  prev: string | null,
  next: string,
): TransitionDirection {
  if (prev === null || prev === next) return "none";
  const dp = routeDepth(prev);
  const dn = routeDepth(next);
  if (dn > dp) return "forward";
  if (dn < dp) return "back";
  // Same depth: deeper-level siblings (e.g. year list → model detail) slide
  // forward; top-level tab switches (depth 0) don't slide.
  return dn === 0 ? "none" : "forward";
}
