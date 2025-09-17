import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Globber",
  description: "Depromeet 17th Team 1 Project",
};

/**
 * 애플리케이션의 루트 레이아웃 컴포넌트입니다.
 *
 * <html> 및 <body> 구조를 제공하고 전역 폰트 변수와 antialiased 스타일을 적용하며,
 * 클라이언트 측에서 Google Maps JavaScript API를 비동기 로드합니다.
 *
 * @param children - 해당 레이아웃 내부에 렌더링될 React 노드
 * @returns 페이지의 루트 HTML 구조를 담은 JSX 요소
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=ko&region=kr`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}