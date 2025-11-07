import type { Continent } from "@/types/record";

interface ContinentFilterProps {
  continents: Continent[];
  continentStats: Record<Continent, number>;
  selectedContinent: Continent;
  onContinentChange: (continent: Continent) => void;
}

export function ContinentFilter({
  continents,
  continentStats,
  selectedContinent,
  onContinentChange,
}: ContinentFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto -mx-4 px-4 scrollbar-hide">
      {continents.map((continent) => {
        const count = continentStats[continent];
        const isSelected = selectedContinent === continent;
        const isDisabled = count === 0;
        return (
          <button
            type="button"
            key={continent}
            onClick={() => onContinentChange(continent)}
            className={`shrink-0 inline-flex justify-center items-center gap-1 rounded-xl ${
              isSelected
                ? "px-3.5 py-2 bg-state-enabled"
                : isDisabled
                ? "px-3.5 py-2 outline outline-1 outline-offset-[-1px] outline-border-absolutewhite--8"
                : "px-3.5 py-2 outline outline-1 outline-offset-[-1px] outline-border-absolutewhite--16"
            }`}
            disabled={isDisabled}
          >
            <span
              className={`${
                isSelected
                  ? "text-text-inverseprimary text-sm font-bold font-['Pretendard'] leading-5"
                  : isDisabled
                  ? "text-text-inversesecondary text-sm font-medium font-['Pretendard'] leading-5"
                  : "text-white text-sm font-medium font-['Pretendard'] leading-5"
              }`}
            >
              {continent}
            </span>
            {!isDisabled && (
              <span
                className={`${
                  isSelected
                    ? "text-text-inverseprimary text-sm font-bold font-['Pretendard'] leading-5"
                    : "text-white text-sm font-medium font-['Pretendard'] leading-5"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
