import { useRouter } from "next/navigation";
import Image from "next/image";
import type { RecordResponse } from "@/types/record";
import { COUNTRY_CODE_TO_FLAG } from "@/constants/countryMapping";

interface CityListProps {
  filteredRegions: RecordResponse["data"]["regions"];
}

const getCountryFlagByCode = (countryCode: string): string =>
  COUNTRY_CODE_TO_FLAG[countryCode] || "🌍";

export function CityList({ filteredRegions }: CityListProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-[30px] pb-8">
      {filteredRegions.map((region, index) => (
        <div key={index} className="flex flex-col gap-3">
          <div className="text-white text-base font-medium">
            {getCountryFlagByCode(region.cities[0]?.countryCode || "")}{" "}
            {region.regionName}
          </div>
          <div className="flex flex-col gap-2">
            {region.cities.map((city, cityIndex) => (
              <div
                key={cityIndex}
                className="self-stretch pl-5 pr-4 py-3 bg-surface-placeholder--4 rounded-2xl inline-flex justify-between items-center overflow-hidden"
              >
                <div className="justify-start text-text-primary text-sm font-medium font-['Pretendard'] leading-5">
                  {city.name}
                </div>
                <button
                  onClick={() => {
                    const cityParam = encodeURIComponent(city.name);
                    router.push(`/image-metadata?city=${cityParam}`);
                  }}
                  className="w-8 h-8 rounded-lg flex justify-center items-center overflow-hidden hover:opacity-70 transition-opacity"
                >
                  <div className="w-6 h-6 relative rounded-lg overflow-hidden">
                    <Image
                      src="/ic_edit.svg"
                      alt="수정"
                      fill
                      className="object-contain"
                      priority={false}
                    />
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
