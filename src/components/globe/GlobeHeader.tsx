interface GlobeHeaderProps {
  isZoomed: boolean;
}

export const GlobeHeader = ({ isZoomed }: GlobeHeaderProps) => {
  return (
    <div
      className={`text-center pt-8 pb-4 transition-opacity duration-700 ease-out max-w-[512px] mx-auto ${isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div
        className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold mb-3 bg-surface-inverseprimary text-text-inverseprimary transition-all duration-500 delay-100 ${isZoomed ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      >
        AI 인사이트 준비중...
      </div>
      <h1
        className={`text-xl font-extrabold text-text-primary transition-all duration-600 delay-200 ${isZoomed ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      >
        N개 도시, N개국 여행자
      </h1>
    </div>
  );
};
