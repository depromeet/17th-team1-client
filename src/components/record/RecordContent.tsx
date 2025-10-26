"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { RecordResponse, Continent } from "@/types/record";

interface RecordContentProps {
  initialData: RecordResponse | null;
  selectedContinent: Continent;
  onContinentChange: (continent: Continent) => void;
}

// 국가 코드를 대륙으로 매핑하는 함수
const getContinentFromCountryCode = (countryCode: string): Continent => {
  const continentMap: Record<string, Continent> = {
    // 아시아
    JPN: "아시아",
    KOR: "아시아",
    CHN: "아시아",
    THA: "아시아",
    VNM: "아시아",
    SGP: "아시아",
    MYS: "아시아",
    IDN: "아시아",
    PHL: "아시아",
    IND: "아시아",
    MMR: "아시아",
    KHM: "아시아",
    LAO: "아시아",
    BGD: "아시아",
    LKA: "아시아",
    NPL: "아시아",
    BTN: "아시아",
    MNG: "아시아",
    KAZ: "아시아",
    UZB: "아시아",
    KGZ: "아시아",
    TJK: "아시아",
    TKM: "아시아",
    AFG: "아시아",
    IRN: "아시아",
    IRQ: "아시아",
    SYR: "아시아",
    LBN: "아시아",
    JOR: "아시아",
    ISR: "아시아",
    PSE: "아시아",
    SAU: "아시아",
    ARE: "아시아",
    QAT: "아시아",
    BHR: "아시아",
    KWT: "아시아",
    OMN: "아시아",
    YEM: "아시아",
    GEO: "아시아",
    ARM: "아시아",
    AZE: "아시아",
    TUR: "아시아",
    CYP: "아시아",

    // 유럽
    GBR: "유럽",
    FRA: "유럽",
    DEU: "유럽",
    ITA: "유럽",
    ESP: "유럽",
    NLD: "유럽",
    BEL: "유럽",
    CHE: "유럽",
    AUT: "유럽",
    POL: "유럽",
    CZE: "유럽",
    HUN: "유럽",
    ROU: "유럽",
    BGR: "유럽",
    GRC: "유럽",
    PRT: "유럽",
    DNK: "유럽",
    SWE: "유럽",
    NOR: "유럽",
    FIN: "유럽",
    ISL: "유럽",
    IRL: "유럽",
    LUX: "유럽",
    SVN: "유럽",
    HRV: "유럽",
    SRB: "유럽",
    MKD: "유럽",
    ALB: "유럽",
    MNE: "유럽",
    BIH: "유럽",
    LTU: "유럽",
    LVA: "유럽",
    EST: "유럽",
    BLR: "유럽",
    MDA: "유럽",
    UKR: "유럽",
    RUS: "유럽",
    SVK: "유럽",

    // 북미
    USA: "북미",
    CAN: "북미",
    MEX: "북미",
    GTM: "북미",
    BLZ: "북미",
    SLV: "북미",
    HND: "북미",
    NIC: "북미",
    CRI: "북미",
    PAN: "북미",
    CUB: "북미",
    JAM: "북미",
    DOM: "북미",
    HTI: "북미",
    BHS: "북미",
    BRB: "북미",

    // 남미
    BRA: "남미",
    ARG: "남미",
    CHL: "남미",
    PER: "남미",
    COL: "남미",
    VEN: "남미",
    ECU: "남미",
    BOL: "남미",
    PRY: "남미",
    URY: "남미",
    GUY: "남미",
    SUR: "남미",

    // 아프리카
    ZAF: "아프리카",
    EGY: "아프리카",
    NGA: "아프리카",
    KEN: "아프리카",
    MAR: "아프리카",
    TUN: "아프리카",
    DZA: "아프리카",
    LBY: "아프리카",
    ETH: "아프리카",
    GHA: "아프리카",
    UGA: "아프리카",
    TZA: "아프리카",

    // 오세아니아
    AUS: "오세아니아",
    NZL: "오세아니아",
    FJI: "오세아니아",
    PNG: "오세아니아",
  };

  return continentMap[countryCode] || "아시아";
};

