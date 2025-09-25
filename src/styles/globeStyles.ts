/**
 * 기획서에 맞는 새로운 클러스터 스타일
 * - 대륙 버블: 반투명 배경, 진한 획색 텍스트
 * - 국가 버블: 반투명 배경, 흰색 텍스트, 도시 개수 원형 배지
 */

// 기획서에 맞는 도시 개별 라벨 스타일
export const createSingleLabelStyles = (index: number = 0, angleOffset: number = 0, distance: number = 50) => {
  // 왼쪽/오른쪽 두 방향으로만 배치
  const finalAngle = angleOffset;

  // 각도를 라디안으로 변환
  const _radians = (finalAngle * Math.PI) / 180;

  // 45도 상단 각도 점선에 맞춘 x, y 좌표 계산 (대각선 끝점)
  const lineLength = distance * 0.7;
  // 45도 대각선의 실제 끝점 계산: cos(45°) = sin(45°) = √2/2 ≈ 0.707
  const diagonalEndX = lineLength * Math.cos(Math.PI / 4); // cos(45°)
  const diagonalEndY = lineLength * Math.sin(Math.PI / 4); // sin(45°)

  const offsetX = angleOffset === 0 ? diagonalEndX : -diagonalEndX;
  const offsetY = angleOffset === 0 ? -diagonalEndY : -diagonalEndY;

  // ㄱ자 연결선에서는 lineLength와 angle 사용하지 않음

  return {
    // 중심 dot
    dot: `
      position: absolute;
      top: -3px;
      left: -3px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: white;
      z-index: 6;
      pointer-events: none;
    `,
    // 45도 각도 그라데이션 점선
    horizontalLine: `
      position: absolute;
      top: 0px;
      left: 0px;
      width: ${lineLength}px;
      height: 1px;
      transform-origin: 0 0;
      transform: rotate(${offsetX > 0 ? -45 : -135}deg);
      background-image: repeating-linear-gradient(
        to right,
        white 0px,
        white 3px,
        transparent 3px,
        transparent 8px
      );
      z-index: 5;
      pointer-events: none;
    `,
    label: `
      display: inline-flex;
      padding: 6px;
      align-items: center;
      gap: 5px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.20);
      background: rgba(255, 255, 255, 0.20);
      box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      color: #FFF;
      font-family: Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: 128%;
      font-feature-settings: 'liga' off, 'clig' off;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      pointer-events: auto;
      position: absolute;
      z-index: ${20 + index};
      top: ${offsetY}px;
      left: ${offsetX}px;
      transform: translate(-50%, -50%);
      white-space: nowrap;
    `,
  };
};

// 기획서에 맞는 대륙 클러스터 스타일
export const createContinentClusterStyles = (index: number = 0, angleOffset: number = 0, distance: number = 100) => {
  const lineLength = distance * 0.7;
  // 45도 대각선의 실제 끝점 계산: cos(45°) = sin(45°) = √2/2 ≈ 0.707
  const diagonalEndX = lineLength * Math.cos(Math.PI / 4); // cos(45°)
  const diagonalEndY = lineLength * Math.sin(Math.PI / 4); // sin(45°)

  const offsetX = angleOffset === 0 ? diagonalEndX : -diagonalEndX;
  const offsetY = angleOffset === 0 ? -diagonalEndY : -diagonalEndY;

  return {
    dot: `
      position: absolute;
      top: -3px;
      left: -3px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: white;
      z-index: 6;
      pointer-events: none;
    `,
    horizontalLine: `
      position: absolute;
      top: 0px;
      left: 0px;
      width: ${lineLength}px;
      height: 1px;
      transform-origin: 0 0;
      transform: rotate(${offsetX > 0 ? -45 : -135}deg);
      background-image: repeating-linear-gradient(
        to right,
        white 0px,
        white 3px,
        transparent 3px,
        transparent 8px
      );
      z-index: 5;
      pointer-events: none;
    `,
    label: `
      display: inline-flex;
      padding: 12px 16px;
      align-items: center;
      gap: 5px;
      border-radius: 50px;
      background: rgba(255, 255, 255, 0.20);
      box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      color: #FFF;
      font-family: Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 128%;
      font-feature-settings: 'liga' off, 'clig' off;
      cursor: default;
      user-select: none;
      pointer-events: none;
      position: absolute;
      z-index: ${20 + index};
      top: ${offsetY}px;
      left: ${offsetX}px;
      transform: translate(-50%, -50%);
      white-space: nowrap;
    `,
  };
};

// 기획서에 맞는 국가 클러스터 스타일
export const createCountryClusterStyles = (index: number = 0, angleOffset: number = 0, distance: number = 100) => {
  const lineLength = distance * 0.7;
  // 45도 대각선의 실제 끝점 계산: cos(45°) = sin(45°) = √2/2 ≈ 0.707
  const diagonalEndX = lineLength * Math.cos(Math.PI / 4); // cos(45°)
  const diagonalEndY = lineLength * Math.sin(Math.PI / 4); // sin(45°)

  const offsetX = angleOffset === 0 ? diagonalEndX : -diagonalEndX;
  const offsetY = angleOffset === 0 ? -diagonalEndY : -diagonalEndY;

  return {
    dot: `
      position: absolute;
      top: -3px;
      left: -3px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: white;
      z-index: 6;
      pointer-events: none;
    `,
    horizontalLine: `
      position: absolute;
      top: 0px;
      left: 0px;
      width: ${lineLength}px;
      height: 1px;
      transform-origin: 0 0;
      transform: rotate(${offsetX > 0 ? -45 : -135}deg);
      background-image: repeating-linear-gradient(
        to right,
        white 0px,
        white 3px,
        transparent 3px,
        transparent 8px
      );
      z-index: 5;
      pointer-events: none;
    `,
    label: `
      display: inline-flex;
      padding: 6px 12px 6px 12px;
      align-items: center;
      gap: 5px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.20);
      background: rgba(255, 255, 255, 0.20);
      box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      color: #FFF;
      font-family: Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: 128%;
      font-feature-settings: 'liga' off, 'clig' off;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      pointer-events: auto;
      position: absolute;
      z-index: ${20 + index};
      top: ${offsetY}px;
      left: ${offsetX}px;
      transform: translate(-50%, -50%);
      white-space: nowrap;
    `,
    countBadge: `
      display: flex;
      width: 20px;
      height: 20px;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 10px;
      border-radius: 1000px;
      background: rgba(255, 255, 255, 0.20);
      color: #FFF;
      text-align: center;
      font-family: Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 128%;
      font-feature-settings: 'liga' off, 'clig' off;
    `,
  };
};

// 기존 호환성을 위한 함수 (기존 createClusterLabelStyles 대체)
export const createClusterLabelStyles = createCountryClusterStyles;
