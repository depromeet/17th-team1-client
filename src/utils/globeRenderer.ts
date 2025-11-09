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

// 텍스트 너비 계산 함수 (한글/영문 구분)
const calculateTextWidth = (text: string, fontSize: number = 14): number => {
  let totalWidth = 0;

  const koreanCharRegex = /[\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]/;
  const koreanWidth = fontSize * 0.8; // 한글은 fontSize의 80%
  const asciiWidth = fontSize * 0.55; // 영문/숫자는 fontSize의 55%

  for (const char of text) {
    if (koreanCharRegex.test(char)) {
      totalWidth += koreanWidth;
    } else {
      totalWidth += asciiWidth;
    }
  }
  return totalWidth;
};

// 라벨 전체 너비 계산 (국기 + 텍스트 + 배지 + 패딩)
const calculateLabelWidth = (countryName: string, cityCount: number): number => {
  const flagWidth = 14; // 국기 이모지 너비
  const textWidth = calculateTextWidth(countryName, 14);
  const badgeWidth = cityCount >= 1 ? 22 : 0; // 배지 최소 너비
  const gaps = 5 * 2; // gap 5px * 2
  const padding = 12; // 좌측 패딩만 (우측 패딩 제외)

  return flagWidth + textWidth + badgeWidth + gaps + padding;
};

// 텍스트 너비 계산 함수 (도시 라벨용)
const calculateCityLabelWidth = (cityName: string): number => {
  const flagWidth = 14; // 국기 이모지 너비
  const textWidth = calculateTextWidth(cityName, 14);
  const gaps = 5; // gap 5px
  const padding = 12;

  return flagWidth + textWidth + gaps + padding;
};

// 기획서에 맞는 개별 도시 HTML 생성
export const createCityHTML = (
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic styles object
  styles: any,
  displayFlag: string,
  cityName: string,
  hasRecords: boolean = true,
  thumbnailUrl?: string,
  isMyGlobe: boolean = true,
  isFirstGlobe: boolean = false,
) => {
  const labelWidth = calculateCityLabelWidth(cityName);

  // 기록이 없는 경우
  if (!hasRecords) {
    // 타인의 지구본이거나 최초 지구본인 경우: + 버튼 표시하지 않음
    if (!isMyGlobe || isFirstGlobe) {
      // 타인의 지구본이고 기록이 없는 경우 cursor를 default로 설정
      const cursorStyle = !isMyGlobe && !hasRecords ? "cursor: default;" : "";

      return `
        <!-- 중심 dot -->
        <div style="${styles.dot}"></div>
        <!-- 점선 -->
        <div style="${styles.horizontalLine}"></div>
        <div style="${styles.label} ${cursorStyle}">
          <!-- 좌측 국기 이모지 -->
          <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${displayFlag}</span>
          <!-- 도시명 -->
          <span>
            ${cityName}
          </span>
        </div>
      `;
    }

    // 나의 지구본인 경우: + 버튼 표시
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
      <!-- 우측 액션 버튼 (+ 아이콘) -->
      <div style="${styles.actionButton(labelWidth / 2)}">
        ${PLUS_BUTTON_SVG}
      </div>
    `;
  }

  // 기록이 있는 경우: 썸네일 이미지 표시
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
    <!-- 우측 썸네일 이미지 카드 -->
    ${
      thumbnailUrl
        ? `<div style="${styles.thumbnailCard(labelWidth / 2)}">
      <img 
        src="${thumbnailUrl}" 
        alt="${cityName} 여행 기록 썸네일" 
        style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;"
        onerror="this.style.display='none'" 
      />
    </div>`
        : ""
    }
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
  hasRecords: boolean = true,
  thumbnailUrl?: string,
  isMyGlobe: boolean = true,
  isFirstGlobe: boolean = false,
) => {
  // 라벨 너비 계산하여 썸네일 위치 동적 조정
  const labelWidth = calculateLabelWidth(countryName, cityCount);

  // 모든 도시 미기록 시
  if (!hasRecords) {
    // 타인의 지구본이거나 최초 지구본인 경우: + 버튼 표시하지 않음
    if (!isMyGlobe || isFirstGlobe) {
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
    }

    // 나의 지구본인 경우: + 버튼 표시
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
      <!-- 우측 액션 버튼 (+ 아이콘) -->
      <div style="${styles.actionButton(labelWidth / 2)}">
        ${PLUS_BUTTON_SVG}
      </div>
    `;
  }

  // 해당 국가 내 1개 이상의 도시 기록 시: 카드형 마커 (썸네일 이미지 포함)
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
    <!-- 우측 썸네일 이미지 카드 -->
    ${
      thumbnailUrl
        ? `<div style="${styles.thumbnailCard(labelWidth / 2)}">
      <img src="${thumbnailUrl}" alt="${countryName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
    </div>`
        : ""
    }
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

// 도시 클릭 핸들러
export const createCityClickHandler = (
  cityName: string,
  cityId?: number,
  hasRecords: boolean = true,
  onNavigate?: (path: string) => void,
  disableCityClick?: boolean,
  uuid?: string,
) => {
  return (
    // biome-ignore lint/suspicious/noExplicitAny: Event handler type
    event: any,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // 클릭 비활성화된 경우 아무 동작 안함
    if (disableCityClick) {
      return;
    }

    // cityName 형식: "도시명, 국가명" 또는 "도시명"
    const parts = cityName.split(",").map((s) => s.trim());
    const cityNameOnly = parts[0];
    const countryName = parts[1] || "";

    const cityQuery = encodeURIComponent(cityNameOnly);
    const countryQuery = encodeURIComponent(countryName);

    let path: string;
    if (hasRecords && cityId) {
      console.log("uuid", uuid);
      // 기록이 있는 경우: 상세 기록 뷰(엔드)로 이동
      path = uuid ? `/record/${cityId}?uuid=${uuid}` : `/record/${cityId}`;
    } else {
      // 기록이 없는 경우: 기록하기(에디터) 페이지로 이동
      path = `/image-metadata?cityId=${cityId}&city=${cityQuery}&country=${countryQuery}`;
    }

    if (onNavigate) {
      // onNavigate 콜백이 제공된 경우: Next.js router 사용
      onNavigate(path);
    } else {
      // 폴백: window.location.href (레거시 지원)
      window.location.href = path;
    }
  };
};
