type GlobeHeaderProps = {
  isZoomed: boolean;
  travelInsight?: string;
  cityCount?: number;
  countryCount?: number;
};

// 마크다운 문법 제거 함수
const removeMarkdown = (text?: string) => {
  if (!text) return "";

  // **텍스트** 패턴에서 ** 제거
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
};

export const GlobeHeader = ({ isZoomed, travelInsight, cityCount = 0, countryCount = 0 }: GlobeHeaderProps) => {
  return (
    <div
      className={`text-center pt-20 pb-4 transition-opacity duration-700 ease-out max-w-[512px] mx-auto ${
        isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold mb-3 bg-surface-inverseprimary text-text-inverseprimary transition-all duration-500 delay-100 ${
          isZoomed ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {removeMarkdown(travelInsight) || "AI 인사이트 준비중..."}
      </div>
      <h1
        className={`text-xl font-extrabold text-text-primary transition-all duration-600 delay-200 ${
          isZoomed ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {cityCount}개 도시, {countryCount}개국 여행자
      </h1>
    </div>
  );
};
