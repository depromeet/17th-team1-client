import { cookies } from "next/headers";
import { EditClient } from "@/components/record/EditClient";
import { getMemberTravels } from "@/services/memberService";
import { convertMemberTravelsToRecordResponse } from "@/utils/travelUtils";

export default async function EditRecordPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kakao_access_token")?.value;

  let cities: { id: string; name: string; countryCode: string }[] = [];

  if (token) {
    try {
      const memberTravels = await getMemberTravels(token);
      if (memberTravels) {
        const record = convertMemberTravelsToRecordResponse(memberTravels);
        for (const region of record.data.regions) {
          for (const city of region.cities) {
            cities.push({ id: `${city.name}-${city.lat}-${city.lng}`, name: city.name, countryCode: city.countryCode });
          }
        }
      }
    } catch (e) {
      // ignore and render empty list
    }
  }

  return <EditClient cities={cities} />;
}


