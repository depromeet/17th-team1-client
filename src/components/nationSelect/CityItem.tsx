import { CloseIcon, PlusIcon } from "@/assets/icons";
import { Button } from "@/components/common/Button";
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
      <div className="flex items-center justify-between py-[18px]">
        <button
          type="button"
          className={`font-medium cursor-pointer text-left ${isSelected ? "text-[#66717D]" : "text-text-primary"}`}
          onClick={handleClick}
        >
          {city.flag} {city.name}, {city.country}
        </button>
        <Button
          variant="gray"
          size="xs"
          onClick={handleClick}
          className={`w-6 cursor-pointer items-center justify-center ${isSelected ? "bg-transparent" : ""}`}
        >
          {isSelected ? <CloseIcon width={10} height={10} /> : <PlusIcon width={10} height={10} />}
        </Button>
      </div>
      {showDivider && <div className="border-b border-surface-placeholder--8" />}
    </div>
  );
};
