"use client";

import { EditContent } from "./EditContent";
import { EditHeader } from "./EditHeader";

interface EditClientProps {
  cities: { id: string; name: string; countryCode: string }[];
}

export function EditClient({ cities }: EditClientProps) {
  return (
    <div className="h-screen bg-surface-secondary flex flex-col">
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />
      <div className="flex-1 overflow-y-auto px-4 flex justify-center">
      <div className="w-full max-w-[512px] px-4">
          <EditHeader />
          <EditContent cities={cities} />
        </div>
      </div>
    </div>
  );
}


