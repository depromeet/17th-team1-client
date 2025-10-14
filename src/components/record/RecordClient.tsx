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
    <div className="w-96 h-[874px] relative bg-Surface-Secondary rounded-[44px] overflow-hidden">
      <RecordHeader />
      <RecordContent 
        initialData={initialData}
        selectedContinent={selectedContinent}
        onContinentChange={setSelectedContinent}
      />
    </div>
  );
}
