import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPath = pathname.startsWith("/auth");

  // Not logged in and trying to access a protected route → redirect to login
  if (!token && !isAuthPath) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Already logged in and visiting auth pages → redirect to home
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
