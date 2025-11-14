import { AddIcon, CloseIcon } from "@/assets/icons";
import type { City } from "@/types/city";

type CityItemProps = {
  city: City;
  isSelected: boolean;
  isRegistered?: boolean; // 이미 등록된 도시 여부
  onAdd: (city: City) => void;
  onRemove: (cityId: string) => void;
  showDivider?: boolean;
};

export const CityItem = ({ city, isSelected, isRegistered = false, onAdd, onRemove, showDivider }: CityItemProps) => {
  const handleClick = () => {
    if (isRegistered) return; // 이미 등록된 도시는 클릭 불가
    if (isSelected) {
      onRemove(city.id);
    } else {
      onAdd(city);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isRegistered}
        className={`w-full flex items-center justify-between py-3 ${
          isRegistered ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span
          className={`font-medium text-left font-['Pretendard'] ${isSelected ? "text-[#66717D]" : "text-text-primary"}`}
        >
          {city.flag} {city.name}, {city.country}
        </span>
        {!isRegistered && (
          <div
            className={`inline-flex justify-center items-center rounded-md p-1 h-6 text-xs w-6 ${
              isSelected ? "bg-transparent" : "bg-[#293949]"
            }`}
          >
            {isSelected ? (
              <CloseIcon width={10} height={10} className="text-white" />
            ) : (
              <AddIcon width={10} height={10} className="text-white" />
            )}
          </div>
        )}
      </button>
      {showDivider && <div className="border-b border-surface-placeholder--8" />}
    </div>
  );
};
