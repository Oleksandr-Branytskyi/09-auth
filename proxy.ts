import { NextResponse, type NextRequest } from "next/server";

const PRIVATE_PREFIXES = ["/profile", "/notes"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

function isPrivatePath(pathname: string) {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

async function hasActiveSession(request: NextRequest): Promise<boolean> {
  const cookie = request.headers.get("cookie") ?? "";

  const response = await fetch(new URL("/api/auth/session", request.url), {
    method: "GET",
    headers: {
      cookie,
    },
  });

  if (!response.ok) return false;

  const text = await response.text();
  return Boolean(text && text.trim().length > 0);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivate = isPrivatePath(pathname);
  const isAuth = isAuthPath(pathname);

  if (!isPrivate && !isAuth) {
    return NextResponse.next();
  }

  const isAuthenticated = await hasActiveSession(request);

  if (!isAuthenticated && isPrivate) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
