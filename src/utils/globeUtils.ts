import { COLORS, ISO_CODE_MAP, LABEL_OFFSET } from "@/constants/globe";

// ISO 코드 변환 유틸리티
export const getISOCode = (countryId: string): string => {
  return ISO_CODE_MAP[countryId] || countryId;
};

// 점선 각도 및 길이 계산 (이미지 디자인에 맞춰 짧은 고정 길이)
export const calculateDottedLine = (offsetX: number = LABEL_OFFSET.X, offsetY: number = LABEL_OFFSET.Y) => {
  const lineLength = 20; // 고정된 짧은 라인 길이 (기존: 전체 거리 계산)
  const angle = (Math.atan2(offsetY, offsetX) * 180) / Math.PI;
  return { lineLength, angle };
};

// 폴리곤 색상 계산
export const getPolygonColor = (
  // biome-ignore lint/suspicious/noExplicitAny: GeoJSON feature type
  feature: any,
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic country data
  countries: any[],
  getISOCode: (id: string) => string,
) => {
  const isoCode = feature.id;
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic country data
  const countryData = countries.find((c: any) => getISOCode(c.id) === isoCode);

  // 여행 데이터가 없는 국가는 비활성 색상
  if (!countryData) return COLORS.INACTIVE_POLYGON;

  // 여행 데이터가 있는 국가는 globe 레벨 색상 적용
  // 해당 국가의 도시 수 계산
  const countryCode = getISOCode(countryData.id);
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic country data
  const cityCount = countries.filter((c: any) => getISOCode(c.id) === countryCode).length;

  // Globe Leveling Color 기준 (기획 문서 참조)
  if (cityCount >= 8) return COLORS.GLOBE_LV3; // 8개 이상 도시: Blue 0 (#67E8FF)
  if (cityCount >= 5) return COLORS.GLOBE_LV2; // 5개 이상 도시: Blue 100 (#00CAED)
  return COLORS.GLOBE_LV1; // 1개 이상 도시: Blue 200 (#0084B0)
};

// 브라우저 줌 방지 이벤트 리스너
export const createZoomPreventListeners = () => {
  const preventZoom = (e: WheelEvent) => {
    if (e.ctrlKey) e.preventDefault();
  };

  const preventKeyboardZoom = (e: KeyboardEvent) => {
    if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")) {
      e.preventDefault();
    }
  };

  const preventTouchZoom = (e: TouchEvent) => {
    if (e.touches.length > 1) e.preventDefault();
  };

  return { preventZoom, preventKeyboardZoom, preventTouchZoom };
};
