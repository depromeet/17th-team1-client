import { ProfileClient } from "@/components/profile/ProfileClient";
import { getMyProfile } from "@/services/profileService";
import { getServerAuthToken } from "@/utils/serverCookies";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  try {
    const token = await getServerAuthToken();
    const userProfile = await getMyProfile(token ?? undefined);
    return <ProfileClient initialProfile={userProfile} />;
  } catch (error) {
    console.error("프로필 로드 실패:", error);
    return <ProfileClient initialProfile={null} />;
  }
}
