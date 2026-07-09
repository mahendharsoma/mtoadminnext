import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth/jwt";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth/login"];
const apiCronPaths = ["/api/cron"];
const qrStockCookieName = "mto_qr_stock_access";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (apiCronPaths.some((p) => pathname.startsWith(p))) {
    const cronSecret = request.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/dashboard" : "/login", request.url)
    );
  }

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    if (session && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const isQrStockRoute =
    pathname === "/total-stock" && request.nextUrl.searchParams.get("qr") === "1";
  const hasQrAccess = request.cookies.get(qrStockCookieName)?.value === "1";

  if (!session && isQrStockRoute && hasQrAccess) {
    return NextResponse.next();
  }

  if (!session && isQrStockRoute) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
