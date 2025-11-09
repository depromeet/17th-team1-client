import { ImageMetadataComponent } from "@/components/imageMetadata/ImageMetadata";
import type { PageProps } from "@/types/components";

type ImageMetadataPageProps = PageProps<never, { cityId?: string; city?: string; country?: string }>;

export default async function Page({ searchParams }: ImageMetadataPageProps) {
  const params = await searchParams;
  const rawCityId = params?.cityId?.trim();
  const parsedCityId =
    rawCityId && rawCityId !== "undefined" && rawCityId !== "null" ? Number.parseInt(rawCityId, 10) : undefined;
  const cityId = typeof parsedCityId === "number" && Number.isFinite(parsedCityId) ? parsedCityId : undefined;

  return <ImageMetadataComponent cityId={cityId} initialCity={params?.city} initialCountry={params?.country} />;
}
