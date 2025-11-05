import { EditSelectClient } from "@/components/record/EditSelectClient";
import { fetchCities } from "@/services/cityService";
import { getMemberTravels } from "@/services/memberService";
import type { PageProps } from "@/types/components";
import { getServerAuthInfo } from "@/utils/serverCookies";

export const dynamic = "force-dynamic";

type EditSelectPageProps = PageProps<
  never,
  { added?: string; removed?: string }
>;

export default async function EditSelectPage({
  searchParams,
}: EditSelectPageProps) {
  try {
    const { token } = await getServerAuthInfo();

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
      } catch (_e) {}
    }

    const initialCities = await fetchCities({ limit: 20 });
    const params = await searchParams;
    return (
      <EditSelectClient
        initialCities={initialCities}
        registeredCityNames={registeredCityNames}
        addedParam={params?.added}
        removedParam={params?.removed}
      />
    );
  } catch (error) {
    console.error("Failed to fetch initial cities:", error);
    return (
      <EditSelectClient initialCities={[]} registeredCityNames={new Set()} />
    );
  }
}
