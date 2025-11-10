"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";

export default function WithdrawalPage() {
  const router = useRouter();

  return (
    <main className="flex items-center justify-center min-h-screen w-full bg-surface-secondary p-4">
      <div className="bg-surface-secondary relative w-full max-w-[402px] h-screen flex flex-col">
        <Header variant="navy" leftIcon="back" onLeftClick={() => router.back()} title="회원 탈퇴" />

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-4 py-5 flex flex-col gap-6">
            {/* Withdrawal Notice */}
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-4">회원 탈퇴 안내</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                회원 탈퇴를 원하시는 경우, 아래의 이메일로 문의해주시기 바랍니다.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mt-4">
                탈퇴 요청 시 다음과 같은 사항이 처리됩니다:
              </p>
              <ul className="text-sm text-text-secondary leading-relaxed mt-3 list-disc list-inside space-y-2">
                <li>카카오 계정 연동이 해제됩니다.</li>
                <li>글로버 내 저장된 모든 여행 기록, 사진, 리액션이 즉시 삭제됩니다.</li>
                <li>프로필 정보 및 사용자 데이터가 즉시 삭제됩니다.</li>
                <li>백업 데이터는 최대 30일 이내에 완전 삭제됩니다.</li>
              </ul>
              <p className="text-sm text-text-secondary leading-relaxed mt-4">
                삭제된 데이터는 복구가 불가능하므로, 탈퇴 전에 필요한 데이터를 미리 백업하시기 바랍니다.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-4">문의 방법</h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                아래의 이메일 주소로 회원 탈퇴를 요청해주시면, 담당자가 확인 후 처리하겠습니다.
              </p>
              <div className="bg-surface-primary rounded-lg p-4">
                <p className="text-sm text-text-primary font-semibold">이메일</p>
                <p className="text-base text-state-focused font-bold mt-2 break-all">globber@depromeet.com</p>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mt-4">
                이메일 제목에 "회원 탈퇴 요청"이라고 명시해주시고, 본문에 가입할 때 사용한 계정 정보를 포함해주시면
                신속하게 처리하겠습니다.
              </p>
            </section>

            {/* Additional Notice */}
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-4">유의사항</h2>
              <ul className="text-sm text-text-secondary leading-relaxed space-y-3 list-disc list-inside">
                <li>탈퇴 후 같은 카카오 계정으로 재가입할 수 있습니다.</li>
                <li>탈퇴 전에 작성한 모든 여행 기록, 사진, 친구 관계 등이 완전히 삭제됩니다. 복구는 불가능합니다.</li>
                <li>문의에 대한 답변은 등록하신 이메일 주소로 발송됩니다.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
