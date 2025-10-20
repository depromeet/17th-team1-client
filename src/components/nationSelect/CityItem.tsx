import { CloseIcon, PlusIcon } from "@/assets/icons";
import type { City } from "@/types/city";

type CityItemProps = {
  city: City;
  isSelected: boolean;
  onAdd: (city: City) => void;
  onRemove: (cityId: string) => void;
  showDivider?: boolean;
};

export const CityItem = ({ city, isSelected, onAdd, onRemove, showDivider }: CityItemProps) => {
  const handleClick = () => {
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
        className="w-full flex items-center justify-between py-[18px] cursor-pointer"
      >
        <span className={`font-medium text-left ${isSelected ? "text-[#66717D]" : "text-text-primary"}`}>
          {city.flag} {city.name}, {city.country}
        </span>
        <div
          className={`inline-flex justify-center items-center rounded-md p-1 h-6 text-xs w-6 text-white ${
            isSelected ? "bg-transparent" : "bg-[#293949]"
          }`}
        >
          {isSelected ? <CloseIcon width={10} height={10} /> : <PlusIcon width={10} height={10} />}
        </div>
      </button>
      {showDivider && <div className="border-b border-surface-placeholder--8" />}
    </div>
  );
};
