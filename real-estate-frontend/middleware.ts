import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/auth/login", "/register"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("token")?.value

  // If token exists, prevent access to /auth/login
  if (
    token &&
    token.trim() !== "" &&
    pathname.startsWith("/auth/login")
  ) {
    return NextResponse.redirect(new URL("/service/dashboard", req.url))
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Only check if token exists and is not empty for protected routes
  if (!token || token.trim() === "") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/service/:path*", "/auth/login"],

}