import { cookies } from "next/headers";
import { EditClient } from "@/components/record/EditClient";
import { getMemberTravels } from "@/services/memberService";
import { convertMemberTravelsToRecordResponse } from "@/utils/travelUtils";

export default async function EditRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kakao_access_token")?.value;

  let cities: { id: string; name: string; countryCode: string; lat: number; lng: number; cityId?: number; isNew?: boolean }[] = [];

  if (token) {
    try {
      const memberTravels = await getMemberTravels(token);
      if (memberTravels) {
        // 원본 데이터에서 cityId를 포함한 도시 정보 추출
        for (const travel of memberTravels.data.travels) {
          for (const city of travel.cities) {
            cities.push({
              id: String(city.cityId),
              name: city.cityName,
              countryCode: city.countryCode,
              lat: city.lat,
              lng: city.lng,
              cityId: city.cityId,
            });
          }
        }
      }
    } catch (e) {
    }
  }

  const resolved = await searchParams;
  const addedParam = (Array.isArray(resolved?.added) ? resolved.added[0] : resolved?.added) as string | undefined;
  const removedParam = (Array.isArray(resolved?.removed) ? resolved.removed[0] : resolved?.removed) as string | undefined;
  
  // 원본 도시 목록 저장 (삭제된 도시 정보를 찾기 위해)
  const originalCities = [...cities];
  
  // 삭제된 도시 ID 목록
  const removedIds = new Set<string>();
  if (removedParam) {
    try {
      const decoded = JSON.parse(decodeURIComponent(removedParam));
      if (Array.isArray(decoded)) {
        decoded.forEach((id: any) => removedIds.add(String(id)));
      }
    } catch {}
  }
  
  // 삭제된 도시 정보 추출 (원본 데이터에서)
  const deletedCities = originalCities.filter((c) => removedIds.has(c.id));
  
  // 삭제된 도시 제외
  cities = cities.filter((c) => !removedIds.has(c.id));
  
  // 추가된 도시 추가
  if (addedParam) {
    try {
      const decoded = JSON.parse(decodeURIComponent(addedParam));
      if (Array.isArray(decoded)) {
        const added = decoded.map((c: any) => ({
          id: String(c.id),
          name: String(c.name),
          countryCode: String(c.countryCode),
          lat: Number(c.lat),
          lng: Number(c.lng),
          isNew: true,
        }));
        const existingIds = new Set(cities.map((c) => c.id));
        const merged = [...added.filter((c) => !existingIds.has(c.id)), ...cities];
        cities = merged;
      }
    } catch {}
  }

  return <EditClient cities={cities} deletedCities={deletedCities} />;
}


