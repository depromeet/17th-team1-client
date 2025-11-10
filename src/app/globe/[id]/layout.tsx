import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: uuid } = await params;

  // API에서 사용자 정보 가져오기 (nickname)
  let nickname = "여행자";
  try {
    const response = await fetch(`https://api.globber.world/api/globe/${uuid}`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      if (data.data?.nickname) {
        nickname = data.data.nickname;
      }
    }
  } catch {
    // API 호출 실패 시 기본값 사용
  }

  const baseUrl = "https://www.globber.world";
  const ogImage = `${baseUrl}/api/og-image?nickname=${encodeURIComponent(nickname)}&uuid=${uuid}`;
  const ogImageSquare = `${baseUrl}/api/og-image?nickname=${encodeURIComponent(nickname)}&uuid=${uuid}&type=square`;
  const shareUrl = `${baseUrl}/globe/${uuid}`;

  return {
    title: `Globber(글로버) - ${nickname}님의 지구본`,
    description: `${nickname}님의 여행 기록을 담은 지구본을 확인해보세요!`,
    openGraph: {
      title: `Globber(글로버) - ${nickname}님의 지구본`,
      description: `${nickname}님의 여행 기록을 담은 지구본을 확인해보세요!`,
      type: "website",
      url: shareUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${nickname}님의 지구본`,
        },
        {
          url: ogImageSquare,
          width: 630,
          height: 630,
          alt: `${nickname}님의 지구본`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Globber(글로버) - ${nickname}님의 지구본`,
      description: `${nickname}님의 여행 기록을 담은 지구본을 확인해보세요!`,
      images: [ogImage],
    },
  };
}

export default function GlobeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
