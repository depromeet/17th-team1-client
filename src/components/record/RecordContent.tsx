"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { RecordResponse, Continent } from "@/types/record";
import {
  getContinent as getKoreanContinent,
  COUNTRY_CODE_TO_FLAG,
} from "@/constants/countryMapping";

interface RecordContentProps {
  initialData: RecordResponse | null;
  selectedContinent: Continent;
  onContinentChange: (continent: Continent) => void;
}

// 국가 코드 대륙으로 매핑
const getContinentFromCountryCode = (countryCode: string): Continent => {
  const korean = getKoreanContinent(countryCode);
  if (korean === "북아메리카") return "북미";
  if (korean === "남아메리카") return "남미";
  if (
    korean === "아시아" ||
    korean === "유럽" ||
    korean === "아프리카" ||
    korean === "오세아니아"
  ) {
    return korean as Continent;
  }
  return "아시아";
};

// 국기 이모지: 공용 상수 사용
const getCountryFlagByCode = (countryCode: string): string =>
  COUNTRY_CODE_TO_FLAG[countryCode] || "🌍";

export function RecordContent({
  initialData,
  selectedContinent,
  onContinentChange,
}: RecordContentProps) {
  // 대륙별 필터링된 데이터 계산
  const { filteredRegions, continentStats } = useMemo(() => {
    if (!initialData?.data) {
      const emptyStats: Record<Continent, number> = {
        전체: 0,
        아시아: 0,
        유럽: 0,
        북미: 0,
        남미: 0,
        아프리카: 0,
        오세아니아: 0,
      };
      return { filteredRegions: [], continentStats: emptyStats };
    }

    const { regions } = initialData.data;

    // 대륙별 통계 계산
    const stats: Record<Continent, number> = {
      전체: 0,
      아시아: 0,
      유럽: 0,
      북미: 0,
      남미: 0,
      아프리카: 0,
      오세아니아: 0,
    };

    // 전체 도시 수 계산
    stats["전체"] = regions.reduce(
      (total, region) => total + region.cityCount,
      0
    );

    // 대륙별 도시 수 계산
    regions.forEach((region) => {
      region.cities.forEach((city) => {
        const continent = getContinentFromCountryCode(city.countryCode);
        if (continent in stats) {
          stats[continent] = (stats[continent] || 0) + 1;
        }
      });
    });

    // 선택된 대륙에 따라 필터링
    let filteredRegions = regions;
    if (selectedContinent !== "전체") {
      filteredRegions = regions
        .map((region) => ({
          ...region,
          cities: region.cities.filter(
            (city) =>
              getContinentFromCountryCode(city.countryCode) ===
              selectedContinent
          ),
        }))
        .filter((region) => region.cities.length > 0);
    }

    return { filteredRegions, continentStats: stats };
  }, [initialData, selectedContinent]);

  // 대륙 목록: 먼저 도시 수가 많은 순으로 정렬
  const sortedContinents = useMemo(() => {
    const allContinents: Continent[] = [
      "전체",
      "아시아",
      "유럽",
      "북미",
      "남미",
      "아프리카",
      "오세아니아",
    ];

    return allContinents.sort((a, b) => continentStats[b] - continentStats[a]);
  }, [continentStats]);

  const continents = sortedContinents;

  return (
    <div className="space-y-8">
      <div>
        <div className="justify-start">
          <span className="text-text-primary text-2xl font-bold font-['Pretendard'] leading-8">
            여행 중 가장 기억에 남는 사진을
          </span>
          <br/>
          <span className="text-state-focused text-2xl font-bold font-['Pretendard'] leading-8">
            최대 3장
          </span>
          <span className="text-text-primary text-2xl font-bold font-['Pretendard'] leading-8">
            으로 담아보세요.
          </span>
        </div>
      </div>

      {/* 대륙 필터 */}
      <div>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4">
          {continents.map((continent) => {
            const count = continentStats[continent];
            const isSelected = selectedContinent === continent;
            const isDisabled = count === 0;
            return (
              <button
                key={continent}
                onClick={() => onContinentChange(continent)}
                className={`shrink-0 inline-flex justify-center items-center gap-1 rounded-xl ${
                  isSelected
                    ? "px-3.5 py-2 bg-state-enabled"
                    : isDisabled
                      ? "px-3.5 py-2 outline outline-1 outline-offset-[-1px] outline-border-absolutewhite--8"
                      : "px-3.5 py-2 outline outline-1 outline-offset-[-1px] outline-border-absolutewhite--16"
                }`}
                disabled={isDisabled}
              >
                <span
                  className={`${
                    isSelected
                      ? "text-text-inverseprimary text-sm font-bold font-['Pretendard'] leading-5"
                      : isDisabled
                        ? "text-text-inversesecondary text-sm font-medium font-['Pretendard'] leading-5"
                        : "text-white text-sm font-medium font-['Pretendard'] leading-5"
                  }`}
                >
                  {continent}
                </span>
                {!isDisabled && (
                  <span
                    className={`${
                      isSelected
                        ? "text-text-inverseprimary text-sm font-bold font-['Pretendard'] leading-5"
                        : "text-white text-sm font-medium font-['Pretendard'] leading-5"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 도시 목록 */}
      <div className="flex flex-col gap-[30px] pb-8">
        {filteredRegions.map((region, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="text-white text-base font-medium">
              {getCountryFlagByCode(region.cities[0]?.countryCode || "")}{" "}
              {region.regionName}
            </div>
            <div className="flex flex-col gap-2">
              {region.cities.map((city, cityIndex) => (
                <div
                  key={cityIndex}
                  className="self-stretch pl-5 pr-4 py-3 bg-surface-placeholder--4 rounded-2xl inline-flex justify-between items-center overflow-hidden"
                >
                  <div className="justify-start text-text-primary text-sm font-medium font-['Pretendard'] leading-5">
                    {city.name}
                  </div>
                  <div className="w-8 h-8 rounded-lg flex justify-between items-center overflow-hidden">
                    <div className="w-6 h-6 relative rounded-lg overflow-hidden">
                      <Image
                        src="/ic_edit.svg"
                        alt="수정"
                        fill
                        className="object-contain"
                        priority={false}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
