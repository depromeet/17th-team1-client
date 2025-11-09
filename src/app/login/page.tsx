import KakaoLoginButton from "@/components/login/KakaoLoginButton";
import { GlobberHeaderIcon, GlobberLoginIcon } from "@/assets/icons";

const LoginPage = () => {
  return (
    <main className="min-h-screen w-full mx-auto flex flex-col items-center justify-center relative overflow-hidden">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex flex-col items-center">
          <div className="w-[239.36px] h-[56.47px] relative mb-[5.53px]">
            <GlobberHeaderIcon className="w-full h-full" />
          </div>
          <div className="w-[188.45px] h-[246.45px] relative">
            <GlobberLoginIcon className="w-full h-full" />
          </div>
        </div>
      </div>
      <div className="w-full max-w-sm px-8 pb-8">
        <KakaoLoginButton />
      </div>
    </main>
  );
};

export default LoginPage;
