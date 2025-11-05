import ImageMetadata from "@/components/imageMetadata/ImageMetadata";
import type { PageProps } from "@/types/components";

type ImageMetadataPageProps = PageProps<never, { city?: string }>;

export default async function Page({ searchParams }: ImageMetadataPageProps) {
  const params = await searchParams;
  return <ImageMetadata initialCity={params?.city} />;
}
