import { NextResponse, type NextRequest } from "next/server";
import { checkSession } from "./lib/api/serverApi";

const PRIVATE_PREFIXES = ["/profile", "/notes"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

function isPrivatePath(pathname: string) {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function getTokens(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value ?? null;
  const refreshToken = request.cookies.get("refreshToken")?.value ?? null;
  return { accessToken, refreshToken };
}

function applySetCookieHeaders(
  res: NextResponse,
  setCookie?: string[] | string
) {
  if (!setCookie) return;

  if (Array.isArray(setCookie)) {
    for (const cookie of setCookie) res.headers.append("set-cookie", cookie);
    return;
  }

  res.headers.append("set-cookie", setCookie);
}

async function getAuthState(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  setCookie?: string[] | string;
}> {
  const { accessToken, refreshToken } = getTokens(request);

  if (accessToken) {
    return { isAuthenticated: true };
  }

  if (refreshToken) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const response = await checkSession(cookieHeader);

    const setCookie = (
      response.headers as unknown as { "set-cookie"?: string[] | string }
    )["set-cookie"];

    return { isAuthenticated: Boolean(response.data), setCookie };
  }

  return { isAuthenticated: false };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivate = isPrivatePath(pathname);
  const isAuth = isAuthPath(pathname);

  if (!isPrivate && !isAuth) {
    return NextResponse.next();
  }

  const { isAuthenticated, setCookie } = await getAuthState(request);

  if (!isAuthenticated && isPrivate) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    const res = NextResponse.redirect(url);
    applySetCookieHeaders(res, setCookie);
    return res;
  }

  if (isAuthenticated && isAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const res = NextResponse.redirect(url);
    applySetCookieHeaders(res, setCookie);
    return res;
  }

  const res = NextResponse.next();
  applySetCookieHeaders(res, setCookie);
  return res;
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
