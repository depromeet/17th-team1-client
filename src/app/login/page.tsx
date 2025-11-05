import KakaoLoginButton from "@/components/login/KakaoLoginButton";

const LoginPage = () => {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#0f172a] via-[#0b1024] to-black text-white flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#3b82f6]/30 via-[#22d3ee]/20 to-[#a855f7]/20 blur-2xl"
          aria-hidden="true"
        />

        <section className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-8 shadow-2xl">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">🌍 글로버에 오신 것을 환영해요 🌍</h1>
            <p className="mt-2 text-sm text-white/70">여행 기록을 멋진 지구본 위에 남겨보세요!</p>
          </header>

          <div className="space-y-3">
            <KakaoLoginButton />
            <p className="text-xs text-white/50 text-center">
              로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
