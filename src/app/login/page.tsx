import { LoginLogoIcon } from "@/assets/icons";
import KakaoLoginButton from "@/components/login/KakaoLoginButton";

const LoginPage = () => {
  return (
    <main className="min-h-dvh w-full mx-auto flex flex-col items-center justify-center relative overflow-hidden">
      {/* 로고 - 전체 높이의 정중앙 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoginLogoIcon className="w-[402px] h-[400px]" />
      </div>

      {/* 카카오 로그인 버튼 - 하단 고정 */}
      <div className="absolute bottom-0 w-full max-w-sm px-8 pb-8">
        <KakaoLoginButton />
      </div>
    </main>
  );
};

export default LoginPage;
