import { fetchCities } from "@/services/cityService";
import { EditSelectClient } from "@/components/record/EditSelectClient";

export const dynamic = "force-dynamic";

export default async function EditSelectPage() {
  try {
    const initialCities = await fetchCities({ limit: 20 });
    return <EditSelectClient initialCities={initialCities} />;
  } catch (error) {
    console.error("Failed to fetch initial cities:", error);
    return <EditSelectClient initialCities={[]} />;
  }
}


