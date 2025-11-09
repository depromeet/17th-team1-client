import Image from "next/image";
import { useRouter } from "next/navigation";
import { COUNTRY_CODE_TO_FLAG } from "@/constants/countryMapping";
import type { RecordResponse } from "@/types/record";

interface CityListProps {
  filteredRegions: RecordResponse["data"]["regions"];
}

const getCountryFlagByCode = (countryCode?: string): string =>
  countryCode ? COUNTRY_CODE_TO_FLAG[countryCode] || "🌍" : "🌍";

export function CityList({ filteredRegions }: CityListProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-[30px] pb-8">
      {filteredRegions.map((region) => (
        <div key={`${region.regionName}-${region.cities[0]?.countryCode || ""}`} className="flex flex-col gap-3">
          <div className="text-white text-base font-medium">
            {getCountryFlagByCode(region.cities[0]?.countryCode)} {region.regionName}
          </div>
          <div className="flex flex-col gap-2">
            {region.cities.map((city) => (
              <div
                key={`${region.regionName}-${city.name}-${city.lat}-${city.lng}`}
                className="self-stretch pl-5 pr-4 py-3 bg-surface-placeholder--4 rounded-2xl inline-flex justify-between items-center overflow-hidden"
              >
                <div className="justify-start text-text-primary text-sm font-medium font-['Pretendard'] leading-5">
                  {city.name}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const cityParam = encodeURIComponent(city.name);
                    const countryParam = encodeURIComponent(region.regionName);
                    router.push(`/image-metadata?country=${countryParam}&city=${cityParam}`);
                  }}
                  className="w-8 h-8 rounded-lg flex justify-center items-center overflow-hidden hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <div className="w-6 h-6 relative rounded-lg overflow-hidden">
                    <Image src="/ic_edit.svg" alt="수정" fill className="object-contain" priority={false} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
