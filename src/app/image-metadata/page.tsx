import ImageMetadata from "@/components/imageMetadata/ImageMetadata";

type PageProps = {
  searchParams: Promise<{ city?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  return <ImageMetadata initialCity={params.city} />;
}
