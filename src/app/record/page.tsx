
import { RecordClient } from "@/components/record/RecordClient";
import { getRecordData } from "@/services/memberService";

export const dynamic = "force-dynamic";

export default async function RecordPage() {
  try {
    const recordData = await getRecordData();
    return <RecordClient initialData={recordData} />;
  } catch (error) {
    console.error("Failed to fetch record data:", error);
    return <RecordClient initialData={null} />;
  }
}
