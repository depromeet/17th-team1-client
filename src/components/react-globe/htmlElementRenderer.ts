// 라벨 위치 계산 함수 (클릭 기반 시스템용)
export const calculateLabelPosition = (
  d: any,
  htmlElements: any[],
  _zoomLevel: number, // 사용하지 않음
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
  _globeRef: React.RefObject<any>, // 사용하지 않음
) => {
  // 단순히 고정 거리 반환
  return dynamicDistance;
};

// 개별 도시 HTML 생성
export const createCityHTML = (styles: any, displayFlag: string, cityName: string) => {
  return `
    <!-- 중심 dot -->
    <div style="${styles.dot}"></div>
    <!-- 점선 -->
    <div style="${styles.horizontalLine}"></div>
    <div style="${styles.label}
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(148,203,255,0.2);
      border-radius: 50px;
      padding: 8px 12px;
      backdrop-filter: blur(8px);
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      position: relative;
      pointer-events: auto;
      width: max-content;
    ">
      <!-- 좌측 국기 이모지 -->
      <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${displayFlag}</span>
      <!-- 도시명 -->
      <span style="
        color: #ffffff;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 15px;
        font-weight: 500;
        line-height: 19px;
        white-space: nowrap;
      ">
        ${cityName}
      </span>
    </div>
  `;
};


// 국가 클러스터 HTML 생성 (클릭 기반 시스템용)
export const createCountryClusterHTML = (
  styles: any,
  countryName: string,
  cityCount: number,
  flagEmoji: string,
  isExpanded: boolean = false,
) => {
  return `
    <!-- 중심 dot -->
    <div style="${styles.dot}"></div>
    <!-- 단색 수평선 -->
    <div style="${styles.horizontalLine}"></div>
    <div style="${styles.label}
      background: rgba(255, 255, 255, ${isExpanded ? '0.3' : '0.2'});
      border: 1px solid rgba(148,203,255,${isExpanded ? '0.4' : '0.2'});
      border-radius: 50px;
      padding: 8px 12px;
      backdrop-filter: blur(8px);
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      position: relative;
      pointer-events: auto;
      width: max-content;
      cursor: pointer;
      transition: all 0.2s ease;
    ">
      <!-- 좌측 국기 이모지 -->
      <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${flagEmoji}</span>
      <!-- 국가명 -->
      <span style="
        color: #ffffff;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 15px;
        font-weight: 500;
        line-height: 19px;
        white-space: nowrap;
      ">
        ${countryName}
      </span>
      <!-- 도시 개수 뱃지 -->
      ${
        cityCount > 1
          ? `
        <div style="
          background: rgba(89, 190, 229, ${isExpanded ? '0.7' : '0.5'});
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          <span style="
            color: #ffffff;
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 12px;
            font-weight: 500;
            line-height: 15px;
            text-align: center;
          ">
            ${cityCount}
          </span>
        </div>
      `
          : ""
      }
      <!-- 확장 상태 표시 -->
      ${
        isExpanded
          ? `
        <div style="
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 6px solid #ffffff;
          margin-left: 2px;
        "></div>
      `
          : ""
      }
    </div>
  `;
};

// 클릭 기반 시스템용 클릭 핸들러
export const createCountryClusterClickHandler = (
  countryId: string,
  onCountryClick: (countryId: string) => void,
) => {
  return (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    // 국가 클릭 시 확장/축소 토글
    onCountryClick(countryId);
  };
};

// 도시 클릭 핸들러 (기존 로직 유지)
export const createCityClickHandler = (cityName: string) => {
  return (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    // 개별 도시 클릭 시 image-metadata로 이동
    const q = encodeURIComponent(cityName.split(",")[0]);
    window.location.href = `/image-metadata?city=${q}`;
  };
};

