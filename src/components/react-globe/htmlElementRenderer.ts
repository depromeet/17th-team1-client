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
    <div style="${styles.connectorLine}">
      <svg xmlns="http://www.w3.org/2000/svg" width="27" height="21" viewBox="0 0 27 21" fill="none">
        <path d="M14.0911 1V0.589219H13.864L13.7432 0.78156L14.0911 1ZM0.80917 18.6636C0.80917 19.8735 1.79004 20.8544 3 20.8544C4.20996 20.8544 5.19083 19.8735 5.19083 18.6636C5.19083 17.4536 4.20996 16.4727 3 16.4727C1.79004 16.4727 0.80917 17.4536 0.80917 18.6636ZM3 18.6636L3.34789 18.882L3.81001 18.146L3.46213 17.9276L3.11424 17.7091L2.65211 18.4451L3 18.6636ZM4.38638 16.4556L4.73427 16.6741L5.65853 15.2021L5.31064 14.9837L4.96276 14.7652L4.0385 16.2372L4.38638 16.4556ZM6.2349 13.5117L6.58278 13.7301L7.50704 12.2582L7.15915 12.0397L6.81127 11.8213L5.88701 13.2933L6.2349 13.5117ZM8.08341 10.5678L8.4313 10.7862L9.35555 9.31424L9.00767 9.0958L8.65978 8.87736L7.73552 10.3493L8.08341 10.5678ZM9.93192 7.62384L10.2798 7.84228L11.2041 6.37031L10.8562 6.15187L10.5083 5.93343L9.58404 7.4054L9.93192 7.62384ZM11.7804 4.67991L12.1283 4.89835L13.0526 3.42639L12.7047 3.20795L12.3568 2.98951L11.4326 4.46147L11.7804 4.67991ZM13.6289 1.73598L13.9768 1.95442L14.439 1.21844L14.0911 1L13.7432 0.78156L13.2811 1.51754L13.6289 1.73598ZM14.0911 1V1.41078H14.887V1V0.589219H14.0911V1ZM16.4787 1V1.41078H18.0705V1V0.589219H16.4787V1ZM19.6623 1V1.41078H21.2541V1V0.589219H19.6623V1ZM22.8458 1V1.41078H24.4376V1V0.589219H22.8458V1ZM26.0294 1V1.41078H26.8253V1V0.589219H26.0294V1Z" fill="url(#paint0_linear_35_12720)"/>
        <defs>
          <linearGradient id="paint0_linear_35_12720" x1="-1.10781" y1="21.539" x2="35.0409" y2="1" gradientUnits="userSpaceOnUse">
            <stop stop-color="white"/>
            <stop offset="1" stop-color="#999999"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
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
    <div style="${styles.connectorLine}">
      <svg xmlns="http://www.w3.org/2000/svg" width="27" height="21" viewBox="0 0 27 21" fill="none">
        <path d="M14.0911 1V0.589219H13.864L13.7432 0.78156L14.0911 1ZM0.80917 18.6636C0.80917 19.8735 1.79004 20.8544 3 20.8544C4.20996 20.8544 5.19083 19.8735 5.19083 18.6636C5.19083 17.4536 4.20996 16.4727 3 16.4727C1.79004 16.4727 0.80917 17.4536 0.80917 18.6636ZM3 18.6636L3.34789 18.882L3.81001 18.146L3.46213 17.9276L3.11424 17.7091L2.65211 18.4451L3 18.6636ZM4.38638 16.4556L4.73427 16.6741L5.65853 15.2021L5.31064 14.9837L4.96276 14.7652L4.0385 16.2372L4.38638 16.4556ZM6.2349 13.5117L6.58278 13.7301L7.50704 12.2582L7.15915 12.0397L6.81127 11.8213L5.88701 13.2933L6.2349 13.5117ZM8.08341 10.5678L8.4313 10.7862L9.35555 9.31424L9.00767 9.0958L8.65978 8.87736L7.73552 10.3493L8.08341 10.5678ZM9.93192 7.62384L10.2798 7.84228L11.2041 6.37031L10.8562 6.15187L10.5083 5.93343L9.58404 7.4054L9.93192 7.62384ZM11.7804 4.67991L12.1283 4.89835L13.0526 3.42639L12.7047 3.20795L12.3568 2.98951L11.4326 4.46147L11.7804 4.67991ZM13.6289 1.73598L13.9768 1.95442L14.439 1.21844L14.0911 1L13.7432 0.78156L13.2811 1.51754L13.6289 1.73598ZM14.0911 1V1.41078H14.887V1V0.589219H14.0911V1ZM16.4787 1V1.41078H18.0705V1V0.589219H16.4787V1ZM19.6623 1V1.41078H21.2541V1V0.589219H19.6623V1ZM22.8458 1V1.41078H24.4376V1V0.589219H22.8458V1ZM26.0294 1V1.41078H26.8253V1V0.589219H26.0294V1Z" fill="url(#paint0_linear_35_12720)"/>
        <defs>
          <linearGradient id="paint0_linear_35_12720" x1="-1.10781" y1="21.539" x2="35.0409" y2="1" gradientUnits="userSpaceOnUse">
            <stop stop-color="white"/>
            <stop offset="1" stop-color="#999999"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
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

