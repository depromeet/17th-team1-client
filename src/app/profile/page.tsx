import { ProfileClient } from "@/components/profile/ProfileClient";
import { getMyProfile } from "@/services/profileService";
import { getServerAuthToken } from "@/utils/serverCookies";
import { handleServerError } from "@/utils/serverErrorHandler";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  try {
    const token = await getServerAuthToken();
    const userProfile = await getMyProfile(token);

    return <ProfileClient initialProfile={userProfile} />;
  } catch (error) {
    // 401/500 에러는 서버에서 직접 리다이렉트 (500 에러 방지)
    handleServerError(error);

    console.error("프로필 로드 실패:", error);
    return <ProfileClient initialProfile={null} />;
  }
}
