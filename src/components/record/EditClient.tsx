"use client";

import { EditContent } from "./EditContent";
import { useRouter } from "next/navigation";
import { EditHeader } from "./EditHeader";
import { useMemo, useState } from "react";
import { Popup } from "@/components/common/Popup";
import Image from "next/image";

interface EditClientProps {
  cities: { id: string; name: string; countryCode: string; isNew?: boolean }[];
}

export function EditClient({ cities }: EditClientProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(cities);
  const base = useMemo(() => cities.filter((c) => !c.isNew), [cities]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const baseIds = useMemo(() => new Set(base.map((c) => c.id)), [base]);
  const currentIds = useMemo(() => new Set(current.map((c) => c.id)), [current]);
  const isChanged = useMemo(() => {
    if (current.length !== base.length) return true;
    if (current.some((c) => c.isNew)) return true;
    if (baseIds.size !== currentIds.size) return true;
    for (const id of baseIds) {
      if (!currentIds.has(id)) return true;
    }
    return false;
  }, [base.length, baseIds, current, currentIds]);

  const handleRemove = (cityId: string, isNew?: boolean) => {
    if (isNew) {
      setCurrent((prev) => prev.filter((c) => c.id !== cityId));
    } else {
      setConfirmId(cityId);
    }
  };

  const handleConfirmDelete = () => {
    if (!confirmId) return;
    setCurrent((prev) => prev.filter((c) => c.id !== confirmId));
    setConfirmId(null);
  };

  const handleCancelDelete = () => setConfirmId(null);

  const handleSave = () => {
    // TODO: API 연동 위치. 현재는 편집 페이지로 유지
    router.back();
  };
  return (
    <div className="h-screen bg-surface-secondary flex flex-col">
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />
      <div className="flex-1 overflow-y-auto px-4 flex justify-center">
      <div className="w-full max-w-[512px] px-4">
          <EditHeader canSave={isChanged} onSave={handleSave} />
          <EditContent cities={current} onAddClick={() => router.push("/record/edit/select")} onRemoveClick={handleRemove} />
        </div>
      </div>
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.50)]">
          <Popup className="w-72 bg-[#0F1A26] rounded-2xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-start items-start p-0">
            <div className="self-stretch px-5 pt-7 pb-5 rounded-tl-[20px] rounded-tr-[20px] flex flex-col justify-center items-center gap-2.5">
              <div className="w-10 h-10 relative overflow-hidden">
                <Image src="/icon-exclamation-circle-mono.svg" alt="경고" fill className="object-contain" />
              </div>
              <div className="flex flex-col justify-start items-center gap-1">
                <div className="text-center justify-start text-text-primary text-lg font-bold font-['Pretendard'] leading-6">정말 삭제하시겠어요?</div>
                <div className="text-center justify-start text-text-primary text-xs font-medium font-['Pretendard'] leading-5">도시를 삭제하면, 기록도 함께 사라져요.</div>
              </div>
            </div>
            <div className="self-stretch px-5 pb-5 rounded-bl-[20px] rounded-br-[20px] inline-flex justify-center items-center gap-2.5 w-full">
              <button onClick={handleCancelDelete} className="flex-1 px-5 py-3 bg-surface-placeholder--8 rounded-[10px] flex justify-center items-center gap-2.5" type="button">
                <div className="text-center justify-start text-text-primary text-sm font-bold font-['Pretendard'] leading-5">취소</div>
              </button>
              <button onClick={handleConfirmDelete} className="flex-1 px-5 py-3 bg-state-warning rounded-[10px] outline outline-1 outline-offset-[-1px] outline-border-absolutewhite--4 flex justify-center items-center gap-2.5" type="button">
                <div className="text-center justify-start text-text-primary text-sm font-bold font-['Pretendard'] leading-5">삭제</div>
              </button>
            </div>
          </Popup>
        </div>
      )}
    </div>
  );
}


