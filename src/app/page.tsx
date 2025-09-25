"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  // TODO: API 연동 시 실제 hasGlobe 상태를 가져오는 로직으로 변경
  const [hasGlobe, _setHasGlobe] = useState(true);

  useEffect(() => {
    if (hasGlobe) {
      router.push("/globe");
    } else {
      router.push("/nation-select");
    }
  }, [router, hasGlobe]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white flex flex-col items-center justify-center px-5 py-10 min-w-[512px] mx-auto w-full">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Globber</h1>
        <p className="text-xl text-slate-300">로딩 중...</p>
      </div>
    </div>
  );
}
