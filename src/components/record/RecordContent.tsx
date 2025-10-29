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

// 국가 코드를 대륙으로 매핑하는 함수 (공용 매핑 재사용)
const getContinentFromCountryCode = (countryCode: string): Continent => {
  const korean = getKoreanContinent(countryCode); // "북아메리카" 등
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

  // SSR에서 데이터가 없을 때도 동일 레이아웃 유지 (빈 상태)

  return (
    <div className="space-y-8">
      {/* 상단 설명 */}
      <div>
        <div className="text-text-primary text-2xl font-bold">
          여행 중 가장 기억에 남는 사진을
          <br />
          <span className="text-State-Focused">최대 3장</span>으로 담아보세요.
        </div>
      </div>

      {/* 대륙 필터 */}
      <div>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4">
          {continents.map((continent) => (
            <button
              key={continent}
              onClick={() => onContinentChange(continent)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] border shrink-0 ${
                selectedContinent === continent
                  ? "bg-white border-transparent"
                  : "border-white/10"
              } ${continentStats[continent] === 0 ? "opacity-30" : ""}`}
              disabled={continentStats[continent] === 0}
            >
              <span
                className={`text-sm font-bold ${
                  selectedContinent === continent
                    ? "text-surface-secondary"
                    : "text-white"
                }`}
              >
                {continent}
              </span>
              {continentStats[continent] > 0 && (
                <span
                  className={`text-sm font-bold ${
                    selectedContinent === continent
                      ? "text-surface-secondary"
                      : "text-white"
                  }`}
                >
                  {continentStats[continent]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 도시 목록 */}
      <div className="flex flex-col gap-7 pb-8">
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
                  className="w-full px-5 py-3 bg-Surface-Placeholder-4%/5 rounded-xl border border-Border-AbsoluteWhite-4%/5 flex justify-between items-center"
                >
                  <div className="text-white text-sm font-medium">
                    {city.name}
                  </div>
                  <div className="w-8 h-8 bg-0-4%/5 rounded-lg border flex justify-center items-center">
                    <Image
                      src="/modify.svg"
                      alt="수정"
                      width={12}
                      height={12}
                      className="outline outline-[1.50px] outline-offset-[-0.75px] outline-white/80"
                    />
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
