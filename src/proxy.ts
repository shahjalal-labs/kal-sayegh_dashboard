import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export interface User {
  role: string;
}

const isAdminRole = (role?: string) => role?.trim().toLowerCase() === "admin";

const protectedRoutes = [
  "/dashboard",
  "/admin/dashboard",
  "/admin/employee-management",
  "/admin/estimator-management",
  "/admin/estimate",
  "/admin/invoice",
  "/admin/office-administration",
  "/admin/calendar",
  "/admin/message",
  "/admin/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const loginRoute = `${request.nextUrl.origin}/login`;
  const dashboardRoute = `${request.nextUrl.origin}/admin/dashboard`;

  const token = request.cookies.get("token")?.value;

  const isLoginRoute = pathname === "/login";

  // check route match helper
  const matchRoute = (routes: string[]) =>
    routes.some((route) => pathname.startsWith(route));

  const isProtectedRoute = matchRoute(protectedRoutes);

  // 🔴 If logged in user hits login page → redirect dashboard
  if (isLoginRoute && token) {
    try {
      const user = jwtDecode<User>(token);

      if (isAdminRole(user.role)) {
        return NextResponse.redirect(new URL(dashboardRoute, request.url));
      }

      const res = NextResponse.redirect(new URL(loginRoute, request.url));
      res.cookies.delete("token");
      return res;
    } catch {
      return NextResponse.next();
    }
  }

  // 🟢 Public routes (not protected)
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // 🔴 No token → login redirect
  if (!token) {
    const res = NextResponse.redirect(new URL(loginRoute, request.url));
    res.cookies.delete("token");
    return res;
  }

  // 🔐 Verify token
  try {
    const user = jwtDecode<User>(token);

    // Admin-only access
    if (isAdminRole(user.role)) {
      return NextResponse.next();
    }

    const res = NextResponse.redirect(new URL(loginRoute, request.url));
    res.cookies.delete("token");
    return res;
  } catch {
    const res = NextResponse.redirect(new URL(loginRoute, request.url));
    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/admin/:path*",
    "/office-administration/:path*",
    "/calendar/:path*",
    "/message/:path*",
    "/settings/:path*",
    "/administration/:path*",
  ],
};
