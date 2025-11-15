/**
 * Google Maps Places API를 사용하여 좌표 주변의 장소명(POI)을 가져옵니다.
 * 장소가 없으면 Geocoding API로 fallback하여 주소를 반환합니다.
 *
 * @param latitude - 위도
 * @param longitude - 경도
 * @returns 장소명 또는 주소. 실패 시 null 반환
 *
 * @example
 * const placeName = await reverseGeocode(37.4850, 127.0178);
 * // "스타벅스 강남점" 또는 "서울특별시 강남구 ..."
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    // 1단계: Places API로 주변 장소 검색 (반경 100m)
    const placesResponse = await fetch(`/api/places?lat=${latitude}&lng=${longitude}&radius=100`);

    if (placesResponse.ok) {
      const placesData = await placesResponse.json();

      if (placesData.results && placesData.results.length > 0) {
        // 너무 광범위한 타입 제외 (locality, political 등)
        const excludedTypes = ["locality", "political", "sublocality", "sublocality_level_1"];

        // 구체적인 장소 찾기 (건물, 상점, POI 등)
        const specificPlace = placesData.results.find((place: { types: string[]; name: string }) => {
          return !place.types.some((type: string) => excludedTypes.includes(type));
        });

        const selectedPlace = specificPlace || placesData.results[0];
        const placeName = selectedPlace.name;

        if (placeName && typeof placeName === "string") {
          console.log(`✅ Places API 결과: ${placeName} (타입: ${selectedPlace.types?.join(", ")})`);
          return placeName;
        }
      }
    }

    // 2단계: Places API에서 결과 없으면 Geocoding API로 fallback
    console.log("📍 Places API 결과 없음 → Geocoding API로 fallback");
    const geocodeResponse = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);

    if (!geocodeResponse.ok) {
      console.error("Reverse geocoding failed:", geocodeResponse.status);
      return null;
    }

    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      console.warn("No geocoding results found for coordinates:", latitude, longitude);
      return null;
    }

    // Geocoding 결과에서 건물명/장소명 추출
    console.log("🔍 Geocoding API 전체 응답:", JSON.stringify(geocodeData.results[0], null, 2));

    const firstResult = geocodeData.results[0];

    if (firstResult?.address_components) {
      console.log("📋 address_components:", firstResult.address_components.map((c: { types: string[]; long_name: string }) => ({
        name: c.long_name,
        types: c.types
      })));

      // premise (건물명), establishment, point_of_interest 순서로 우선순위 검색
      const placeComponent = firstResult.address_components.find((component: {
        types: string[];
        long_name: string;
      }) =>
        component.types.includes("premise") ||
        component.types.includes("establishment") ||
        component.types.includes("point_of_interest") ||
        component.types.includes("subpremise")
      );

      if (placeComponent?.long_name) {
        console.log(`✅ Geocoding 건물명 결과: ${placeComponent.long_name}`);
        return placeComponent.long_name;
      } else {
        console.log("⚠️  건물명/장소명 타입을 찾지 못함");
      }
    }

    // 마지막 fallback: formatted_address
    const fallbackAddress = firstResult?.formatted_address;

    if (!fallbackAddress || typeof fallbackAddress !== "string") {
      console.warn("Invalid placeName in geocoding response:", geocodeData.results[0]);
      return null;
    }

    console.log(`📍 Fallback 주소: ${fallbackAddress}`);
    return fallbackAddress;
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    return null;
  }
};

/**
 * 여러 좌표를 한번에 장소명으로 변환합니다.
 *
 * @param coordinates - { latitude: number, longitude: number }[] 배열
 * @returns (string | null)[] - 각 좌표에 대응하는 장소명 배열
 */
export const reverseGeocodeMultiple = async (
  coordinates: { latitude: number; longitude: number }[],
): Promise<(string | null)[]> => {
  return Promise.all(coordinates.map(({ latitude, longitude }) => reverseGeocode(latitude, longitude)));
};
