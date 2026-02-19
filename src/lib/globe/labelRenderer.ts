/**
 * @file labelRenderer.ts
 * @description Globe 라벨 HTML 엘리먼트 렌더링 및 위치 계산
 * @responsibility 클러스터 라벨 HTML 생성, 라벨 위치 계산
 */

import type { GlobeInstance } from "globe.gl";
import type React from "react";
import type { ClusterData } from "@/types/clustering";
import type { createContinentClusterStyles, createCountryClusterStyles, createSingleLabelStyles } from "./labelStyles";
import { calculateCityLabelWidth, calculateCountryLabelWidth } from "./calculations";
import { escapeHtml } from "@/utils/htmlEscape";

export type CityStyles = ReturnType<typeof createSingleLabelStyles>;
export type ContinentClusterStyles = ReturnType<typeof createContinentClusterStyles>;
export type CountryClusterStyles = ReturnType<typeof createCountryClusterStyles>;

// ============================================
// SVG 아이콘 상수
// ============================================

/**
 * 우측 액션 버튼 SVG - 국가 클러스터용 (그라디언트 border)
 */
const PLUS_BUTTON_SVG_COUNTRY = `<svg width="37" height="44" viewBox="0 0 37 44" fill="none" xmlns="http://www.w3.org/2000/svg">
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

/**
 * 우측 액션 버튼 SVG - 도시 클러스터용 (white border)
 */
const PLUS_BUTTON_SVG_CITY = `<svg width="37" height="44" viewBox="0 0 37 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6.84742" y="0.564721" width="29" height="39" rx="3.5" transform="rotate(8 6.84742 0.564721)" fill="#112036"/>
  <rect x="6.84742" y="0.564721" width="29" height="39" rx="3.5" transform="rotate(8 6.84742 0.564721)" stroke="white"/>
  <path d="M17.2129 26.6421L17.758 22.7633L13.8796 22.2182C13.4694 22.1605 13.1836 21.7813 13.2413 21.3711C13.299 20.961 13.6782 20.6752 14.0884 20.7328L17.9668 21.2779L18.5118 17.3995C18.5695 16.9893 18.9488 16.7036 19.3589 16.7612C19.7691 16.8188 20.0549 17.1981 19.9972 17.6082L19.4522 21.4866L23.331 22.0318C23.7411 22.0895 24.0269 22.4688 23.9693 22.8788C23.9117 23.289 23.5324 23.5747 23.1223 23.5172L19.2434 22.972L18.6983 26.8509C18.6405 27.261 18.2613 27.5469 17.8512 27.4892C17.4411 27.4315 17.1553 27.0522 17.2129 26.6421Z" fill="#4A5E6D"/>
