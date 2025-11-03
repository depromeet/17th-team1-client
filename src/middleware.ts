import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS: readonly string[] = [
  "/login",
  "/login/oauth/success",
  "/_next",
  "/api",
  "/favicon.png",
  "/robots.txt",
  "/sitemap.xml",
  "/public",
  "/test",
];

const AUTH_REQUIRED_BUT_ALLOW_ROUTING: readonly string[] = [
  "/", // 홈 페이지에서 여행 데이터 확인 후 라우팅
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function allowRouting(pathname: string): boolean {
  return AUTH_REQUIRED_BUT_ALLOW_ROUTING.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("kakao_access_token")?.value;
  const memberId = request.cookies.get("member_id")?.value;
  const uuid = request.cookies.get("uuid")?.value;

  if (token && pathname === "/login") {
    console.log(
      `[Middleware] Redirecting authenticated user from /login to /globe (Token: exists, MemberID: ${
        memberId || "none"
      }, UUID: ${uuid || "none"})`,
    );
    const url = request.nextUrl.clone();
    url.pathname = "/globe";
    return NextResponse.redirect(url);
  }

  if (!token && !isPublicPath(pathname)) {
    console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to /login`);
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 토큰이 있고 라우팅이 허용된 경로면 통과 (여행 데이터 확인 후 라우팅)
  if (token && allowRouting(pathname)) {
    console.log(
      `[Middleware] Allowing routing logic for ${pathname} (Token: exists, MemberID: ${
        memberId || "none"
      }, UUID: ${uuid || "none"})`,
    );
    return NextResponse.next();
  }

  console.log(
    `[Middleware] Allowing access to ${pathname} (Token: ${
      token ? "exists" : "none"
    }, MemberID: ${memberId || "none"}, UUID: ${uuid || "none"})`,
  );
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