// 국가 코드를 이모지로 매핑하는 함수
const getCountryFlag = (countryCode: string): string => {
  const flagMap: Record<string, string> = {
    JPN: "🇯🇵",
    KOR: "🇰🇷",
    CHN: "🇨🇳",
    THA: "🇹🇭",
    VNM: "🇻🇳",
    SGP: "🇸🇬",
    MYS: "🇲🇾",
    IDN: "🇮🇩",
    PHL: "🇵🇭",
    IND: "🇮🇳",
    MMR: "🇲🇲",
    KHM: "🇰🇭",
    USA: "🇺🇸",
    CAN: "🇨🇦",
    MEX: "🇲🇽",
    GBR: "🇬🇧",
    FRA: "🇫🇷",
    DEU: "🇩🇪",
    ITA: "🇮🇹",
    ESP: "🇪🇸",
    NLD: "🇳🇱",
    BEL: "🇧🇪",
    CHE: "🇨🇭",
    AUT: "🇦🇹",
    POL: "🇵🇱",
    CZE: "🇨🇿",
    HUN: "🇭🇺",
    ROU: "🇷🇴",
    BGR: "🇧🇬",
    GRC: "🇬🇷",
    PRT: "🇵🇹",
    DNK: "🇩🇰",
    SWE: "🇸🇪",
    NOR: "🇳🇴",
    FIN: "🇫🇮",
    ISL: "🇮🇸",
    IRL: "🇮🇪",
    LUX: "🇱🇺",
    SVN: "🇸🇮",
    HRV: "🇭🇷",
    SRB: "🇷🇸",
    MKD: "🇲🇰",
    ALB: "🇦🇱",
    MNE: "🇲🇪",
    BIH: "🇧🇦",
    LTU: "🇱🇹",
    LVA: "🇱🇻",
    EST: "🇪🇪",
    BLR: "🇧🇾",
    MDA: "🇲🇩",
    UKR: "🇺🇦",
    RUS: "🇷🇺",
    SVK: "🇸🇰",
    TUR: "🇹🇷",
    CYP: "🇨🇾",
    GEO: "🇬🇪",
    ARM: "🇦🇲",
    AZE: "🇦🇿",
    BRA: "🇧🇷",
    ARG: "🇦🇷",
    CHL: "🇨🇱",
    PER: "🇵🇪",
    COL: "🇨🇴",
    VEN: "🇻🇪",
    ECU: "🇪🇨",
    BOL: "🇧🇴",
    PRY: "🇵🇾",
    URY: "🇺🇾",
    GUY: "🇬🇾",
    SUR: "🇸🇷",
    ZAF: "🇿🇦",
    EGY: "🇪🇬",
    NGA: "🇳🇬",
    KEN: "🇰🇪",
    MAR: "🇲🇦",
    TUN: "🇹🇳",
    DZA: "🇩🇿",
    LBY: "🇱🇾",
    ETH: "🇪🇹",
    GHA: "🇬🇭",
    UGA: "🇺🇬",
    TZA: "🇹🇿",
    AUS: "🇦🇺",
    NZL: "🇳🇿",
    FJI: "🇫🇯",
    PNG: "🇵🇬",
  };

  return flagMap[countryCode] || "🌍";
};

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

  if (!initialData?.data) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-white text-lg">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 상단 설명 */}
      <div>
        <h1 className="text-text-primary text-2xl font-bold leading-loose">
          여행 중 가장 기억에 남는 사진을{" "}
          <span className="text-State-Focused">최대 3장</span>으로 담아보세요.
        </h1>
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
              {getCountryFlag(region.cities[0]?.countryCode || "")}{" "}
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
