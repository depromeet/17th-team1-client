/**
 * 지구본 자동 fit 기능을 위한 유틸리티 함수들
 * 나라 클러스터 클릭 시 해당 국가의 모든 도시들이 화면에 fit되도록 계산
 */

import type { CountryData } from "@/types/travelPatterns";

// 두 지점 간의 거리를 계산하는 함수 (구면 거리)
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 지점들의 경계 박스를 계산하는 함수
export const calculateBoundingBox = (cities: CountryData[]) => {
  if (cities.length === 0) {
    return {
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0,
      centerLat: 0,
      centerLng: 0,
      latRange: 0,
      lngRange: 0,
    };
  }

  let minLat = cities[0].lat;
  let maxLat = cities[0].lat;
  let minLng = cities[0].lng;
  let maxLng = cities[0].lng;

  for (const city of cities) {
    minLat = Math.min(minLat, city.lat);
    maxLat = Math.max(maxLat, city.lat);
    minLng = Math.min(minLng, city.lng);
    maxLng = Math.max(maxLng, city.lng);
  }

  // 경도 경계를 넘는 경우 처리 (예: 180도 경계, 태평양 가로지르는 경우)
  const lngRange = maxLng - minLng;
  if (lngRange > 180) {
    // 경도가 180도를 넘어가는 경우 (예: 일본-미국 서부)
    // 더 짧은 경로를 찾기 위해 음수 경도를 양수로 변환
    const adjustedCities = cities.map((city) => ({
      ...city,
      adjustedLng: city.lng < 0 ? city.lng + 360 : city.lng,
    }));

    let adjustedMinLng = adjustedCities[0].adjustedLng;
    let adjustedMaxLng = adjustedCities[0].adjustedLng;

    for (const city of adjustedCities) {
      adjustedMinLng = Math.min(adjustedMinLng, city.adjustedLng);
      adjustedMaxLng = Math.max(adjustedMaxLng, city.adjustedLng);
    }

    const adjustedRange = adjustedMaxLng - adjustedMinLng;
    if (adjustedRange < lngRange) {
      // 조정된 범위가 더 짧다면 사용
      minLng = adjustedMinLng > 180 ? adjustedMinLng - 360 : adjustedMinLng;
      maxLng = adjustedMaxLng > 180 ? adjustedMaxLng - 360 : adjustedMaxLng;
    }
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const latRange = maxLat - minLat;
  const finalLngRange = Math.abs(maxLng - minLng);

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    centerLat,
    centerLng,
    latRange,
    lngRange: finalLngRange,
  };
};

// 경계 박스에 맞는 최적의 줌 레벨을 계산하는 함수
export const calculateOptimalZoom = (
  boundingBox: ReturnType<typeof calculateBoundingBox>,
  _viewportWidth: number = 512,
  _viewportHeight: number = 512,
): number => {
  const { latRange, lngRange } = boundingBox;

  if (latRange === 0 && lngRange === 0) {
    // 단일 지점인 경우 적당한 줌 레벨 반환
    return 0.15;
  }

  // 지구본의 가시 영역을 고려한 패딩 (여백 포함)
  const padding = 2;
  const effectiveLatRange = latRange * (1 + padding);
  const effectiveLngRange = lngRange * (1 + padding);

  // Globe.gl의 줌 레벨은 카메라 높이와 관련
  // 높이가 낮을수록 더 가깝게 보임
  // 범위가 클수록 더 멀리서 봐야 함

  const maxRange = Math.max(effectiveLatRange, effectiveLngRange);
  const minRange = Math.min(effectiveLatRange, effectiveLngRange);
  const rangeRatio = minRange > 0 ? maxRange / minRange : 1;

  // 줌 레벨 계산 (개선된 경험적 공식)
  let zoomLevel: number;

  if (maxRange > 80) {
    // 매우 넓은 범위 (여러 대륙)
    zoomLevel = 2.0;
  } else if (maxRange > 60) {
    // 넓은 범위 (대륙 전체)
    zoomLevel = 1.5;
  } else if (maxRange > 40) {
    // 큰 국가 (미국, 러시아 등)
    zoomLevel = 0.8;
  } else if (maxRange > 25) {
    // 중간 크기 국가
    zoomLevel = 0.4;
  } else if (maxRange > 15) {
    // 작은 국가
    zoomLevel = 0.25;
  } else if (maxRange > 8) {
    // 매우 작은 지역
    zoomLevel = 0.15;
  } else if (maxRange > 3) {
    // 도시 내 여러 지점
    zoomLevel = 0.1;
  } else {
    // 매우 가까운 지점들
    zoomLevel = 0.08;
  }

  // 범위 비율에 따른 조정 (세로로 긴 경우 vs 가로로 긴 경우)
  if (rangeRatio > 3) {
    // 매우 긴 형태인 경우 약간 더 멀리서
    zoomLevel *= 1.2;
  }

  // 최소/최대 줌 레벨 제한
  return Math.max(0.06, Math.min(2.2, zoomLevel));
};

// 도시들을 자동으로 fit하는 카메라 위치와 줌을 계산하는 메인 함수
export const calculateAutoFitCamera = (cities: CountryData[]) => {
  const boundingBox = calculateBoundingBox(cities);
  const optimalZoom = calculateOptimalZoom(boundingBox);

  return {
    lat: boundingBox.centerLat,
    lng: boundingBox.centerLng,
    altitude: optimalZoom,
    boundingBox,
  };
};

// 현재 카메라 위치에서 타겟 위치로의 애니메이션 시간을 계산
export const calculateAnimationDuration = (
  currentLat: number,
  currentLng: number,
  currentAltitude: number,
  targetLat: number,
  targetLng: number,
  targetAltitude: number,
): number => {
  // 거리 기반으로 애니메이션 시간 계산
  const distance = calculateDistance(currentLat, currentLng, targetLat, targetLng);
  const altitudeDiff = Math.abs(currentAltitude - targetAltitude);

  // 거리에 따른 시간 계산 (더 자연스럽게)
  let durationFromDistance: number;
  if (distance > 10000) {
    // 10000km 이상 (반대편 지구)
    durationFromDistance = 2000;
  } else if (distance > 5000) {
    // 5000km 이상
    durationFromDistance = 1800;
  } else if (distance > 2000) {
    // 2000km 이상
    durationFromDistance = 1500;
  } else if (distance > 1000) {
    // 1000km 이상
    durationFromDistance = 1200;
  } else if (distance > 500) {
    // 500km 이상
    durationFromDistance = 1000;
  } else {
    // 500km 이하
    durationFromDistance = 800;
  }

  // 고도 변화에 따른 시간 귑가
  const altitudeTime = Math.min(altitudeDiff * 600, 800); // 최대 0.8초 추가

  // 최종 시간 계산
  const totalDuration = durationFromDistance + altitudeTime;

  // 최소 1초, 최대 3초
  return Math.max(1000, Math.min(3000, totalDuration));
};
