import { ImageMetadataComponent } from "@/components/imageMetadata/ImageMetadata";
import type { PageProps } from "@/types/components";

type ImageMetadataPageProps = PageProps<never, { cityId?: string; city?: string; country?: string }>;

export default async function Page({ searchParams }: ImageMetadataPageProps) {
  const params = await searchParams;
  const cityId = params?.cityId ? Number(params.cityId) : undefined;

  return <ImageMetadataComponent cityId={cityId} initialCity={params?.city} initialCountry={params?.country} />;
}
