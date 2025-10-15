import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { getMemberId } from "@/services/memberService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("accessToken");
  const firstLogin = searchParams.get("firstLogin");
  const uuid = searchParams.get("uuid");

  if (!accessToken) {
    console.error("URL에서 accessToken을 찾을 수 없습니다.");
    return NextResponse.redirect(new URL("/login", env.REDIRECT_ORIGIN));
  }

  const cleanToken = accessToken.startsWith("Bearer ") ? accessToken.substring(7) : accessToken;

  // 로컬 개발 환경 여부 (NODE_ENV 기반)
  const isLocalDev = env.IS_LOCAL_DEV;

  // 서버사이드에서 쿠키 설정
  const cookieStore = await cookies();
  const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 days
  const cookieOptions = {
    path: "/",
    maxAge: maxAgeSeconds,
    httpOnly: false,
    ...(isLocalDev ? {} : { domain: env.COOKIE_DOMAIN }),
  };

  try {
    // 멤버 ID 조회 API 호출
    const memberId = await getMemberId(cleanToken);

    // 토큰, 멤버 ID, UUID 모두 쿠키에 저장
    cookieStore.set("kakao_access_token", cleanToken, cookieOptions);

    cookieStore.set("member_id", memberId.toString(), cookieOptions);

    if (uuid) {
      cookieStore.set("uuid", uuid, cookieOptions);
    }

    console.log(`멤버 ID 저장 완료: ${memberId}${uuid ? `, UUID: ${uuid}` : ""}`);

    if (firstLogin === "true") {
      // 신규 사용자 - 도시 선택 페이지로 이동
      return NextResponse.redirect(new URL("/nation-select", env.REDIRECT_ORIGIN));
    } else {
      // 기존 사용자 - 홈 페이지로 이동하여 여행 데이터 확인 후 라우팅
      return NextResponse.redirect(new URL("/", env.REDIRECT_ORIGIN));
    }
  } catch (error) {
    console.error("멤버 ID 조회 중 오류:", error);
    // API 호출 실패 시에도 토큰은 저장하고 진행
    cookieStore.set("kakao_access_token", cleanToken, cookieOptions);

    if (uuid) {
      cookieStore.set("uuid", uuid, cookieOptions);
    }

    if (firstLogin === "true") {
      // 신규 사용자 - 도시 선택 페이지로 이동
      return NextResponse.redirect(new URL("/nation-select", env.REDIRECT_ORIGIN));
    } else {
      // 기존 사용자 - 홈 페이지로 이동하여 여행 데이터 확인 후 라우팅
      return NextResponse.redirect(new URL("/", env.REDIRECT_ORIGIN));
    }
  }
}
