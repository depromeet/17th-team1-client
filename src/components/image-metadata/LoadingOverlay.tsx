/**
 * 전체 화면 로딩 오버레이를 표시하는 React 컴포넌트.
 *
 * show가 true일 때 뷰포트 전체를 덮는 반투명 검정 배경과 중앙의 스피너를 렌더링합니다.
 * show가 false이면 아무것도 렌더링하지 않고 null을 반환합니다.
 *
 * @param show - 오버레이를 표시할지 여부. true이면 오버레이를 렌더링하고 false이면 null을 반환합니다.
 * @returns JSX.Element | null — 표시 중이면 전체화면 오버레이 요소, 아니면 null.
 */
export function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    </div>
  );
}


