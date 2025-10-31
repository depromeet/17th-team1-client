import { cookies } from "next/headers";
import { EditClient } from "@/components/record/EditClient";
import { getMemberTravels } from "@/services/memberService";
import { convertMemberTravelsToRecordResponse } from "@/utils/travelUtils";

export default async function EditRecordPage({
  searchParams,
}: {
  searchParams: { added?: string };
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kakao_access_token")?.value;

  let cities: { id: string; name: string; countryCode: string; isNew?: boolean }[] = [];

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

  // merge newly added from selection
  if (searchParams?.added) {
    try {
      const decoded = JSON.parse(decodeURIComponent(searchParams.added));
      if (Array.isArray(decoded)) {
        const added = decoded.map((c: any) => ({ id: String(c.id), name: String(c.name), countryCode: String(c.countryCode), isNew: true }));
        // put new ones at the top, avoid duplicates by id
        const existingIds = new Set(cities.map((c) => c.id));
        const merged = [...added.filter((c) => !existingIds.has(c.id)), ...cities];
        cities = merged;
      }
    } catch {}
  }

  return <EditClient cities={cities} />;
}


