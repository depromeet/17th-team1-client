import { COLORS } from "@/constants/globe";

// 개별 라벨 스타일 생성
// styles.ts
export const createSingleLabelStyles = (index: number = 0, angleOffset: number = 0, distance: number = 50) => {
  // 왼쪽/오른쪽 두 방향으로만 배치
  const finalAngle = angleOffset;

  // 각도를 라디안으로 변환
  const radians = (finalAngle * Math.PI) / 180;

  // x, y 좌표 계산
  const offsetX = Math.cos(radians) * distance;
  const offsetY = Math.sin(radians) * distance;

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
    // 단색 점선 수평선
    horizontalLine: `
      position: absolute;
      top: -0.5px;
      left: ${offsetX > 0 ? 0 : offsetX * 0.7}px;
      width: ${Math.abs(offsetX * 0.7)}px;
      height: 1px;
      background-image: repeating-linear-gradient(
        to right,
        white 0px,
        white 3px,
        transparent 2px,
        transparent 8px
      );
      z-index: 5;
      pointer-events: none;
    `,
    label: `
      background-color: white;
      color: #333;
      padding: 8px 16px;
      border-radius: 25px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: none;
      text-align: center;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: max-content;
      gap: 6px;
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

// 클러스터 라벨 스타일 생성
export const createClusterLabelStyles = (index: number = 0, angleOffset: number = 0, distance: number = 100) => {
  // 왼쪽/오른쪽 두 방향으로만 배치
  const finalAngle = angleOffset;

  // 각도를 라디안으로 변환
  const radians = (finalAngle * Math.PI) / 180;

  // x, y 좌표 계산
  const offsetX = Math.cos(radians) * distance;
  const offsetY = Math.sin(radians) * distance;

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
    // 단색 점선 수평선
    horizontalLine: `
      position: absolute;
      top: -0.5px;
      left: ${offsetX > 0 ? 0 : offsetX * 0.7}px;
      width: ${Math.abs(offsetX * 0.7)}px;
      height: 1px;
      background-image: repeating-linear-gradient(
        to right,
        white 0px,
        white 3px,
        transparent 2px,
        transparent 8px
      );
      z-index: 5;
      pointer-events: none;
    `,
    label: `
      background-color: ${COLORS.CLUSTER_BG};
      color: white;
      padding: 10px 18px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 6px 16px rgba(0,0,0,0.4);
      border: 2px solid ${COLORS.CLUSTER};
      text-align: center;
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