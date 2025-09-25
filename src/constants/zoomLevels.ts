/**
 * Globe 줌 레벨 상수 정의
 * 클러스터링, 렌더링, 상태 관리에서 사용되는 모든 줌 레벨 임계값
 */

// 기본 줌 레벨
export const ZOOM_LEVELS = {
  // 초기/기본 줌 레벨
  DEFAULT: 2.5,

  // 줌 상태 판단 기준
  ZOOM_THRESHOLD: 2.4, // 이보다 작으면 줌인된 상태

  // 클러스터링 거리 계산용 줌 레벨
  CLUSTERING: {
    VERY_FAR: 2.0, // 매우 멀리서 볼 때 - 가까운 국가들만 클러스터링
    FAR: 1.5, // 멀리서 볼 때 - 중간 거리로 클러스터링
    MEDIUM: 1.0, // 중간 거리에서 볼 때 - 작은 거리로 클러스터링
    CLOSE: 0.5, // 가까이서 볼 때 - 매우 작은 거리로 클러스터링
    VERY_CLOSE: 0.3, // 매우 가까이서 볼 때 - 작은 거리로 클러스터링
    ZOOMED_IN: 0.2, // 줌인 상태에서도 같은 국가 클러스터링 유지
    DETAILED: 0.1, // 더 가까워도 같은 국가는 클러스터링
  },

  // 렌더링 관련 줌 레벨
  RENDERING: {
    CITY_LEVEL: 0.2, // 도시 단계 렌더링 기준
    CITY_TO_COUNTRY: 0.22, // 도시에서 국가로 전환 임계값
    COUNTRY_MIN: 0.3, // 국가 레벨 최소 줌
    COUNTRY_TO_ROOT: 0.45, // 국가에서 루트로 전환 임계값
    COUNTRY_MAX: 0.55, // 국가 레벨 최대 줌
  },

  // 기타 줌 관련 임계값
  THRESHOLDS: {
    ZOOM_DETECTION: 0.01, // 줌 변화 감지 임계값
    CITY_TO_COUNTRY_IN: 0.24, // 도시→나라 (줌인 시 진입 기준)
    CITY_TO_COUNTRY_OUT: 0.3, // 도시→나라 (줌아웃 시 이탈 기준)
    COUNTRY_TO_ROOT_IN: 0.55, // 나라→루트 (줌인 시 진입 기준)
    COUNTRY_TO_ROOT_OUT: 0.8, // 나라→루트 (줌아웃 시 이탈 기준)
    SMOOTH_ZOOM_JUMP: 0.1, // 부드러운 줌 점프 임계값
    SMOOTH_ZOOM_THRESHOLD: 0.02, // 부드러운 줌 변화 임계값
  },
} as const;

// 클러스터링 거리 매핑
export const CLUSTERING_DISTANCE_MAP = {
  [ZOOM_LEVELS.CLUSTERING.VERY_FAR]: 12,
  [ZOOM_LEVELS.CLUSTERING.FAR]: 8,
  [ZOOM_LEVELS.CLUSTERING.MEDIUM]: 5,
  [ZOOM_LEVELS.CLUSTERING.CLOSE]: 3,
  [ZOOM_LEVELS.CLUSTERING.VERY_CLOSE]: 2,
  [ZOOM_LEVELS.CLUSTERING.ZOOMED_IN]: 1.5,
  [ZOOM_LEVELS.CLUSTERING.DETAILED]: 1,
} as const;

// 렌더링용 그룹 반지름
export const GROUP_RADIUS = {
  CITY_LEVEL: 120, // 도시 단계에서 타이트하게
  DEFAULT: 140, // 기본 반지름
} as const;

// 브라우저 뷰포트 기본값 (SSR 폴백용)
export const VIEWPORT_DEFAULTS = {
  WIDTH: 600, // SSR 시 기본 너비
  HEIGHT: 800, // SSR 시 기본 높이
} as const;

// Globe 컴포넌트 크기 제한
export const GLOBE_SIZE_LIMITS = {
  MIN_WIDTH: 512, // Globe 최소 너비 (모바일 대응)
  MAX_HEIGHT: 800, // Globe 최대 높이 (성능 최적화)
} as const;
// 대륙 클러스터링 관련 상수
export const CONTINENT_CLUSTERING = {
  // 대륙-국가 전환 임계값
  CONTINENT_TO_COUNTRY_THRESHOLD: 1.8,

  // 겹침 감지 관련
  OVERLAP_DETECTION: {
    PADDING: 20, // 버블 주변 패딩 (px)
    MINIMUM_DISTANCE: 10, // 최소 거리 (px)
    CONTINENT_MERGE_THRESHOLD: 2, // 같은 대륙에서 합칠 최소 국가 수
  },

  // 대륙 버블 스타일 관련
  BUBBLE_STYLE: {
    FONT_SIZE: 16, // 대륙 클러스터 폰트 크기
    PADDING: 32, // 대륙 클러스터 패딩 (16 * 2)
    FLAG_WIDTH: 24, // 플래그 너비
    GAP: 5, // 요소 간 간격
  },
} as const;

// 타입 정의
export type ZoomLevel = typeof ZOOM_LEVELS;
export type ClusteringDistance = typeof CLUSTERING_DISTANCE_MAP;
export type GroupRadius = typeof GROUP_RADIUS;
export type ViewportDefaults = typeof VIEWPORT_DEFAULTS;
export type GlobeSizeLimits = typeof GLOBE_SIZE_LIMITS;
