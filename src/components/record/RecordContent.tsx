"use client";

import { useMemo } from "react";
import type { RecordResponse, Continent } from "@/types/record";
import { RecordHeaderText } from "./RecordHeaderText";
import { ContinentFilter } from "./ContinentFilter";
import { CityList } from "./CityList";
import {
  calculateContinentStats,
  filterRegionsByContinent,
  sortContinentsByCount,
} from "@/utils/recordUtils";

interface RecordContentProps {
  initialData: RecordResponse | null;
  selectedContinent: Continent;
  onContinentChange: (continent: Continent) => void;
}

export function RecordContent({
  initialData,
  selectedContinent,
  onContinentChange,
}: RecordContentProps) {
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
    const stats = calculateContinentStats(regions);
    const filtered = filterRegionsByContinent(regions, selectedContinent);

    return { filteredRegions: filtered, continentStats: stats };
  }, [initialData, selectedContinent]);

  const sortedContinents = useMemo(
    () => sortContinentsByCount(continentStats),
    [continentStats]
  );

  return (
    <div className="space-y-8">
      <RecordHeaderText />
      <ContinentFilter
        continents={sortedContinents}
        continentStats={continentStats}
        selectedContinent={selectedContinent}
        onContinentChange={onContinentChange}
      />
      <CityList filteredRegions={filteredRegions} />
    </div>
  );
}
