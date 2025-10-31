"use client";

import { useRouter } from "next/navigation";
import { NationSelectClient } from "@/components/nationSelect/NationSelectClient";
import type { City } from "@/types/city";

interface EditSelectClientProps {
  initialCities: City[];
}

export function EditSelectClient({ initialCities }: EditSelectClientProps) {
  const router = useRouter();

  const handleComplete = (cities: City[]) => {
    const payload = cities.map(({ id, name, country, countryCode }) => ({ id, name, country, countryCode }));
    const encoded = encodeURIComponent(JSON.stringify(payload));
    router.push(`/record/edit?added=${encoded}`);
  };

  return (
    <NationSelectClient
      initialCities={initialCities}
      mode="edit-add"
      onComplete={handleComplete}
      buttonLabel="내 지구본에 추가하기"
    />
  );
}


