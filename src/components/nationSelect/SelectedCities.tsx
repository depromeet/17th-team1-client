import { useEffect, useRef } from "react";
import { Chip } from "@/components/common/Chip";
import type { City } from "@/types/city";

type SelectedCitiesProps = {
  selectedCities: City[];
  onRemoveCity: (cityId: string) => void;
};

export const SelectedCities = ({ selectedCities, onRemoveCity }: SelectedCitiesProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current && selectedCities.length > 0) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [selectedCities.length]);

  if (selectedCities.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-text-thirdly text-xs mb-3 font-bold">{selectedCities.length}개 도시 방문</p>
      <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {selectedCities.map(({ id, flag, name, country }) => (
          <Chip key={id} variant="gray" size="md" removable onRemove={() => onRemoveCity(id)} className="flex-shrink-0">
            {flag} {name}, {country}
          </Chip>
        ))}
      </div>
    </div>
  );
};
