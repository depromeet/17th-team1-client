import { WarningIcon } from "@/assets/icons";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const DeleteConfirmModal = ({ isOpen, onCancel, onConfirm }: DeleteConfirmModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="w-[300px] rounded-3xl bg-gray-750 px-5 pt-[30px] pb-5">
        <DialogBody className="flex flex-col items-center px-0 py-0">
          <DialogHeader className="items-center gap-0">
            <WarningIcon width={38} height={38} className="mb-2.5" />
            <DialogTitle className="mb-1">정말 삭제하시겠어요?</DialogTitle>
            <DialogDescription className="text-center font-medium text-text-primary">
              입력된 사진의 정보들은 다시 복구되지 않아요.
            </DialogDescription>
          </DialogHeader>

          <div className="flex w-full gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="w-[125px] h-11 rounded-xl bg-[#2E3E54] px-5 py-2 text-sm font-bold text-text-primary transition-opacity hover:opacity-90"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-[125px] h-11 rounded-xl bg-red-warning px-5 py-2 text-sm font-bold text-text-primary transition-opacity hover:opacity-90"
            >
              삭제
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
