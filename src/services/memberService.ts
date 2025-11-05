import { apiDelete, apiGet, apiPost } from "@/lib/apiClient";
import type { City } from "@/types/city";
import type {
  CreateTravelRecordsResponse,
  DeleteTravelRecord,
  DeleteTravelRecordsResponse,
  GlobeResponse,
  MemberIdResponse,
  MemberTravelsResponse,
  TravelInsightResponse,
} from "@/types/member";
import type { RecordResponse } from "@/types/record";
import { getAuthInfo } from "@/utils/cookies";
import { convertCitiesToTravelRecords } from "@/utils/travelUtils";

// 멤버 ID 조회 API
export const getMemberId = async (token: string): Promise<number> => {
  try {
    const data = await apiGet<MemberIdResponse>("/id", {}, token);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch member ID:", error);
    throw error;
  }
};

// 멤버 여행 데이터 조회 API
export const getMemberTravels = async (token?: string): Promise<MemberTravelsResponse | null> => {
  try {
    // 서버 컴포넌트에서 호출 시 token을 파라미터로 전달
    let authToken = token;

    // 클라이언트 컴포넌트에서 호출 시 쿠키에서 토큰 가져오기
    if (!authToken) {
      const { token: clientToken } = getAuthInfo();
      authToken = clientToken || undefined;
    }

    if (!authToken) throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
    const data = await apiGet<MemberTravelsResponse>(`/api/v1/member-travels`, {}, authToken);
    return data;
  } catch (error: any) {
    // 502, 503 같은 서버 에러인 경우 조용히 처리
    if (error?.status >= 500 && error?.status < 600) {
      return null;
    }
    console.error("Failed to fetch member travels:", error);
    return null;
  }
};

// 멤버 여행 기록 생성 API
export const createMemberTravels = async (cities: City[]): Promise<CreateTravelRecordsResponse> => {
  try {
    const { token } = getAuthInfo();

    if (!token) {
      throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const travelRecords = convertCitiesToTravelRecords(cities);
    const data = await apiPost<CreateTravelRecordsResponse>(`/api/v1/member-travels`, travelRecords, token);

    return data;
  } catch (error) {
    console.error("Failed to create member travels:", error);
    throw error;
  }
};

// 지구본 조회 API
export const getGlobeData = async (uuid: string): Promise<GlobeResponse | null> => {
  try {
    const { token } = getAuthInfo();

    if (!token) {
      throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const data = await apiGet<GlobeResponse>(`/api/v1/globes/${uuid}`, {}, token);
    return data;
  } catch (error) {
    console.error("Failed to fetch globe data:", error);
    return null;
  }
};

// AI 인사이트 API
export const getTravelInsight = async (memberId: number): Promise<string> => {
  try {
    const { token } = getAuthInfo();
    if (!token) throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");

    const data = await apiGet<TravelInsightResponse>(`/api/v1/travel-insights/${memberId}`, {}, token);
    return data.data.title;
  } catch (error) {
    console.error("Failed to fetch travel insight:", error);
    return "";
  }
};

// 멤버 여행 기록 삭제 API
export const deleteMemberTravel = async (
  travelRecord: DeleteTravelRecord,
  token?: string,
): Promise<DeleteTravelRecordsResponse> => {
  try {
    let authToken = token;

    // 클라이언트 컴포넌트에서 호출 시 쿠키에서 토큰 가져오기
    if (!authToken) {
      const { token: clientToken } = getAuthInfo();
      authToken = clientToken || undefined;
    }

    if (!authToken) {
      throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const data = await apiDelete<DeleteTravelRecordsResponse>(`/api/v1/member-travels`, travelRecord, authToken);

    return data;
  } catch (error) {
    console.error("Failed to delete member travel:", error);
    throw error;
  }
};

// 여행 기록 조회 API
export const getRecordData = async (serverCookies?: any): Promise<RecordResponse | null> => {
  try {
    let token: string | undefined;
    let memberId: string | undefined;

    // 서버 컴포넌트에서 호출 시 cookies 객체 사용
    if (serverCookies) {
      token = serverCookies.get("kakao_access_token")?.value;
      memberId = serverCookies.get("member_id")?.value;
    } else {
      // 클라이언트 컴포넌트에서 호출 시 기존 방식 사용
      const authInfo = getAuthInfo();
      token = authInfo.token || undefined;
      memberId = authInfo.memberId || undefined;
    }

    if (!token || !memberId) {
      throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const data = await apiGet<RecordResponse>(`/api/v1/member-travels/${memberId}/records`, {}, token);
    return data;
  } catch (error: any) {
    // 404 에러인 경우 조용히 처리 (레코드가 없는 경우일 수 있음)
    if (error?.status === 404) {
      console.log("No record data found for member");
      return null;
    }
    console.error("Failed to fetch record data:", error);
    return null;
  }
};
