import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export interface User {
  role: string;
}

const isAdminRole = (role?: string) => {
  const normalized = role?.trim().toLowerCase();
  return normalized === "admin" || normalized === "super_admin";
};

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

const redirectToLogin = (request: NextRequest) => {
  const loginRoute = `${request.nextUrl.origin}/login`;
  const res = NextResponse.redirect(new URL(loginRoute, request.url));
  res.cookies.delete("token");
  return res;
};

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
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  // 🔴 If logged in user hits login page → redirect dashboard
  if (isLoginRoute && token) {
    try {
      const user = jwtDecode<User>(token);

      if (isAdminRole(user.role)) {
        return NextResponse.redirect(new URL(dashboardRoute, request.url));
      }

      return redirectToLogin(request);
    } catch {
      return redirectToLogin(request);
    }
  }

  // 🟢 Public routes (not protected)
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // 🔴 Dashboard routes without token → redirect login immediately
  if (isDashboard && !token) {
    return redirectToLogin(request);
  }

  // 🔴 Protected routes without token → login redirect
  if (!token) {
    return redirectToLogin(request);
  }

  // 🔐 Verify token validity
  try {
    const user = jwtDecode<User>(token);

    // Admin-only access for protected routes
    if (isAdminRole(user.role)) {
      return NextResponse.next();
    }

    return redirectToLogin(request);
  } catch {
    // Invalid or expired token
    return redirectToLogin(request);
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
