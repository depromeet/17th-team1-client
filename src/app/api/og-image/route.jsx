import { readFileSync } from "fs";
import { ImageResponse } from "next/og";
import { join } from "path";

export const runtime = "nodejs";

/**
 * OG 이미지를 동적으로 생성하는 API
 * 쿼리 파라미터: nickname, uuid
 * 예: /api/og-image?nickname=민지&uuid=d893516a-e667-4484-9a36-865ff43f85db
 *
 * 디자인
 * - 상단: 제목 (nickname님의 지구본)
 * - 중앙: 지구본 이미지 (public/assets/og-link-globe.png)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get("nickname") || "여행자";
    const type = searchParams.get("type") || "default"; // default 또는 square

    // public 폴더에서 이미지 읽기
    const imagePath = join(process.cwd(), "public", "assets", "og-link-globe.png");
    let globeImageBase64 = "";

    try {
      const imageBuffer = readFileSync(imagePath);
      globeImageBase64 = imageBuffer.toString("base64");
    } catch {
      // 이미지 로드 실패 시 폴백으로 이모지 사용
    }

    const globeImageDataUrl = globeImageBase64 ? `data:image/png;base64,${globeImageBase64}` : "";

    // 정사각형 이미지 (카카오톡 공유용)
    if (type === "square") {
      return new ImageResponse(
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0066cc 0%, #1a1f2e 50%, #000000 100%)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            padding: 0,
            margin: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src={
              globeImageDataUrl ||
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='630' height='630'%3E%3Ccircle cx='315' cy='315' r='280' fill='%234a9fd8'/%3E%3C/svg%3E"
            }
            alt="Globber"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>,
        {
          width: 630,
          height: 630,
        },
      );
    }

    // 기본 이미지 (썸네일, 웹 공유용)
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "linear-gradient(135deg, #0066cc 0%, #1a1f2e 50%, #000000 100%)",
          fontFamily: "'Pretendard', system-ui, sans-serif",
          padding: "40px 0",
          margin: 0,
          position: "relative",
        }}
      >
        {/* 상단 제목 영역 */}
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            paddingTop: "20px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: "80px",
              fontWeight: "700",
              color: "#ffffff",
              letterSpacing: "-1.05px",
              lineHeight: "1.2",
              textAlign: "center",
              maxWidth: "100%",
            }}
          >
            {nickname}님의 지구본
          </div>
        </div>

        {/* 중앙 지구본 이미지 영역 - 정사각형 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "500px",
            height: "500px",
            background: "transparent",
            position: "relative",
            overflow: "hidden",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <img
            src={
              globeImageDataUrl ||
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Ccircle cx='250' cy='250' r='225' fill='%234a9fd8'/%3E%3C/svg%3E"
            }
            alt="Globber"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1f2e",
          color: "white",
          fontSize: "24px",
        }}
      >
        OG Image Generation Failed
      </div>,
      { width: 1200, height: 630 },
    );
  }
}
