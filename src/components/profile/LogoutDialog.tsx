"use client";

import { Button } from "@/components/common/Button";
import { Dialog, DialogActions, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { cn } from "@/utils/cn";

type LogoutDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
};

export const LogoutDialog = ({ isOpen, onOpenChange, onConfirm, isLoading = false }: LogoutDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!w-[300px] !max-w-[300px] bg-[#1c2d45] border-0 rounded-[16px] p-0 gap-0",
          "shadow-[0px_2px_20px_0px_rgba(0,0,0,0.25)]",
        )}
      >
        <DialogHeader className="h-25 justify-center items-center self-stretch gap-[10px] py-[30px] px-[20px] rounded-t-[16px] border-0">
          <DialogTitle className="text-[18px] font-bold text-white text-center leading-[1.3]">
            로그아웃 하시겠습니까?
          </DialogTitle>
        </DialogHeader>

        <DialogActions className="flex gap-[10px] px-[20px] pb-[20px] rounded-b-[16px] border-0 w-full items-center">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            variant="gray"
            size="lg"
            className={cn(
              "flex flex-1 rounded-[10px] h-[45px] px-5 py-3 justify-center items-center",
              "bg-surface-placeholder--8",
              "text-white text-[14px] font-bold leading-[1.5]",
            )}
          >
            아니요
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant="primary"
            size="lg"
            className={cn(
              "flex flex-1 rounded-[10px] h-[45px] px-5 py-3 justify-center items-center",
              "!bg-state-warning",
              "text-white text-[14px] font-bold leading-[1.5]",
            )}
          >
            {isLoading ? "로그아웃 중..." : "로그아웃"}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
