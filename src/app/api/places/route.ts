import { type NextRequest, NextResponse } from "next/server";
import type { GooglePlaceDetailsResponse, GooglePlacesNearbyResponse, PlaceWithDistance } from "@/types/google-places";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }
  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat/lng must be numbers" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ko&region=kr`,
    );
    const data: GooglePlacesNearbyResponse = await response.json();

    if (data.results && data.results.length > 0) {
      // 거리 계산 함수
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      };

      // 거리 포함 데이터 가공
      const placesWithDistance: PlaceWithDistance[] = data.results.map((place) => {
        const actualDistance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
        return {
          ...place,
          actualDistance: Math.round(actualDistance),
        };
      });

      // 가까운 5개 장소 뽑기
      const sortedPlaces = placesWithDistance.sort((a, b) => a.actualDistance - b.actualDistance).slice(0, 5);

      // 상세 정보 병렬 호출
      const placeDetails = (
        await Promise.all(
          sortedPlaces.map(async (place) => {
            const detailsResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,types,rating,user_ratings_total&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ko&region=kr`,
            );
            const detailsData: GooglePlaceDetailsResponse = await detailsResponse.json();
            if (detailsData.result) {
              return {
                name: detailsData.result.name,
                distance: place.actualDistance,
                rating: detailsData.result.rating,
                types: detailsData.result.types,
              };
            }
            return null;
          }),
        )
      ).filter(Boolean);

      return NextResponse.json({
        places: placeDetails.map((p) => p?.name),
        address: sortedPlaces[0]?.vicinity || `${lat}, ${lng}`,
      });
    }

    return NextResponse.json({ places: [], address: null });
  } catch (error) {
    console.error("Places API 에러:", error);
    return NextResponse.json({ error: "장소 검색 실패" }, { status: 500 });
  }
}
