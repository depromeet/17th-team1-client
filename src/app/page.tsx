import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMemberTravels } from "@/services/memberService";
import type { MemberTravelsResponse } from "@/types/member";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kakao_access_token")?.value;
  const memberId = cookieStore.get("member_id")?.value;

  if (token && memberId) {
    let travelData: MemberTravelsResponse | null = null;

    try {
      // 멤버 여행 데이터 조회
      travelData = await getMemberTravels(token);
    } catch {
      // API 호출 실패 시 국가 선택 페이지로 이동
      redirect("/nation-select");
    }

    // 여행 데이터 유무에 따른 라우팅
    if (travelData?.data?.travels && travelData.data.travels.length > 0) {
      redirect("/globe");
    } else {
      redirect("/nation-select");
    }
  } else {
    // 토큰이 없으면 로그인 페이지로 이동
    redirect("/login");
  }
}
