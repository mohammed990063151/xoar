import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "./lib/i18n";
import { portalPath } from "./lib/portal-url";

function isAccountPath(pathname: string): boolean {
  return /^\/(ar|en)\/account(\/|$)/.test(pathname);
}

function isAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    /^\/(ar|en)\/(admin|dashboard|login)(\/|$)/.test(pathname)
  );
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname)) {
    const adminBase =
      process.env.NEXT_PUBLIC_ADMIN_URL?.trim().replace(/\/$/, "") ??
      "http://127.0.0.1:8000";
    const adminPath = pathname.match(/^\/(ar|en)\/admin(\/.*)?$/)?.[2] ?? "";
    return NextResponse.redirect(`${adminBase}/admin${adminPath || "/login"}`);
  }

  if (isAccountPath(pathname)) {
    const sub = pathname.match(/^\/(ar|en)\/account(\/.*)?$/)?.[2] ?? "";
    if (sub === "/login" || sub === "") {
      return NextResponse.redirect(portalPath("/login"));
    }
    if (sub === "/register") {
      return NextResponse.redirect(portalPath("/register"));
    }
    if (sub.startsWith("/bookings")) {
      return NextResponse.redirect(portalPath("/bookings"));
    }
    if (sub.startsWith("/profile")) {
      return NextResponse.redirect(portalPath("/profile"));
    }
    return NextResponse.redirect(portalPath());
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/storage") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];
  if (first && isLocale(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
