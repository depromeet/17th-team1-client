"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchInput } from "@/components/common/Input";
import { useCitySearch } from "@/hooks/useCitySearch";
import { createMemberTravels } from "@/services/memberService";
import type { City } from "@/types/city";
import { NationSelectFooter } from "./NationSelectFooter";
import { NationSelectHeader } from "./NationSelectHeader";
import { PopularCitiesList } from "./PopularCitiesList";

type NationSelectClientProps = {
  initialCities: City[];
  registeredCityNames?: string[]; // 이미 등록된 도시 이름 목록
  mode?: "default" | "edit-add";
  onComplete?: (cities: City[]) => void;
  buttonLabel?: string;
  customHeader?: React.ReactNode;
};

export const NationSelectClient = ({
  initialCities,
  registeredCityNames = [],
  mode = "default",
  onComplete,
  buttonLabel,
  customHeader,
}: NationSelectClientProps) => {
  const [selectedCityList, setSelectedCityList] = useState<City[]>([]);
  const router = useRouter();
  const registeredCityNamesSet = new Set(registeredCityNames);

  const { searchResults, isSearching, searchError, searchKeyword, setSearchKeyword, clearSearch, hasSearched } =
    useCitySearch();

  const isSearchingMode = searchKeyword.trim().length > 0;
  const displayCities = isSearchingMode ? searchResults : initialCities;
  const displayError = isSearchingMode ? searchError : null;
  const displayLoading = isSearchingMode ? isSearching : false;

  const selectedCityIds = new Set(selectedCityList.map((city) => city.id));

  const handleAddCity = (city: City) => {
    if (selectedCityIds.has(city.id)) return;
    setSelectedCityList((prev) => [...prev, { ...city, selected: true }]);
  };

  const handleRemoveCity = (cityId: string) => {
    setSelectedCityList((prev) => prev.filter((city) => city.id !== cityId));
  };

  const handleCreateGlobe = async () => {
    if (selectedCityList.length === 0) return;

    if (mode === "edit-add" && onComplete) {
      onComplete(selectedCityList);
      return;
    }

    try {
      await createMemberTravels(selectedCityList);
      router.push("/globe");
    } catch (error) {
      console.error("여행 기록 생성 실패:", error);
      alert("여행 기록 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    if (value.trim().length === 0) {
      clearSearch();
    }
  };

  return (
    <div className="h-screen bg-surface-secondary flex flex-col">
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />

      <div className="flex-1 overflow-y-auto px-4 flex justify-center">
        <div className="w-full max-w-[512px] px-4">
          {customHeader || <NationSelectHeader searchValue={searchKeyword} onSearchChange={handleSearchChange} />}

          {customHeader && (
            <div className="mb-4">
              <SearchInput
                placeholder="도시/나라를 검색해주세요."
                value={searchKeyword}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          )}

          <div>
            <h2 className="text-text-primary text-lg font-bold mb-4">
              {isSearchingMode ? `검색 결과 ${searchResults.length}건` : "인기 여행지"}
            </h2>

            {displayError && (
              <div className="text-red-500 text-center py-4" role="alert" aria-live="polite">
                {isSearchingMode ? "검색 중 오류가 발생했습니다" : "도시를 불러오는 중 오류가 발생했습니다"}
                <div className="mt-1 text-xs text-text-thirdly break-words">
                  {typeof displayError === "string" ? displayError : String(displayError)}
                </div>
              </div>
            )}

            <PopularCitiesList
              cities={displayCities}
              selectedCityIds={selectedCityIds}
              registeredCityNames={registeredCityNamesSet}
              onAddCity={handleAddCity}
              onRemoveCity={handleRemoveCity}
              isLoading={displayLoading}
              isSearching={isSearchingMode && isSearching}
              hasSearched={isSearchingMode && hasSearched}
            />
          </div>
        </div>
      </div>

      <NationSelectFooter
        selectedCities={selectedCityList}
        onRemoveCity={handleRemoveCity}
        onCreateGlobe={handleCreateGlobe}
        buttonLabel={buttonLabel}
      />
    </div>
  );
};
