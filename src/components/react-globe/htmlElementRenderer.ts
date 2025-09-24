import { ANIMATION_DURATION, GLOBE_CONFIG } from "@/constants/globe";
import { createClusterLabelStyles } from "@/styles/globeStyles";
import * as THREE from "three";

interface RenderElementParams {
  d: any;
  htmlElements: any[];
  zoomLevel: number;
  globeRef: React.RefObject<any>;
  displayPhase: "root" | "country" | "city";
  isAnimating: boolean;
  phaseTargetRef: React.MutableRefObject<"root" | "country" | "city" | null>;
  setActiveCountryFlag: (flag: string | null) => void;
  activeCountryFlagRef: React.MutableRefObject<string | null>;
  setActiveCountryItemIdList: (ids: string[] | null) => void;
  setDisplayPhase: (phase: "root" | "country" | "city") => void;
  setIsAnimating: (animating: boolean) => void;
  onClusterSelect?: (cluster: any) => void;
  onZoomChange: (zoom: number) => void;
  onCountrySelect: (countryId: string | null) => void;
}

// 화면 좌표 계산 함수
export const calculateScreenPosition = (lat: number, lng: number, globeRef: React.RefObject<any>) => {
  if (!globeRef.current) return { x: 0, y: 0 };

  // Globe 내부 Three.js 카메라 정보 접근
  const globe = globeRef.current;
  const camera = globe.camera();
  const renderer = globe.renderer();

  // 위도/경도를 3D 좌표로 변환
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const radius = 100; // Globe 반지름

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  // 3D 좌표를 화면 좌표로 투영
  const vector = new THREE.Vector3(x, y, z);
  vector.project(camera);

  const screenX = (vector.x * renderer.domElement.width) / 2 + renderer.domElement.width / 2;
  const screenY = -(vector.y * renderer.domElement.height) / 2 + renderer.domElement.height / 2;

  return { x: screenX, y: screenY };
};

// 라벨 위치 계산 함수 (간단한 왼쪽/오른쪽 고정)
export const calculateLabelPosition = (
  d: any,
  htmlElements: any[],
  _zoomLevel: number, // 사용하지 않음
  globeRef: React.RefObject<any>,
) => {
  const currentPos = calculateScreenPosition(d.lat, d.lng, globeRef);

  // 단순히 ID를 기반으로 왼쪽/오른쪽 결정 (줌 레벨 무관)
  const labelIndex = htmlElements.findIndex((item) => item.id === d.id);
  const isLeftSide = labelIndex % 2 === 1;
  const angleOffset = isLeftSide ? 180 : 0; // 왼쪽(180°) 또는 오른쪽(0°)

  // 고정 거리 사용 (줌 레벨 무관)
  const fixedDistance = 100;

  return { angleOffset, dynamicDistance: fixedDistance, currentPos, isCityLevel: d.count === 1 };
};

