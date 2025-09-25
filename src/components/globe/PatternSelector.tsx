import type { TravelPattern } from "@/data/travelPatterns";

interface PatternSelectorProps {
  patterns: TravelPattern[];
  currentIndex: number;
  onPatternChange: (index: number) => void;
}

export const PatternSelector = ({ patterns, currentIndex, onPatternChange }: PatternSelectorProps) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
      {patterns.map((pattern, index) => (
        <button
          key={pattern.title}
          type="button"
          onClick={() => onPatternChange(index)}
          className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 ${
            currentIndex === index
              ? "bg-blue-theme text-text-inverseprimary"
              : "bg-surface-placeholder--8 text-text-secondary hover:bg-surface-placeholder--16"
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
};
