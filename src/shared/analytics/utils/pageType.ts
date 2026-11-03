export type PageType = "home" | "experience" | "saved" | "search" | "profile" | "info";

export function pageTypeOf(pathname: string): PageType {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/experiences/")) return "experience";
  if (pathname.startsWith("/saved")) return "saved";
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/profile")) return "profile";
  return "info";
}