</svg>`;

// ============================================
// 위치 계산 함수
// ============================================

/**
 * 라벨 위치 계산 (클릭 기반 시스템용)
 * @param d - 클러스터 데이터
 * @param htmlElements - 전체 HTML 엘리먼트 배열
 * @param _zoomLevel - 줌 레벨 (현재 미사용)
 * @param _globeRef - Globe 인스턴스 참조 (현재 미사용)
 * @returns 각도 오프셋 및 거리
 * @responsibility 클러스터 라벨의 표시 위치 결정
 *
 * @description
 * - ID 기반으로 왼쪽/오른쪽 결정 (인덱스가 홀수면 왼쪽)
 * - 고정 거리 사용 (100px)
 */
export const calculateLabelPosition = (
  d: ClusterData,
  htmlElements: ClusterData[],
  _zoomLevel: number,
  _globeRef: React.RefObject<GlobeInstance | null>
) => {
  const labelIndex = htmlElements.findIndex(({ id }) => id === d.id);
  const isLeftSide = labelIndex % 2 === 1;
  const angleOffset = isLeftSide ? 180 : 0;
  const fixedDistance = 100;

  return { angleOffset, dynamicDistance: fixedDistance };
};

/**
 * 화면 경계 제한 계산 (단순화)
 * @param dynamicDistance - 동적 거리
 * @param _angleOffset - 각도 오프셋 (현재 미사용)
 * @param _currentPos - 현재 위치 (현재 미사용)
 * @param _isCityLevel - 도시 레벨 여부 (현재 미사용)
 * @param _globeRef - Globe 인스턴스 참조 (현재 미사용)
 * @returns 제한된 거리
 * @responsibility 라벨이 화면 밖으로 나가지 않도록 거리 제한
 *
 * @description
 * 현재는 단순히 고정 거리 반환
 * 필요시 화면 경계 검사 로직 추가 가능
 */
export const calculateClampedDistance = (
  dynamicDistance: number,
  _angleOffset: number,
  _currentPos: { x: number; y: number },
  _isCityLevel: boolean,
  _globeRef: React.RefObject<GlobeInstance | null>
) => {
  return dynamicDistance;
};

// ============================================
// HTML 생성 함수
// ============================================

/**
 * 개별 도시 HTML 생성
 * @param styles - 도시 스타일
 * @param displayFlag - 표시할 국기 이모지
 * @param cityName - 도시명
 * @param hasRecords - 기록 존재 여부
 * @param thumbnailUrl - 썸네일 URL (선택)
 * @param isMyGlobe - 나의 지구본 여부
 * @param isFirstGlobe - 최초 지구본 여부
 * @returns 도시 HTML 문자열
 * @responsibility 개별 도시 마커 HTML 생성
 *
 * @description
 * - 기록 없음 + 타인의 지구본/최초 지구본: + 버튼 없음
 * - 기록 없음 + 나의 지구본: + 버튼 표시
 * - 기록 있음: 썸네일 이미지 표시
 */
export const createCityHTML = (
  styles: CityStyles,
  displayFlag: string,
  cityName: string,
  hasRecords: boolean = true,
  thumbnailUrl?: string,
  isMyGlobe: boolean = true,
  isFirstGlobe: boolean = false
) => {
  const { dot, horizontalLine, label, actionButton, thumbnailCard } = styles;

  const labelWidth = calculateCityLabelWidth(cityName);
  const safeFlag = escapeHtml(displayFlag);
  const safeCityName = escapeHtml(cityName);

  // 기록이 없는 경우
  if (!hasRecords) {
    // 타인의 지구본이거나 최초 지구본인 경우: + 버튼 표시하지 않음
    if (!isMyGlobe || isFirstGlobe) {
      const cursorStyle = !isMyGlobe && !hasRecords ? "cursor: default;" : "";

      return `
        <!-- 중심 dot -->
        <div style="${dot}"></div>
        <!-- 점선 -->
        <div style="${horizontalLine}"></div>
        <div style="${label} ${cursorStyle}">
          <!-- 좌측 국기 이모지 -->
          <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${safeFlag}</span>
          <!-- 도시명 -->
          <span>
            ${safeCityName}
          </span>
        </div>
      `;
    }

    // 나의 지구본인 경우: + 버튼 표시
    return `
      <!-- 중심 dot -->
      <div style="${dot}"></div>
      <!-- 점선 -->
      <div style="${horizontalLine}"></div>
      <div style="${label}">
        <!-- 좌측 국기 이모지 -->
        <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${safeFlag}</span>
        <!-- 도시명 -->
        <span>
          ${safeCityName}
        </span>
      </div>
      <!-- 우측 액션 버튼 (+ 아이콘) -->
      <div style="${actionButton(labelWidth / 2)}">
        ${PLUS_BUTTON_SVG_CITY}
      </div>
    `;
  }

  // 기록이 있는 경우: 썸네일 이미지 표시
  return `
    <!-- 중심 dot -->
    <div style="${dot}"></div>
    <!-- 점선 -->
    <div style="${horizontalLine}"></div>
    <div style="${label}">
      <!-- 좌측 국기 이모지 -->
      <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${safeFlag}</span>
      <!-- 도시명 -->
      <span>
        ${safeCityName}
      </span>
    </div>
    <!-- 우측 썸네일 이미지 카드 -->
    ${
      thumbnailUrl
        ? `<div style="${thumbnailCard(labelWidth / 2)}">
      <img
        src="${escapeHtml(thumbnailUrl)}"
        alt="${safeCityName} 여행 기록 썸네일"
        style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;"
        onerror="this.style.display='none'"
      />
    </div>`
        : ""
    }
  `;
};

/**
 * 대륙 클러스터 HTML 생성
 * @param styles - 대륙 클러스터 스타일
 * @param continentName - 대륙명
 * @param _countryCount - 국가 개수 (현재 미사용)
 * @param _flagEmoji - 국기 이모지 (현재 미사용)
 * @returns 대륙 클러스터 HTML 문자열
 * @responsibility 대륙 클러스터 HTML 생성
 *
 * @description
 * - 국기 표시 안함 (텍스트만)
 * - 그라디언트 border 적용
 */
export const createContinentClusterHTML = (
  styles: ContinentClusterStyles,
  continentName: string,
  _countryCount: number,
  _flagEmoji: string
) => {
  const { labelWrapper, label } = styles;
  const safeContinentName = escapeHtml(continentName);

  return `
    <!-- 외부 wrapper - 그라디언트 border -->
    <div style="${labelWrapper}">
      <!-- 내부 label - 실제 콘텐츠 -->
      <div style="${label}">
        <!-- 대륙명만 표시 (국기 없음) -->
        <span>
          ${safeContinentName}
        </span>
      </div>
    </div>
  `;
};

/**
 * 국가 클러스터 HTML 생성
 * @param styles - 국가 클러스터 스타일
 * @param countryName - 국가명
 * @param cityCount - 도시 개수
 * @param flagEmoji - 국기 이모지
 * @param _isExpanded - 확장 여부 (현재 미사용)
 * @param hasRecords - 기록 존재 여부
 * @param thumbnailUrl - 썸네일 URL (선택)
 * @param isMyGlobe - 나의 지구본 여부
 * @param isFirstGlobe - 최초 지구본 여부
 * @returns 국가 클러스터 HTML 문자열
 * @responsibility 국가 클러스터 HTML 생성
 *
 * @description
 * - 기록 없음 + 타인의 지구본/최초 지구본: + 버튼 없음
 * - 기록 없음 + 나의 지구본: + 버튼 표시
 * - 기록 있음: 썸네일 이미지 표시
 * - 도시 개수 배지는 1개 이상일 때만 표시
 */
export const createCountryClusterHTML = (
  styles: CountryClusterStyles,
  countryName: string,
  cityCount: number,
  flagEmoji: string,
  _isExpanded: boolean = false,
  hasRecords: boolean = true,
  thumbnailUrl?: string,
  isMyGlobe: boolean = true,
  isFirstGlobe: boolean = false
) => {
  const { dot, horizontalLine, label, countBadge, actionButton, thumbnailCard } = styles;

  const labelWidth = calculateCountryLabelWidth(countryName, cityCount);
  const safeFlag = escapeHtml(flagEmoji);
  const safeCountryName = escapeHtml(countryName);

  // 모든 도시 미기록 시
  if (!hasRecords) {
    // 타인의 지구본이거나 최초 지구본인 경우: + 버튼 표시하지 않음
    if (!isMyGlobe || isFirstGlobe) {
      return `
        <!-- 중심 dot -->
        <div style="${dot}"></div>
        <!-- 단색 수평선 -->
        <div style="${horizontalLine}"></div>
        <div style="${label}">
          <!-- 좌측 국기 이모지 -->
          <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${safeFlag}</span>
          <!-- 국가명 -->
          <span>
            ${safeCountryName}
          </span>
          <!-- 도시 개수 원형 배지 (복수개일 경우만) -->
          ${
            cityCount >= 1
              ? `<div style="${countBadge}">
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
      <div style="${dot}"></div>
      <!-- 단색 수평선 -->
      <div style="${horizontalLine}"></div>
      <div style="${label}">
        <!-- 좌측 국기 이모지 -->
        <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${safeFlag}</span>
        <!-- 국가명 -->
        <span>
          ${safeCountryName}
        </span>
        <!-- 도시 개수 원형 배지 (복수개일 경우만) -->
        ${
          cityCount >= 1
            ? `<div style="${countBadge}">
          <span>
            ${cityCount}
          </span>
        </div>`
            : ""
        }
      </div>
      <!-- 우측 액션 버튼 (+ 아이콘) -->
      <div style="${actionButton(labelWidth / 2)}">
        ${PLUS_BUTTON_SVG_COUNTRY}
      </div>
    `;
  }

  // 해당 국가 내 1개 이상의 도시 기록 시: 카드형 마커 (썸네일 이미지 포함)
  return `
    <!-- 중심 dot -->
    <div style="${dot}"></div>
    <!-- 단색 수평선 -->
    <div style="${horizontalLine}"></div>
    <div style="${label}">
      <!-- 좌측 국기 이모지 -->
      <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${safeFlag}</span>
      <!-- 국가명 -->
      <span>
        ${safeCountryName}
      </span>
      <!-- 도시 개수 원형 배지 (복수개일 경우만) -->
      ${
        cityCount >= 1
          ? `<div style="${countBadge}">
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
        ? `<div style="${thumbnailCard(labelWidth / 2)}">
      <img src="${escapeHtml(thumbnailUrl)}" alt="${safeCountryName} 여행 기록 썸네일" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
    </div>`
        : ""
    }
  `;
};
