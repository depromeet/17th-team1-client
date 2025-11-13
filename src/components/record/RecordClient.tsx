"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/common/Header";
import type { Continent, RecordResponse } from "@/types/record";
import { getAuthInfo } from "@/utils/cookies";
import { RecordContent } from "./RecordContent";

interface RecordClientProps {
  initialData: RecordResponse | null;
}

export function RecordClient({ initialData }: RecordClientProps) {
  const router = useRouter();
  const [selectedContinent, setSelectedContinent] = useState<Continent>("전체");

  // 브라우저 뒤로가기 감지
  useEffect(() => {
    const handlePopState = () => {
      const { uuid } = getAuthInfo();
      if (uuid) {
        router.push(`/globe/${uuid}`);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const handleBackClick = () => {
    const { uuid } = getAuthInfo();
    if (uuid) {
      router.push(`/globe/${uuid}`);
    }
  };

  const handleEditClick = () => {
    router.push("/record/edit");
  };

  return (
    <main className="flex items-center justify-center min-h-dvh w-full bg-surface-secondary">
      <div className="bg-surface-secondary relative w-full max-w-[512px] h-dvh flex flex-col">
        <div className="max-w-[512px] mx-auto w-full">
          <Header
            variant="navy"
            leftIcon="back"
            onLeftClick={handleBackClick}
            rightButtonTitle="도시 편집"
            onRightClick={handleEditClick}
            style={{
              backgroundColor: "transparent",
              position: "relative",
              zIndex: 20,
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 flex justify-center">
          <div className="w-full max-w-lg">
            <RecordContent
              initialData={initialData}
              selectedContinent={selectedContinent}
              onContinentChange={setSelectedContinent}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
