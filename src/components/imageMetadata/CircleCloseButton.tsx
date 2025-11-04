import { CloseIcon } from "@/assets/icons";

type CircleCloseButtonProps = {
  onClick: () => void;
};

export const CircleCloseButton = ({ onClick }: CircleCloseButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity border-0 p-0 cursor-pointer"
    >
      <CloseIcon width={8} height={8} />
    </button>
  );
};
