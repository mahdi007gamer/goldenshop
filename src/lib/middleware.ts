import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/api/orders", "/api/licenses", "/api/tickets", "/api/wallet", "/api/notifications", "/api/users"];

// Routes that require admin role
const adminRoutes = ["/admin", "/api/admin"];

// Routes that should redirect to dashboard if already logged in
const guestRoutes = ["/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check session
  const sessionToken = request.cookies.get("gc_session")?.value;
  let user: { id: string; role: string } | null = null;

  if (sessionToken) {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: { select: { id: true, role: true } } },
    });

    if (session && session.expiresAt > new Date()) {
      user = session.user;
    }
  }

  // Redirect guest routes to dashboard if logged in
  if (user && guestRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect non-admin users
  if (user && user.role !== "admin" && adminRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/api/orders/:path*",
    "/api/licenses/:path*",
    "/api/tickets/:path*",
    "/api/wallet/:path*",
    "/api/courses/:path*",
    "/api/notifications/:path*",
    "/api/users/:path*",
    "/api/admin/:path*",
  ],
};
