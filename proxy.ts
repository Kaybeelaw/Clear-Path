import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { homeForRole } from "@/lib/session";

const AUTH_PAGES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/officer")) {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    if (session.role !== "OFFICER") {
      return NextResponse.redirect(new URL(homeForRole(session.role), request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL(homeForRole(session.role), request.url));
    }
  }

  if (AUTH_PAGES.some((page) => pathname === page) && session) {
    return NextResponse.redirect(new URL(homeForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/officer/:path*", "/admin/:path*", "/login", "/register"],
};
