import type { Metadata } from "next";
import Script from "next/script";
import { ClientLayout } from "@/components/common/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Globber(글로버) - 지구본 위에서, 나의 여행을 한눈에!",
  description: "지구본으로 완성하는 여행 기록 서비스",
  icons: {
    icon: "/assets/globe.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.globber.world",
    title: "Globber(글로버) - 지구본 위에서, 나의 여행을 한눈에!",
    description: "지구본으로 완성하는 여행 기록 서비스",
    siteName: "Globber",
    images: [
      {
        url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Globber(글로버) - 지구본 위에서, 나의 여행을 한눈에!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Globber(글로버) - 지구본 위에서, 나의 여행을 한눈에!",
    description: "지구본으로 완성하는 여행 기록 서비스",
    images: ["https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&h=630&fit=crop"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="antialiased min-h-screen"
        style={{ background: "linear-gradient(180deg, #001D39 0%, #0D0C14 100%)" }}
      >
        <ClientLayout>
          <div className="w-full min-h-screen">{children}</div>
        </ClientLayout>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=ko&region=kr`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
