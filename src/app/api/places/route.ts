import { NextRequest, NextResponse } from "next/server";

/**
 * 주어진 위도(lat)·경도(lng) 쿼리 파라미터를 사용해 반경 2000m 내 Google Places Nearby Search로 장소를 조회하고,
 * 계산된 실제 거리 기준으로 상위 5개 장소의 상세 정보(name, 거리, 평점, 타입)를 반환합니다.
 *
 * 요청에서 `lat` 및 `lng` 쿼리 파라미터를 읽어 Nearby Search API로 모든 유형의 장소를 검색한 뒤
 * 각 장소와 입력 좌표 간의 대원거리(great-circle distance)를 계산합니다. 계산된 거리를 기준으로 오름차순 정렬하여
 * 상위 5개에 대해 Place Details API를 호출해 이름·주소·타입·평점을 수집하고, 그 결과의 이름 목록과
 * 가장 가까운 장소의 vicinity(또는 vicinity이 없으면 입력 좌표)를 JSON으로 응답합니다.
 *
 * @param request - NextRequest 객체. `request.url`의 searchParams에서 `lat`(위도)와 `lng`(경도)를 읽습니다.
 * @returns NextResponse JSON:
 *  - 성공: { places: string[] /* 장소 이름 목록, 거리순 상위 5개 */, address: string | null /* 가장 가까운 장소의 vicinity 또는 좌표 */ }
 *  - 검색 결과 없음: { places: [], address: null }
 *  - 내부 오류 발생 시: { error: "장소 검색 실패" } (HTTP 상태 500)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  try {
    // 1단계: 모든 장소 타입으로 검색
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ko&region=kr&type=tourist_attraction|museum|establishment|point_of_interest|landmark|restaurant|cafe|store|shopping_mall|hospital|school|university|park|church|mosque|temple|synagogue|zoo|aquarium|amusement_park|stadium|gym|spa|beauty_salon|bank|atm|gas_station|parking|subway_station|bus_station|airport|train_station|police|fire_station|post_office|library|pharmacy|dentist|veterinary_care|laundry|car_repair|car_wash|car_dealer|real_estate_agency|travel_agency|insurance_agency|accounting|lawyer|funeral_home|cemetery|embassy|city_hall|courthouse|local_government_office`
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // 거리 계산
      const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
      ) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      };

      // 거리 계산 및 정렬
      const placesWithDistance = data.results.map((place: any) => {
        const actualDistance = calculateDistance(
          parseFloat(lat!),
          parseFloat(lng!),
          place.geometry.location.lat,
          place.geometry.location.lng
        );

        return {
          ...place,
          actualDistance: Math.round(actualDistance),
        };
      });

      // 거리순으로 정렬하고 상위 5개 선택
      const sortedPlaces = placesWithDistance
        .sort((a: any, b: any) => a.actualDistance - b.actualDistance)
        .slice(0, 5);

      // 상세 정보 가져오기
      const placeDetails = [];

      for (const place of sortedPlaces) {
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,types,rating,user_ratings_total&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ko&region=kr`
        );

        const detailsData = await detailsResponse.json();

        if (detailsData.result) {
          placeDetails.push({
            name: detailsData.result.name,
            distance: place.actualDistance,
            rating: detailsData.result.rating,
            types: detailsData.result.types,
          });
        }
      }

      console.log("=== 모든 타입 장소들 (거리순) ===");
      placeDetails.forEach((place, index) => {
        console.log(
          `${index + 1}. ${place.name} - 거리: ${place.distance}m, 평점: ${
            place.rating
          }, 타입: ${place.types.join(", ")}`
        );
      });

      return NextResponse.json({
        places: placeDetails.map((p) => p.name),
        address: sortedPlaces[0]?.vicinity || `${lat}, ${lng}`,
      });
    }

    return NextResponse.json({ places: [], address: null });
  } catch (error) {
    console.error("Places API 에러:", error);
    return NextResponse.json({ error: "장소 검색 실패" }, { status: 500 });
  }
}
