import { apiGet } from "@/lib/apiClient";
import type { City, CityApiParams, CityApiResponse, CitySearchResponse } from "@/types/city";
import { transformApiDataToCity } from "@/utils/countryFlagMapping";

export const fetchCities = async (params: CityApiParams = {}): Promise<City[]> => {
  try {
    const data = await apiGet<CityApiResponse>("/api/v1/cities/favorites", params);
    return data.cityResponseList.map(transformApiDataToCity);
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    throw error;
  }
};

export const searchCities = async (keyword: string): Promise<City[]> => {
  try {
    const data = await apiGet<CitySearchResponse>("/api/v1/cities", {
      keyword,
    });
    return data.cities.map(transformApiDataToCity);
  } catch (error) {
    console.error("Failed to search cities:", error);
    throw error;
  }
};
