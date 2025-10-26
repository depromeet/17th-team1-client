import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { getMyProfile } from "@/services/profileService";
import { getServerAuthToken } from "@/utils/serverCookies";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  try {
    const token = await getServerAuthToken();

    if (!token) {
      redirect("/login");
    }

    const userProfile = await getMyProfile(token);

    return <ProfileClient initialProfile={userProfile} />;
  } catch (error) {
    console.error("프로필 로드 실패:", error);
    return <ProfileClient initialProfile={null} />;
  }
}
