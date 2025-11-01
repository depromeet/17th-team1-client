"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { NationSelectClient } from "@/components/nationSelect/NationSelectClient";
import { EditHeader } from "@/components/record/EditHeader";
import type { City } from "@/types/city";

interface EditSelectClientProps {
  initialCities: City[];
}

export function EditSelectClient({ initialCities }: EditSelectClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleComplete = (cities: City[]) => {
    // 기존에 추가된 도시들 가져오기
    const existingAddedParam = searchParams.get("added");
    const existingAdded: any[] = [];
    
    if (existingAddedParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(existingAddedParam));
        if (Array.isArray(decoded)) {
          existingAdded.push(...decoded);
        }
      } catch {}
    }

    // 새로 선택한 도시들
    const newCities = cities.map(({ id, name, country, countryCode }) => ({ id, name, country, countryCode }));
    
    // 기존 도시 + 새 도시 합치기 (중복 제거 - 같은 id는 새 것으로 대체)
    const cityMap = new Map<string, any>();
    
    // 기존 도시들 먼저 추가
    existingAdded.forEach(city => {
      cityMap.set(String(city.id), city);
    });
    
    // 새 도시들로 덮어쓰기 (같은 id면 새 것으로)
    newCities.forEach(city => {
      cityMap.set(String(city.id), city);
    });
    
    // 합쳐진 배열
    const merged = Array.from(cityMap.values());
    
    const encoded = encodeURIComponent(JSON.stringify(merged));
    router.push(`/record/edit?added=${encoded}`);
  };

  return (
    <NationSelectClient
      initialCities={initialCities}
      mode="edit-add"
      onComplete={handleComplete}
      buttonLabel="내 지구본에 추가하기"
      customHeader={<EditHeader title="도시 추가" showSaveButton={false} />}
    />
  );
}


