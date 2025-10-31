"use client";

import { EditContent } from "./EditContent";
import { useRouter } from "next/navigation";
import { EditHeader } from "./EditHeader";

interface EditClientProps {
  cities: { id: string; name: string; countryCode: string; isNew?: boolean }[];
}

export function EditClient({ cities }: EditClientProps) {
  const router = useRouter();
  return (
    <div className="h-screen bg-surface-secondary flex flex-col">
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />
      <div className="flex-1 overflow-y-auto px-4 flex justify-center">
      <div className="w-full max-w-[512px] px-4">
          <EditHeader />
          <EditContent cities={cities} onAddClick={() => router.push("/record/edit/select")} />
        </div>
      </div>
    </div>
  );
}


