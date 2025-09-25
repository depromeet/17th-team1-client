import worldCountries from "world-countries";

// Globe 설정 상수
export const GLOBE_CONFIG = {
  WIDTH: 600, // 지구본 컴포넌트 너비 (px)
  HEIGHT: 800, // 지구본 컴포넌트 높이 (px)
  INITIAL_ALTITUDE: 7, // 초기 카메라 고도 (지구 반지름 배수) - ZOOM_LEVELS.DEFAULT와 동일
  MIN_ZOOM: 0.01, // 최소 줌 레벨
  MAX_ZOOM: 7, // 최대 줌 레벨 - ZOOM_LEVELS.DEFAULT와 동일
  CLUSTER_ZOOM_STAGE1: 0.5, // 1단계 줌 (하위 클러스터가 보이는 수준) - ZOOM_LEVELS.CLUSTERING.CLOSE와 동일
  CLUSTER_ZOOM: 0.17, // 2단계 줌 (나라 단위가 보이는 수준)
  FOCUS_ZOOM: 0.1, // 국가 포커스 시 줌 레벨 (더 가까이) - ZOOM_LEVELS.CLUSTERING.DETAILED와 동일
  MIN_DISTANCE: 110, // 최소 카메라 거리 (Globe.gl 단위 기준)
  MAX_DISTANCE: 500, // 최대 카메라 거리 (Globe.gl 단위 기준)
  ATMOSPHERE_ALTITUDE: 0, // 대기권 두께 (지구 반지름 배수)
  POLYGON_ALTITUDE: 0.01, // 국경선/폴리곤 높이 (지구 표면 기준)
  HTML_ALTITUDE: 0.01, // HTML 라벨 높이 (지구 표면 기준)
} as const;

// 라벨 오프셋 설정
export const LABEL_OFFSET = {
  X: 50, // 라벨 수평 오프셋 (px)
  Y: -30, // 라벨 수직 오프셋 (px)
} as const;

// 애니메이션 시간 (ms)
export const ANIMATION_DURATION = {
  CAMERA_MOVE: 1500, // 카메라 이동 애니메이션 시간 (더 빠르게)
  INITIAL_SETUP: 1000, // 초기 설정 완료 대기 시간
  ZOOM_UPDATE_DELAY: 50, // 줌 업데이트 디바운스 시간 (더 빠르게)
  SETUP_DELAY: 100, // 설정 지연 시간 (더 빠르게)
} as const;

// 색상 설정
export const COLORS = {
  ATMOSPHERE: "#4a90e2", // 대기권 색상 (파란색)
  CLUSTER: "#4a90e2", // 클러스터 마커 색상
  CLUSTER_BG: "#2c3e50", // 클러스터 배경 색상 (어두운 회색)
  POLYGON_SIDE: "rgba(100,100,100, 0.1)", // 폴리곤 측면 색상
  POLYGON_STROKE: "gray", // 국경선 색상 (흰색 10%와 유사)
  INACTIVE_POLYGON: "#94cbff33", // 비활성 폴리곤 색상 (매우 연한 회색)
  GLOBE_LV1: "#0084b0", // 지구본 레벨 1 색상
  GLOBE_LV2: "#00caed", // 지구본 레벨 2 색상
  GLOBE_LV3: "#67e8ff", // 지구본 레벨 3 색상
  WHITE_LABEL: "rgba(255,255,255,0.8)", // 흰색 라벨 텍스트 색상
  WHITE_BORDER: "rgba(255,255,255,0.6)", // 흰색 테두리 색상
} as const;

// ISO 3166-1 국가코드 매핑 (world-countries 기반)
export const ISO_CODE_MAP: { [key: string]: string } = worldCountries.reduce<{ [key: string]: string }>(
  (acc, country) => {
    const code = country.cca3;
    acc[code] = code; // ISO 코드를 그대로 매핑
    return acc;
  },
  {},
);

// 외부 리소스 URL
export const EXTERNAL_URLS = {
  // 세계 지도 GeoJSON 데이터 URL
  WORLD_GEOJSON: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
  NIGHT_SKY_IMAGE: "//unpkg.com/three-globe/example/img/night-sky.png", // 배경 별하늘 이미지 URL
} as const;
