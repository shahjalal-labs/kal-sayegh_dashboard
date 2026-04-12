import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const role = request.cookies.get("role")?.value;

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

  if (!adminRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role === "ADMIN") {
    return NextResponse.next();
  }

  if (role === "OFFICE_ADMINISTRATOR") {
    const isAllowed = officeAdminAllowedRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employee-management/:path*",
    "/estimator-management/:path*",
    "/estimate/:path*",
    "/invoice/:path*",
    "/office-administration/:path*",
    "/calendar/:path*",
    "/message/:path*",
    "/settings/:path*",
    "/to-do/:path*",
  ],
};
