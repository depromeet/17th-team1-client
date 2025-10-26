"use client";

import { useMemo, useState } from "react";

import { getContinent, getCountryName } from "@/constants/countryMapping";
import type { KoreanContinent } from "@/types/geography";
import type { TravelPattern } from "@/types/travelPatterns";

const CONTINENTS: KoreanContinent[] = ["아시아", "유럽", "북아메리카", "남아메리카", "오세아니아", "아프리카"];

const CONTINENT_DISPLAY_NAME: Record<KoreanContinent, string> = {
  아시아: "아시아",
  유럽: "유럽",
  북아메리카: "북미",
  남아메리카: "남미",
  오세아니아: "오세아니아",
  아프리카: "아프리카",
};

type ListViewProps = {
  travelPatterns: TravelPattern[];
};

type GroupedByCountry = {
  countryCode: string;
  countryName: string;
  flag: string;
  continent: KoreanContinent | string;
  cities: Array<{
    name: string;
    lat: number;
    lng: number;
  }>;
};

const ListView = ({ travelPatterns }: ListViewProps) => {
  const [selectedContinent, setSelectedContinent] = useState<KoreanContinent | "전체">("전체");

  // travelPatterns의 countries를 countryCode로 그룹화
  const groupedCountries = useMemo(() => {
    const groups: Map<string, GroupedByCountry> = new Map();

    travelPatterns.forEach((pattern) => {
      pattern.countries.forEach((country) => {
        if (!groups.has(country.id)) {
          groups.set(country.id, {
            countryCode: country.id,
            countryName: getCountryName(country.id),
            flag: country.flag,
            continent: getContinent(country.id),
            cities: [],
          });
        }

        const group = groups.get(country.id);
        if (group) {
          group.cities.push({
            name: country.name,
            lat: country.lat,
            lng: country.lng,
          });
        }
      });
    });

    let result = Array.from(groups.values()).sort((a, b) => a.countryName.localeCompare(b.countryName));

    // 대륙으로 필터링
    if (selectedContinent !== "전체") {
      result = result.filter((group) => group.continent === selectedContinent);
    }

    return result;
  }, [travelPatterns, selectedContinent]);

  // 대륙별 국가 개수
  const continentCounts = useMemo(() => {
    const counts: Record<KoreanContinent | "전체", number> = {
      전체: 0,
      아시아: 0,
      유럽: 0,
      북아메리카: 0,
      남아메리카: 0,
      오세아니아: 0,
      아프리카: 0,
    };

    const allGrouped: Map<string, GroupedByCountry> = new Map();
    travelPatterns.forEach((pattern) => {
      pattern.countries.forEach((country) => {
        if (!allGrouped.has(country.id)) {
          allGrouped.set(country.id, {
            countryCode: country.id,
            countryName: getCountryName(country.id),
            flag: country.flag,
            continent: getContinent(country.id),
            cities: [],
          });
        }
      });
    });

    counts.전체 = allGrouped.size;
    allGrouped.forEach((group) => {
      if (group.continent in counts) {
        counts[group.continent as KoreanContinent]++;
      }
    });

    return counts;
  }, [travelPatterns]);

  return (
    <div className="w-full h-full relative overflow-y-auto">
      <div className="flex flex-col gap-0 items-start w-full max-w-[512px] mx-auto">
        {/* 탭 영역 */}
        <div className="flex gap-2 items-center px-4 py-5 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* 전체 탭 */}
          <button
            type="button"
            onClick={() => setSelectedContinent("전체")}
            className={`px-3.5 py-2 rounded-[12px] font-bold text-sm whitespace-nowrap transition-colors cursor-pointer ${
              selectedContinent === "전체"
                ? "bg-white text-black"
                : "border border-gray-600 text-white hover:border-gray-400"
            }`}
          >
            전체
          </button>

          {/* 대륙 탭 */}
          {CONTINENTS.map((continent) => {
            const isDisabled = continentCounts[continent] === 0;
            return (
              <button
                key={continent}
                type="button"
                disabled={isDisabled}
                onClick={() => setSelectedContinent(continent)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-[12px] text-sm whitespace-nowrap transition-colors ${
                  isDisabled
                    ? "border border-gray-600 text-gray-600 font-medium cursor-not-allowed opacity-50"
                    : selectedContinent === continent
                      ? "bg-white text-black font-bold cursor-pointer"
                      : "border border-gray-600 text-white font-medium hover:border-gray-400 cursor-pointer"
                }`}
              >
                {CONTINENT_DISPLAY_NAME[continent]}
                <span className="text-xs">{continentCounts[continent]}</span>
              </button>
            );
          })}
        </div>

        {/* 국가 목록 */}
        <div className="flex flex-col gap-0 items-start p-4 w-full">
          {groupedCountries.map((group) => (
            <div
              key={group.countryCode}
              className="w-full border-b pt-4 pb-5"
              style={{ borderBottomColor: "rgba(255, 255, 255, 0.04)" }}
            >
              {/* 국가 헤더 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-sm text-white tracking-tight">
                    {group.flag} {group.countryName}
                  </p>
                  {group.cities.length > 1 && (
                    <div
                      className="flex items-center justify-center size-[20px] rounded-[1000px]"
                      style={{ backgroundColor: "rgba(105, 212, 255, 0.3)" }}
                    >
                      <p
                        className="font-medium text-white text-center whitespace-nowrap"
                        style={{ fontSize: "12px", lineHeight: "1.28" }}
                      >
                        {group.cities.length}
                      </p>
                    </div>
                  )}
                </div>

                {/* 도시 칩 목록 */}
                <div className="flex flex-wrap gap-2">
                  {group.cities.map((city) => (
                    <div
                      key={`${group.countryCode}-${city.name}`}
                      className="border rounded-[12px]"
                      style={{ borderColor: "var(--color-border-absolutewhite--4)" }}
                    >
                      <div className="flex gap-2 items-center px-[12px] py-[8px] rounded-[inherit] bg-[var(--color-surface-placeholder--8)]">
                        <p className="font-medium text-white" style={{ fontSize: "14px", letterSpacing: "-0.28px" }}>
                          {city.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListView;
