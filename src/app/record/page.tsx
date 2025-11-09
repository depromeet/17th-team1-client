import { cookies } from "next/headers";
import { RecordClient } from "@/components/record/RecordClient";
import { getMemberTravels } from "@/services/memberService";
import type { RecordResponse } from "@/types/record";
import { convertMemberTravelsToRecordResponse } from "@/utils/travelUtils";

export const dynamic = "force-dynamic";

export default async function RecordPage() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kakao_access_token")?.value;

    if (!token) {
      return <RecordClient initialData={null} />;
    }

    const memberTravels = await getMemberTravels(token);

    if (!memberTravels) {
      return <RecordClient initialData={null} />;
    }

    const recordData: RecordResponse = convertMemberTravelsToRecordResponse(memberTravels);
    return <RecordClient initialData={recordData} />;
  } catch (error) {
    console.error("Failed to fetch record data:", error);
    return <RecordClient initialData={null} />;
  }
}
