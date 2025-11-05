import { cookies } from "next/headers";
import { fetchCities } from "@/services/cityService";
import { getMemberTravels } from "@/services/memberService";
import { EditSelectClient } from "@/components/record/EditSelectClient";

export default async function EditSelectPage() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kakao_access_token")?.value;

    // 이미 등록된 도시 이름 목록 가져오기
    const registeredCityNames = new Set<string>();
    if (token) {
      try {
        const memberTravels = await getMemberTravels(token);
        if (memberTravels) {
          for (const travel of memberTravels.data.travels) {
            for (const city of travel.cities) {
              registeredCityNames.add(city.cityName);
            }
          }
        }
      } catch (e) {}
    }

    const initialCities = await fetchCities({ limit: 20 });
    return (
      <EditSelectClient
        initialCities={initialCities}
        registeredCityNames={registeredCityNames}
      />
    );
  } catch (error) {
    console.error("Failed to fetch initial cities:", error);
    return (
      <EditSelectClient initialCities={[]} registeredCityNames={new Set()} />
    );
  }
}
