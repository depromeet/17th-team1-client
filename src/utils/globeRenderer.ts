/**
 * 기획서에 맞는 HTML 엘리먼트 렌더러
 * - 대륙 버블: 국기 없이 텍스트만, 반투명 배경, 진한 회색 텍스트
 * - 국가 버블: 국기 + 텍스트 + 도시 개수 원형 배지, 반투명 배경, 흰색 텍스트, 우측 버튼
 * - 도시 버블: 국기 + 도시명, 반투명 배경
 */

// 우측 액션 버튼 SVG (8도 회전)
const PLUS_BUTTON_SVG = `<svg width="37" height="44" viewBox="0 0 37 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6.84742" y="0.564721" width="29" height="39" rx="3.5" transform="rotate(8 6.84742 0.564721)" fill="#112036"/>
  <rect x="6.84742" y="0.564721" width="29" height="39" rx="3.5" transform="rotate(8 6.84742 0.564721)" stroke="url(#paint0_linear_269_4694)"/>
  <path d="M17.2129 26.6421L17.758 22.7633L13.8796 22.2182C13.4694 22.1605 13.1836 21.7813 13.2413 21.3711C13.299 20.961 13.6782 20.6752 14.0884 20.7328L17.9668 21.2779L18.5118 17.3995C18.5695 16.9893 18.9488 16.7036 19.3589 16.7612C19.7691 16.8188 20.0549 17.1981 19.9972 17.6082L19.4522 21.4866L23.331 22.0318C23.7411 22.0895 24.0269 22.4688 23.9693 22.8788C23.9117 23.289 23.5324 23.5747 23.1223 23.5172L19.2434 22.972L18.6983 26.8509C18.6405 27.261 18.2613 27.5469 17.8512 27.4892C17.4411 27.4315 17.1553 27.0522 17.2129 26.6421Z" fill="#4A5E6D"/>
  <defs>
    <linearGradient id="paint0_linear_269_4694" x1="21.4219" y1="0" x2="21.4219" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#B3DAFF"/>
      <stop offset="1" stop-color="#3C79B3"/>
    </linearGradient>
  </defs>
</svg>`;

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
    <!-- 우측 액션 버튼 -->
    <div style="${styles.actionButton}">
      ${PLUS_BUTTON_SVG}
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
