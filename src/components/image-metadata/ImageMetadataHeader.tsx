/**
 * 이미지 메타데이터 헤더를 렌더링하는 React 컴포넌트입니다.
 *
 * 상단의 닫기 버튼(×)과 도시 이름(없으면 '여행'으로 대체)으로 구성된 타이틀 영역을 표시합니다.
 *
 * @param city - 표시할 도시 이름. falsy 값이면 '여행'으로 대체되어 렌더링됩니다.
 * @param onClose - 선택적 콜백 함수로, 닫기 버튼 클릭 시 호출됩니다. 제공되지 않으면 버튼은 아무 동작을 하지 않습니다.
 * @returns 렌더된 JSX 엘리먼트
 */
export function ImageMetadataHeader({ city, onClose }: { city: string; onClose?: () => void }) {
  return (
    <div className="px-6 pt-6 pb-4">
      <button onClick={onClose} className="text-white text-2xl">×</button>
      <div className="mt-6">
        <div className="text-[24px] font-semibold tracking-tight">
          <span className="text-pink-400">{city || '여행'}</span>
          <span className=""> 여행 기록,</span>
        </div>
        <div className="text-[22px] font-semibold mt-1">딱 한 장면으로 남길 수 있다면?</div>
      </div>
    </div>
  );
}


