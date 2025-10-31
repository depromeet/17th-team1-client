"use client";

import { useState } from "react";
import { RecordHeader } from "./RecordHeader";
import { RecordContent } from "./RecordContent";
import type { RecordResponse, Continent } from "@/types/record";

interface RecordClientProps {
  initialData: RecordResponse | null;
}

export function RecordClient({ initialData }: RecordClientProps) {
  const [selectedContinent, setSelectedContinent] = useState<Continent>("전체");

  return (
    <div className="h-screen bg-surface-secondary flex flex-col">
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />
      <div className="flex-1 overflow-y-auto px-4 flex justify-center">
        <div className="w-full max-w-[512px] px-4">
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
