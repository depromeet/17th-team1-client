import { NationSelectClient } from "@/components/nationSelect/NationSelectClient";
import { fetchCities } from "@/services/cityService";

export const revalidate = 86400; // 60 * 60 * 24 (24 hours)

export default async function NationSelectPage() {
  try {
    const initialCities = await fetchCities({ limit: 53 });
    return <NationSelectClient initialCities={initialCities} />;
  } catch (error) {
    console.error("Failed to fetch initial cities:", error);
    return <NationSelectClient initialCities={[]} />;
  }
}
