import type { City } from "@/types/city";
import type { TravelRecord } from "@/types/member";

// City 타입을 TravelRecord로 변환하는 함수
export const convertCitiesToTravelRecords = (cities: City[]): TravelRecord[] => {
  return cities.map((city) => ({
    countryName: city.country,
    cityName: city.name,
    lat: city.lat,
    lng: city.lng,
    countryCode: city.countryCode,
  }));
};
