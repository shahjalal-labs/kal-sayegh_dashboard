import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export interface User {
  role: string;
}

const adminRoutes = [
  "/admin/dashboard",
  "/admin/employee-management",
  "/admin/estimator-management",
  "/admin/estimate",
  "/admin/invoice",
  "/office-administration",
  "/calendar",
  "/message",
  "/settings",
];

const officeAdminAllowedRoutes = [
  "/office-administration",
  "/administration/to-do",
  "/calendar",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const loginRoute = `${request.nextUrl.origin}/login`;
  const dashboardRoute = `${request.nextUrl.origin}/dashboard`;

  const token = request.cookies.get("token")?.value;

  const isLoginRoute = pathname === "/login";

  // check route match helper
  const matchRoute = (routes: string[]) =>
    routes.some((route) => pathname.startsWith(route));

  const isAdminRoute = matchRoute(adminRoutes);
  const isOfficeRoute = matchRoute(officeAdminAllowedRoutes);

  // 🔴 If logged in user hits login page → redirect dashboard
  if (isLoginRoute && token) {
    try {
      jwtDecode<User>(token);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    } catch {
      return NextResponse.next();
    }
  }

  // 🟢 Public routes (not protected)
  if (!isAdminRoute && !isOfficeRoute) {
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

    // 🟣 ADMIN ACCESS (full access)
    if (user.role === "Admin") {
      return NextResponse.next();
    }

    // 🟡 OFFICE ADMIN ACCESS (limited routes)
    if (user.role === "OfficeAdmin") {
      if (isOfficeRoute) {
        return NextResponse.next();
      }

      // not allowed route
      return NextResponse.redirect(
        new URL("/office-administration", request.url),
      );
    }

    // ❌ unknown role
    return NextResponse.redirect(new URL("/login", request.url));
  } catch {
    const res = NextResponse.redirect(new URL(loginRoute, request.url));
    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/office-administration/:path*",
    "/calendar/:path*",
    "/message/:path*",
    "/settings/:path*",
    "/administration/:path*",
  ],
};
