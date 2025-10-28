import { WarningIcon } from "@/assets/icons";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const DeleteConfirmModal = ({ isOpen, onCancel, onConfirm }: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-750 rounded-3xl px-5 py-6 w-[343px] flex flex-col items-center">
        <div className="flex flex-col items-center gap-2.5">
          {/* Warning Icon */}
          <WarningIcon width={38} height={38} />

          {/* Title */}
          <h2 className="text-text-primary text-lg font-bold mb-1">정말 삭제하시겠어요?</h2>

          {/* Description */}
          <p className="text-text-primary text-sm text-center mb-5 font-medium">
            입력된 사진의 정보들은 다시 복구되지 않아요.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-[#2E3E54] h-11 text-sm text-text-primary px-5 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-warning text-sm text-text-primary px-5 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};
