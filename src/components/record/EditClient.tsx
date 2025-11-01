"use client";

import { EditContent } from "./EditContent";
import { useRouter } from "next/navigation";
import { EditHeader } from "./EditHeader";
import { useMemo, useState, useEffect } from "react";
import { Popup } from "@/components/common/Popup";
import Image from "next/image";
import { getCountryName } from "@/constants/countryMapping";
import { addCity, deleteCity } from "@/services/cityService";
import { getAuthInfo } from "@/utils/cookies";

interface EditClientProps {
  cities: { id: string; name: string; countryCode: string; lat: number; lng: number; cityId?: number; isNew?: boolean }[];
}

export function EditClient({ cities }: EditClientProps) {
  const router = useRouter();
  
  const [current, setCurrent] = useState(cities);
  const base = useMemo(() => cities.filter((c) => !c.isNew), [cities]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 브라우저 뒤로가기 감지
  useEffect(() => {
    const handlePopState = () => {
      router.push("/record");
    };

    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const handleBack = () => {
    router.push("/record");
  };

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

  const handleSave = async () => {
    if (isSaving) return;
    
    const { token } = getAuthInfo();
    if (!token) {
      router.push("/login");
      return;
    }

    setIsSaving(true);

    try {
      // 추가된 도시들과 삭제된 도시들 찾기
      const currentIds = new Set(current.map((c) => c.id));
      const baseIds = new Set(base.map((c) => c.id));
      
      // 추가된 도시들 (current에 있지만 base에 없거나 isNew인 것)
      const addedCities = current.filter(
        (c) => !baseIds.has(c.id) || c.isNew
      );
      
      // 삭제된 도시들 (base에 있지만 current에 없는 것)
      const deletedCities = base.filter((c) => !currentIds.has(c.id));

      console.log(`[Save] 추가할 도시:`, addedCities);
      console.log(`[Save] 삭제할 도시:`, deletedCities);

      // 모든 API 호출 생성
      const addPromises = addedCities.map((city) => {
        const countryName = getCountryName(city.countryCode);
        const request = {
          cityName: city.name,
          countryName,
          lat: city.lat,
          lng: city.lng,
          countryCode: city.countryCode,
        };
        console.log(`[Save] 도시 추가 요청:`, request);
        return addCity(request, token);
      });

      const deletePromises = deletedCities.map((city) => {
        if (!city.cityId) {
          throw new Error(`City ID not found for city: ${city.name}`);
        }
        console.log(`[Save] 도시 삭제 요청: cityId=${city.cityId}`);
        return deleteCity(city.cityId, token);
      });

      console.log(`[Save] 총 ${addPromises.length}개 추가, ${deletePromises.length}개 삭제 요청 시작`);
      
      // 모든 API 호출 실행
      await Promise.all([...addPromises, ...deletePromises]);
      
      console.log(`[Save] 모든 요청 성공`);

      // 성공 시 record 페이지로 이동
      router.push("/record");
    } catch (error) {
      console.error("Failed to save cities:", error);
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClick = () => {
    // 현재 추가된 도시들(isNew: true)을 쿼리로 전달
    const newCities = current.filter((c) => c.isNew);
    if (newCities.length > 0) {
      const payload = newCities.map(({ id, name, countryCode, lat, lng }) => {
        const countryName = getCountryName(countryCode);
        return { id, name, country: countryName, countryCode, lat, lng };
      });
      const encoded = encodeURIComponent(JSON.stringify(payload));
      router.push(`/record/edit/select?added=${encoded}`);
    } else {
      router.push("/record/edit/select");
    }
  };

  return (
    <div className="h-screen bg-surface-secondary flex flex-col">
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />
      <div className="flex-1 overflow-y-auto px-4 flex justify-center">
      <div className="w-full max-w-[512px] px-4">
          <EditHeader canSave={isChanged && !isSaving} onSave={handleSave} onBack={handleBack} />
          <EditContent cities={current} onAddClick={handleAddClick} onRemoveClick={handleRemove} />
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
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.50)]">
          <Popup className="w-72 bg-[#0F1A26] rounded-2xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-start items-start p-0">
            <div className="self-stretch px-5 pt-7 pb-5 rounded-tl-[20px] rounded-tr-[20px] flex flex-col justify-center items-center gap-2.5">
              <div className="w-10 h-10 relative overflow-hidden">
                <Image src="/icon-exclamation-circle-mono.svg" alt="경고" fill className="object-contain" />
              </div>
              <div className="flex flex-col justify-start items-center gap-1">
                <div className="text-center justify-start text-text-primary text-lg font-bold font-['Pretendard'] leading-6">저장에 실패했습니다.</div>
                <div className="text-center justify-start text-text-primary text-xs font-medium font-['Pretendard'] leading-5">다시 시도해주세요.</div>
              </div>
            </div>
            <div className="self-stretch px-5 pb-5 rounded-bl-[20px] rounded-br-[20px] inline-flex justify-center items-center gap-2.5 w-full">
              <button onClick={() => setShowErrorModal(false)} className="w-full px-5 py-3 bg-surface-placeholder--8 rounded-[10px] flex justify-center items-center gap-2.5" type="button">
                <div className="text-center justify-start text-text-primary text-sm font-bold font-['Pretendard'] leading-5">닫기</div>
              </button>
            </div>
          </Popup>
        </div>
      )}
    </div>
  );
}


