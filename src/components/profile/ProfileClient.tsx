"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/common/Button";
import { EditProfileBottomSheet } from "@/components/profile/EditProfileBottomSheet";
import { LogoutDialog } from "@/components/profile/LogoutDialog";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { SettingItem } from "@/components/profile/SettingItem";
import { SettingSection } from "@/components/profile/SettingSection";
import { uploadAndUpdateProfile } from "@/services/profileService";
import type { ProfileData } from "@/types/member";

type ProfileClientProps = {
  initialProfile: ProfileData | null;
};

export const ProfileClient = ({ initialProfile }: ProfileClientProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(initialProfile);

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

  const handleSaveProfile = useCallback(
    async (nickname: string, imageFile?: File) => {
      try {
        setIsLoading(true);

        if (!userProfile) {
          setIsLoading(false);
          setIsEditProfileOpen(false);

          alert("프로필 정보를 불러올 수 없습니다.");
          return;
        }

        // 이미지가 있으면 함께 업로드, 없으면 닉네임만 업데이트
        const updatedProfile = await uploadAndUpdateProfile(nickname, userProfile.memberId, imageFile);
        setUserProfile(updatedProfile);
      } catch {
        console.error("프로필 업데이트 실패");

        alert("프로필 업데이트에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    },
    [userProfile],
  );

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
      <div className="bg-surface-secondary relative w-full max-w-[402px] h-screen flex flex-col">
        {/* Header */}
        <div className="h-11 w-full shrink-0 flex items-center justify-between px-4 relative">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex gap-2.5 items-center p-2.5 -ml-2.5"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1 flex justify-center">
            <p className="font-bold text-lg text-text-primary">나의 프로필</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-4 py-5 flex flex-col gap-5 min-w-0">
            {/* Profile Card Section */}
            <ProfileCard
              name={userProfile?.nickname ?? ""}
              email={userProfile?.email ?? ""}
              profileImage={userProfile?.profileImageUrl ?? undefined}
              onEditClick={handleEditProfile}
            />

            {/* Usage Info Section */}
            <SettingSection title="이용 정보">
              <SettingItem label="약관 및 정책" onClick={handleTermsClick} />
              <SettingItem label="회원 탈퇴하기" onClick={handleWithdrawalClick} />
            </SettingSection>
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-4 py-7.5 w-full shrink-0">
          <Button onClick={handleLogoutClick} disabled={isLoading} variant="gray" size="lg" className="w-full">
            {isLoading ? "로그아웃 중..." : "로그아웃"}
          </Button>
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
          initialName={userProfile?.nickname}
          initialImage={userProfile?.profileImageUrl ?? undefined}
          memberId={userProfile?.memberId}
          onSave={handleSaveProfile}
        />
      </div>
    </main>
  );
};
