"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/common/Button";
import { EditProfileBottomSheet } from "@/components/profile/EditProfileBottomSheet";
import { LogoutDialog } from "@/components/profile/LogoutDialog";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { SettingItem } from "@/components/profile/SettingItem";
import { SettingSection } from "@/components/profile/SettingSection";

type UserProfile = {
  name: string;
  email: string;
  profileImage?: string;
};

const ProfilePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // 임시 사용자 정보 (실제로는 API에서 받아올 데이터)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "김지구",
    email: "adgasg@naver.com",
  });

  const handleLogoutConfirm = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: 실제 로그아웃 API 호출
      // const response = await fetch('/api/auth/logout', { method: 'POST' });
      // if (!response.ok) throw new Error('Logout failed');
      setIsLogoutDialogOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogoutClick = useCallback(() => {
    setIsLogoutDialogOpen(true);
  }, []);

  const handleEditProfile = useCallback(() => {
    setIsEditProfileOpen(true);
  }, []);

  const handleSaveProfile = useCallback(async (name: string, image?: string) => {
    try {
      // TODO: 실제 프로필 업데이트 API 호출
      // const response = await fetch('/api/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, image }),
      // });
      // if (!response.ok) throw new Error('Profile update failed');
      setUserProfile((prev) => ({
        ...prev,
        name,
        profileImage: image,
      }));
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
    }
  }, []);

  const handleTermsClick = useCallback(() => {
    // TODO: 약관 페이지로 이동
    router.push("/terms");
  }, [router]);

  const handleWithdrawalClick = useCallback(() => {
    // TODO: 회원탈퇴 페이지로 이동
    router.push("/withdrawal");
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen w-full bg-surface-secondary p-4">
      <div className="bg-surface-secondary relative w-full max-w-[402px] min-h-screen h-full flex flex-col">
        <div className="relative w-full min-h-screen flex flex-col">
          {/* Header */}
          <div className="h-11 w-full shrink-0 relative">
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute left-4 top-0 flex gap-2.5 items-center p-2.5 h-full"
              aria-label="뒤로 가기"
            >
              <span className="text-text-primary text-lg">‹</span>
            </button>
            <div className="absolute flex flex-col justify-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <p className="font-bold text-lg text-text-primary">나의 프로필</p>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5 min-w-0">
            {/* Profile Card Section */}
            <ProfileCard
              name={userProfile.name}
              email={userProfile.email}
              profileImage={userProfile.profileImage}
              onEditClick={handleEditProfile}
            />

            {/* Usage Info Section */}
            <SettingSection title="이용 정보">
              <SettingItem label="약관 및 정책" onClick={handleTermsClick} />
              <SettingItem label="회원 탈퇴하기" onClick={handleWithdrawalClick} />
            </SettingSection>
          </div>

          {/* Logout Button */}
          <div className="px-4 py-7.5 w-full shrink-0">
            <Button onClick={handleLogoutClick} disabled={isLoading} variant="gray" size="lg" className="w-full">
              {isLoading ? "로그아웃 중..." : "로그아웃"}
            </Button>
          </div>
        </div>

        {/* Logout Dialog */}
        <LogoutDialog
          isOpen={isLogoutDialogOpen}
          onOpenChange={setIsLogoutDialogOpen}
          onConfirm={handleLogoutConfirm}
          isLoading={isLoading}
        />

        {/* Edit Profile Bottom Sheet */}
        <EditProfileBottomSheet
          isOpen={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          initialName={userProfile.name}
          initialImage={userProfile.profileImage}
          onSave={handleSaveProfile}
        />
      </div>
    </main>
  );
};

export default ProfilePage;
