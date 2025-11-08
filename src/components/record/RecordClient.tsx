"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Continent, RecordResponse } from "@/types/record";
import { RecordContent } from "./RecordContent";
import { RecordHeader } from "./RecordHeader";

interface RecordClientProps {
  initialData: RecordResponse | null;
}

export function RecordClient({ initialData }: RecordClientProps) {
  const router = useRouter();
  const [selectedContinent, setSelectedContinent] = useState<Continent>("전체");

  // 브라우저 뒤로가기 감지
  useEffect(() => {
    const handlePopState = () => {
      router.push("/globe");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  return (
    <div className="h-screen bg-surface-secondary flex flex-col">
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />
      <div className="flex-1 overflow-y-auto px-4 flex justify-center">
        <div className="w-full max-w-lg px-4">
          <RecordHeader />
          <RecordContent
            initialData={initialData}
            selectedContinent={selectedContinent}
            onContinentChange={setSelectedContinent}
          />
        </div>
      </div>
    </div>
  );
}
