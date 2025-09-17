/**
 * 화면 하단에 고정된 전체 너비 "저장하기" 버튼을 렌더링합니다.
 *
 * 버튼은 `disabled`가 true일 때 비활성화되어 클릭이 불가능하고 비활성 스타일이 적용됩니다.
 *
 * @param onClick - 버튼 클릭 시 호출되는 선택적 콜백 함수
 * @param disabled - true이면 버튼을 비활성화하고 비활성 스타일을 적용
 * @returns 렌더된 JSX 요소
 */
export function FixedSaveButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <div className="fixed left-0 right-0 bottom-5 px-6 z-40">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-4 rounded-[18px] text-base font-medium ${disabled ? 'bg-[#1b1c20] text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white'}`}
      >
        저장하기
      </button>
    </div>
  );
}


