"use client";

import Image from "next/image";
import { COUNTRY_CODE_TO_FLAG, getCountryName } from "@/constants/countryMapping";

interface EditContentProps {
  cities: { id: string; name: string; countryCode: string }[];
}

export function EditContent({ cities }: EditContentProps) {
  return (
    <div>
      <div className="mb-8">
        <button
          type="button"
          className="w-full px-5 py-3 bg-surface-inverseprimary rounded-xl inline-flex justify-center items-center overflow-hidden"
        >
          <div className="flex justify-center items-center gap-1">
            <div className="w-4 h-4 relative">
              <Image src="/ic_plus.svg" alt="도시 추가" fill className="object-contain" />
            </div>
            <div className="justify-start text-text-inversesecondary text-sm font-bold font-['Pretendard'] leading-5">
              도시 추가
            </div>
          </div>
        </button>
      </div>

      <div className="self-stretch justify-start text-text-primary text-base font-medium font-['Pretendard'] leading-5 mb-4">
        다녀온 도시
      </div>

      <div className="flex flex-col gap-2 pb-12">
        {cities.map((c) => {
          const flag = COUNTRY_CODE_TO_FLAG[c.countryCode] || "🌍";
          const countryName = getCountryName(c.countryCode);
          return (
            <div
              key={c.id}
              className="w-full px-5 py-3 bg-surface-placeholder--4 rounded-2xl inline-flex justify-between items-center overflow-hidden"
            >
              <div className="justify-start text-text-primary text-sm font-medium font-['Pretendard'] leading-5">
                {flag} {c.name}, {countryName}
              </div>
              <div className="w-4 h-4 relative flex items-center justify-center">
                <Image src="/ic_X.svg" alt="삭제" fill className="object-contain" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


