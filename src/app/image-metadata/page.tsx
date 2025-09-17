import ImageMetadata from "@/components/image-metadata/ImageMetadata";

interface PageProps {
  searchParams: Promise<{ city?: string }>;
}

/**
 * 주어진 검색 매개변수에서 `city` 값을 비동기적으로 읽어 ImageMetadata 컴포넌트를 렌더링합니다.
 *
 * Page 컴포넌트는 전달된 `searchParams` 프로미스를 대기하여 해석된 객체의 `city` 값을
 * `initialCity` prop으로 ImageMetadata에 전달하고 그 결과를 반환합니다.
 *
 * @param searchParams - Promise로 전달되는 검색 매개변수 객체. 해제된 객체는 선택적 `city?: string` 속성을 가질 수 있습니다.
 * @returns Promise로 resolve되는 React 노드(렌더된 ImageMetadata 컴포넌트)
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  return <ImageMetadata initialCity={params.city} />;
}
