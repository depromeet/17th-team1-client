/**
 * 기획서에 맞는 HTML 엘리먼트 렌더러
 * - 대륙 버블: 국기 없이 텍스트만, 반투명 배경, 진한 회색 텍스트
 * - 국가 버블: 국기 + 텍스트 + 도시 개수 원형 배지, 반투명 배경, 흰색 텍스트
 * - 도시 버블: 국기 + 도시명, 반투명 배경
 */

// 라벨 위치 계산 함수 (클릭 기반 시스템용)
export const calculateLabelPosition = (
  // biome-ignore lint/suspicious/noExplicitAny: Globe.gl library type
  d: any,
  // biome-ignore lint/suspicious/noExplicitAny: Globe.gl library type
  htmlElements: any[],
  _zoomLevel: number, // 사용하지 않음
  // biome-ignore lint/suspicious/noExplicitAny: Globe.gl library type
  _globeRef: React.RefObject<any>, // 사용하지 않음
) => {
  // 단순히 ID를 기반으로 왼쪽/오른쪽 결정
  const labelIndex = htmlElements.findIndex((item) => item.id === d.id);
  const isLeftSide = labelIndex % 2 === 1;
  const angleOffset = isLeftSide ? 180 : 0; // 왼쪽(180°) 또는 오른쪽(0°)

  // 고정 거리 사용
  const fixedDistance = 100;

  return { angleOffset, dynamicDistance: fixedDistance };
};

// 화면 경계 제한 계산 (단순화)
export const calculateClampedDistance = (
  dynamicDistance: number,
  _angleOffset: number, // 사용하지 않음
  _currentPos: { x: number; y: number }, // 사용하지 않음
  _isCityLevel: boolean, // 사용하지 않음
  // biome-ignore lint/suspicious/noExplicitAny: Globe.gl library type
  _globeRef: React.RefObject<any>, // 사용하지 않음
) => {
  // 단순히 고정 거리 반환
  return dynamicDistance;
};

// 기획서에 맞는 개별 도시 HTML 생성
export const createCityHTML = (
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic styles object
  styles: any,
  displayFlag: string,
  cityName: string,
) => {
  return `
    <!-- 중심 dot -->
    <div style="${styles.dot}"></div>
    <!-- 점선 -->
    <div style="${styles.horizontalLine}"></div>
    <div style="${styles.label}">
      <!-- 좌측 국기 이모지 -->
      <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${displayFlag}</span>
      <!-- 도시명 -->
      <span>
        ${cityName}
      </span>
    </div>
  `;
};

// 기획서에 맞는 대륙 클러스터 HTML 생성 (국기 표시 안함)
export const createContinentClusterHTML = (
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic styles object
  styles: any,
  continentName: string,
  _countryCount: number,
  _flagEmoji: string,
) => {
  return `
    <!-- 중심 dot -->
    <div style="${styles.dot}"></div>
    <!-- 단색 수평선 -->
    <div style="${styles.horizontalLine}"></div>
    <div style="${styles.label}">
      <!-- 대륙명만 표시 (국기 없음) -->
      <span>
        ${continentName}
      </span>
    </div>
  `;
};

// 기획서에 맞는 국가 클러스터 HTML 생성
export const createCountryClusterHTML = (
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic styles object
  styles: any,
  countryName: string,
  cityCount: number,
  flagEmoji: string,
  _isExpanded: boolean = false,
) => {
  return `
    <!-- 중심 dot -->
    <div style="${styles.dot}"></div>
    <!-- 단색 수평선 -->
    <div style="${styles.horizontalLine}"></div>
    <div style="${styles.label}">
      <!-- 좌측 국기 이모지 -->
      <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${flagEmoji}</span>
      <!-- 국가명 -->
      <span>
        ${countryName}
      </span>
      <!-- 기획서에 맞는 도시 개수 원형 배지 (복수개일 경우만) -->
      ${
        cityCount >= 1
          ? `<div style="${styles.countBadge}">
        <span>
          ${cityCount}
        </span>
      </div>`
          : ""
      }
    </div>
  `;
};

// 클러스터 클릭 핸들러 (대륙/국가 구분) - 개선된 버전
export const createClusterClickHandler = (clusterId: string, onClusterClick: (clusterId: string) => void) => {
  return (
    // biome-ignore lint/suspicious/noExplicitAny: Event handler type
    event: any,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // 클러스터 클릭 시 확장
    onClusterClick(clusterId);
  };
};

// 도시 클릭 핸들러 (일시적으로 비활성화)
export const createCityClickHandler = (_cityName: string) => {
  return (
    // biome-ignore lint/suspicious/noExplicitAny: Event handler type
    event: any,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // 도시 클릭 비활성화 - image-metadata 이동 막음
    // const q = encodeURIComponent(cityName.split(",")[0]);
    // window.location.href = `/image-metadata?city=${q}`;
  };
};