// 화면 경계 제한 계산 (단순화)
export const calculateClampedDistance = (
  dynamicDistance: number,
  angleOffset: number,
  currentPos: { x: number; y: number },
  isCityLevel: boolean,
  globeRef: React.RefObject<any>,
) => {
  // 단순히 고정 거리 반환 (화면 경계 계산 제거)
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

// 대륙 클러스터 HTML 생성
export const createContinentHTML = (d: any, styles: any) => {
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
      border-radius: 50px;
      padding: 12px 16px;
      backdrop-filter: blur(8px);
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: max-content;
      pointer-events: auto;
    ">
      <span style="
        color: #ffffff;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 16px;
        font-weight: 500;
        line-height: 20px;
        white-space: nowrap;
      ">
        ${d.name}
      </span>
    </div>
  `;
};

// 국가 클러스터 HTML 생성
export const createCountryHTML = (
  styles: any,
  countryName: string,
  countNumber: string | null,
  flagEmoji: string,
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
      <!-- 숫자 뱃지 (겹쳐진 도시가 있을 때만 표시) -->
      ${
        countNumber
          ? `
        <div style="
          background: rgba(89, 190, 229, 0.5);
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
            ${countNumber}
          </span>
        </div>
      `
          : ""
      }
    </div>
  `;
};

// 클릭 핸들러 생성
export const createClickHandler = (params: RenderElementParams) => {
  const {
    d,
    globeRef,
    setActiveCountryFlag,
    activeCountryFlagRef,
    setActiveCountryItemIdList,
    setDisplayPhase,
    setIsAnimating,
    onClusterSelect,
    phaseTargetRef,
    onZoomChange,
    onCountrySelect,
  } = params;

  return (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (!globeRef.current) return;

    // 클러스터 타입으로 개별 도시인지 판단
    if (d.clusterType === "individual_city") {
      // 개별 도시 클러스터 클릭 시 - 바로 image-metadata로 이동
      const cityName = d.items && d.items[0]?.name ? d.items[0].name.split(",")[0] : d.name.split(",")[0];
      if (cityName) {
        const q = encodeURIComponent(cityName);
        window.location.href = `/image-metadata?city=${q}`;
        return;
      }
    }

    const targetLat = d.lat;
    const targetLng = d.lng;

    if (d.count > 1 && d.items && d.items.length > 1) {
      // 클러스터 클릭 시
      const uniqueFlags = new Set((d.items || []).map((it: any) => it.flag));
      const isMultiCountry = uniqueFlags.size > 1;

      // 상태 업데이트를 먼저 실행
      if (isMultiCountry) {
        setActiveCountryFlag(null);
        activeCountryFlagRef.current = null;
        setActiveCountryItemIdList(null);
        setDisplayPhase("country");
      } else if (d.flag) {
        setActiveCountryFlag(d.flag);
        activeCountryFlagRef.current = d.flag;
        const ids = (d.items || []).map((it: any) => it.id);
        setActiveCountryItemIdList(ids);
        setDisplayPhase("city");
      }

      // 클러스터 선택 콜백 호출
      if (onClusterSelect) {
        onClusterSelect(d);
      }

      // 타겟 줌 레벨 및 목표 phase 결정
      const targetAltitude = isMultiCountry ? GLOBE_CONFIG.CLUSTER_ZOOM_STAGE1 : GLOBE_CONFIG.CLUSTER_ZOOM;
      phaseTargetRef.current = isMultiCountry ? "country" : "city";

      // 애니메이션 중에는 기존 phase 유지 → 깜빡임 방지
      setIsAnimating(true);
      globeRef.current.pointOfView(
        {
          lat: targetLat,
          lng: targetLng,
          altitude: targetAltitude,
        },
        ANIMATION_DURATION.CAMERA_MOVE,
      );
      setTimeout(() => {
        setIsAnimating(false);
        if (phaseTargetRef.current) {
          setDisplayPhase(phaseTargetRef.current);
        }
        phaseTargetRef.current = null;
        onZoomChange(targetAltitude);
      }, ANIMATION_DURATION.CAMERA_MOVE + 30);
    } else {
      // 기존 로직 (개별 나라 클릭 시)
      if (d.flag) {
        setActiveCountryFlag(d.flag);
        activeCountryFlagRef.current = d.flag;
        if (d.items && d.items.length === 1) {
          setActiveCountryItemIdList([d.items[0].id]);
        }
      }

      // 부드러운 카메라 이동: 목표 phase/zoom을 애니 종료 시 반영
      phaseTargetRef.current = "city";
      globeRef.current.pointOfView(
        {
          lat: targetLat,
          lng: targetLng,
          altitude: GLOBE_CONFIG.FOCUS_ZOOM,
        },
        ANIMATION_DURATION.CAMERA_MOVE,
      );
      setTimeout(() => {
        setDisplayPhase("city");
        phaseTargetRef.current = null;
        onZoomChange(GLOBE_CONFIG.FOCUS_ZOOM);
      }, ANIMATION_DURATION.CAMERA_MOVE + 30);

      // 나라 선택
      const countryId = d.items && d.items.length === 1 ? d.items[0].id : d.id;
      onCountrySelect(countryId);
    }
  };
};

// 메인 HTML 요소 렌더링 함수
export const renderHtmlElement = (params: RenderElementParams): HTMLElement => {
  const { d, htmlElements, zoomLevel, globeRef } = params;

  if (typeof window === "undefined" || !document) {
    // SSR 환경에서는 빈 div 반환
    const el = document.createElement("div");
    el.style.display = "none";
    return el;
  }

  const el = document.createElement("div");
  // ensure positioned container so absolute children (+ button) place correctly
  el.style.position = "relative";
  el.style.zIndex = "999";
  el.style.pointerEvents = "auto";
  // anchor the origin exactly at the geo point regardless of zoom
  el.style.width = "0px";
  el.style.height = "0px";
  el.style.overflow = "visible";
  el.style.margin = "0";
  el.style.padding = "0";
  el.style.position = "relative";
  el.style.pointerEvents = "auto";

  const labelIndex = htmlElements.findIndex((item) => item.id === d.id);
  const { angleOffset, dynamicDistance, currentPos, isCityLevel } = calculateLabelPosition(
    d,
    htmlElements,
    zoomLevel,
    globeRef,
  );

  const clampedDistance = calculateClampedDistance(
    dynamicDistance,
    angleOffset,
    currentPos,
    isCityLevel,
    globeRef,
  );

  if (d.clusterType === "individual_city") {
    const baseItem = d.items && d.items.length === 1 ? d.items[0] : d;
    const displayFlag = baseItem.flag ?? d.flag;
    const cityName = (baseItem.name ?? d.name).split(",")[0];
    const styles = createClusterLabelStyles(labelIndex, angleOffset, clampedDistance);

    el.innerHTML = createCityHTML(styles, displayFlag, cityName);
  } else {
    const styles = createClusterLabelStyles(labelIndex, angleOffset, clampedDistance);

    // 대륙 클러스터인지 국가 클러스터인지 판단 (클러스터 이름으로 구분)
    const isContinentCluster =
      d.name.includes("아시아") ||
      d.name.includes("유럽") ||
      d.name.includes("북아메리카") ||
      d.name.includes("남아메리카") ||
      d.name.includes("오세아니아") ||
      d.name.includes("아프리카") ||
      d.name.includes("개국");

    if (isContinentCluster) {
      el.innerHTML = createContinentHTML(d, styles);
    } else {
      // 국가 클러스터: 새로운 컴팩트 디자인 (개별/겹치는 국가 모두 동일)
      const nameAndCount = d.name.split(" +");
      const countryName = nameAndCount[0];
      const countNumber = nameAndCount.length > 1 ? nameAndCount[1] : null;
      const flagEmoji = d.flag || (d.items && d.items[0]?.flag) || "";

      el.innerHTML = createCountryHTML(styles, countryName, countNumber, flagEmoji);
    }
  }

  const handleClick = createClickHandler(params);

  el.addEventListener("click", handleClick);
  el.addEventListener("mousedown", handleClick);
  el.onclick = handleClick;

  return el;
};
