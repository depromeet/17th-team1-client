import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * OG 이미지를 동적으로 생성하는 API
 * 쿼리 파라미터: nickname, uuid
 * 예: /api/og-image?nickname=민지&uuid=d893516a-e667-4484-9a36-865ff43f85db
 *
 * 디자인: Figma node-id=697-22405
 * - 상단: 제목 (nickname님의 지구본)
 * - 중앙: 지구본 이미지 (/src/assets/images/og-link-globe.png)
 * - 하단 텍스트는 제거 (카카오톡에서 자동으로 생성됨)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get("nickname") || "여행자";

    const globeImage = await fetch(new URL("/assets/images/og-link-globe.png", request.url)).then((res) =>
      res.arrayBuffer(),
    );

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "#1a1f2e",
          fontFamily: "'Pretendard', system-ui, sans-serif",
          padding: 0,
          margin: 0,
        }}
      >
        {/* 상단 제목 영역 */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "150px",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a1f2e",
            paddingTop: "30px",
          }}
        >
          <div
            style={{
              fontSize: "70px",
              fontWeight: "700",
              color: "white",
              letterSpacing: "-1.05px",
              lineHeight: "1.2",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {nickname}님의 지구본
          </div>
        </div>

        {/* 중앙 지구본 이미지 영역 */}
        <div
          style={{
            display: "flex",
            flex: "1",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            background: "#1a1f2e",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src={globeImage}
            alt="Globber"
            style={{
              width: "500px",
              height: "auto",
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
  } catch (error) {
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
