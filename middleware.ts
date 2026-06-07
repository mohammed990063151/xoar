import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "./lib/i18n";

const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
const portalBase =
  process.env.NEXT_PUBLIC_PORTAL_URL?.replace(/\/$/, "") ?? adminBase;

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
    const adminPath = pathname.match(/^\/(ar|en)\/admin(\/.*)?$/)?.[2] ?? "";
    return NextResponse.redirect(`${adminBase}/admin${adminPath || "/login"}`);
  }

  if (isAccountPath(pathname)) {
    const sub = pathname.match(/^\/(ar|en)\/account(\/.*)?$/)?.[2] ?? "";
    if (sub === "/login" || sub === "") {
      return NextResponse.redirect(`${portalBase}/portal/login`);
    }
    if (sub === "/register") {
      return NextResponse.redirect(`${portalBase}/portal/register`);
    }
    if (sub?.startsWith("/bookings")) {
      return NextResponse.redirect(`${portalBase}/portal/bookings`);
    }
    if (sub?.startsWith("/profile")) {
      return NextResponse.redirect(`${portalBase}/portal/profile`);
    }
    if (sub?.startsWith("/wishlist")) {
      return NextResponse.redirect(`${portalBase}/portal`);
    }
    return NextResponse.redirect(`${portalBase}/portal`);
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
