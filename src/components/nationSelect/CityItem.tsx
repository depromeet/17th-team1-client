import { CloseIcon, PlusIcon } from "@/assets/icons";
import type { City } from "@/types/city";

type CityItemProps = {
  city: City;
  isSelected: boolean;
  isRegistered?: boolean; // 이미 등록된 도시 여부
  onAdd: (city: City) => void;
  onRemove: (cityId: string) => void;
  showDivider?: boolean;
};

export const CityItem = ({
  city,
  isSelected,
  isRegistered = false,
  onAdd,
  onRemove,
  showDivider,
}: CityItemProps) => {
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
        className={`w-full flex items-center justify-between py-[18px] ${
          isRegistered ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span
          className={`font-medium text-left ${
            isSelected ? "text-[#66717D]" : "text-text-primary"
          }`}
        >
          {city.flag} {city.name}, {city.country}
        </span>
        <div
          className={`inline-flex justify-center items-center rounded-md p-1 h-6 text-xs w-6 ${
            isRegistered
              ? "bg-transparent"
              : isSelected
              ? "bg-transparent"
              : "bg-[#293949]"
          }`}
        >
          {isRegistered ? (
            <div className="w-6 h-6 relative bg-Surface-Placeholder-16%/20 rounded-lg overflow-hidden">
              <div className="w-2 h-0 left-[8px] top-[12px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-Surface-InversePrimary" />
              <div className="w-2 h-0 left-[12px] top-[8px] absolute origin-top-left rotate-90 outline outline-[1.50px] outline-offset-[-0.75px] outline-Surface-InversePrimary" />
            </div>
          ) : isSelected ? (
            <CloseIcon width={10} height={10} />
          ) : (
            <PlusIcon width={10} height={10} />
          )}
        </div>
      </button>
      {showDivider && (
        <div className="border-b border-surface-placeholder--8" />
      )}
    </div>
  );
};
