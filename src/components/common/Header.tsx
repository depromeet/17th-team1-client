"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { BackIcon, DotIcon, MenuIcon } from "@/assets/icons";
import { cn } from "@/utils/cn";

export const headerVariants = cva("flex items-center justify-between w-full px-4 py-3", {
  variants: {
    variant: {
      default: "bg-white",
      dark: "bg-black",
      transparent: "bg-transparent",
      navy: "bg-surface-secondary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type HeaderProps = React.ComponentProps<"header"> &
  VariantProps<typeof headerVariants> & {
    asChild?: boolean;
    leftButton?: React.ReactNode;
    leftIcon?: "back" | "menu";
    onBack?: () => void;
    onMenu?: () => void;
    title?: string;
    rightButton?: React.ReactNode;
    rightIcon?: "dot" | React.ReactNode;
    onRightButtonClick?: () => void;
  };

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      variant,
      asChild = false,
      leftButton,
      leftIcon,
      onBack,
      onMenu,
      title,
      rightButton,
      rightIcon,
      onRightButtonClick,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "header";

    const renderLeftIcon = () => {
      if (leftButton) return leftButton;

      if (leftIcon === "back" && onBack) {
        return (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-11 h-11 cursor-pointer"
            aria-label="뒤로가기"
          >
            <BackIcon width={9} height={16} />
          </button>
        );
      }

      if (leftIcon === "menu" && onMenu) {
        return (
          <button
            type="button"
            onClick={onMenu}
            className="flex items-center justify-center w-11 h-11 cursor-pointer"
            aria-label="메뉴 열기"
          >
            <MenuIcon width={18} height={14} />
          </button>
        );
      }

      return null;
    };

    const renderRightIcon = () => {
      if (rightIcon === "dot") {
        return (
          <button
            type="button"
            onClick={onRightButtonClick}
            className="flex items-center justify-center w-11 h-11 cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="More options"
          >
            <DotIcon width={24} height={24} />
          </button>
        );
      }

      if (rightIcon && typeof rightIcon !== "string") {
        return (
          <button
            type="button"
            onClick={onRightButtonClick}
            className="flex items-center justify-center w-11 h-11 cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Right action"
          >
            {rightIcon}
          </button>
        );
      }

      return null;
    };

    return (
      <Comp className={cn(headerVariants({ variant }), className)} ref={ref} {...props}>
        {/* 왼쪽 버튼 영역 */}
        <div className="flex items-center justify-start min-w-0 flex-1">{renderLeftIcon()}</div>

        {/* 가운데 타이틀 영역 */}
        <div className="flex items-center justify-center flex-1">
          {title && <h1 className="text-lg font-bold text-text-primary truncate">{title}</h1>}
        </div>

        {/* 오른쪽 버튼 영역 */}
        <div className="flex items-center justify-end min-w-0 flex-1 gap-2">
          {/* 오른쪽 아이콘 버튼 */}
          {renderRightIcon()}

          {/* 오른쪽 텍스트 버튼 */}
          {rightButton && (
            <button
              type="button"
              onClick={onRightButtonClick}
              className="text-base font-bold text-state-focused cursor-pointer"
              aria-label="Right action"
            >
              {rightButton}
            </button>
          )}
        </div>
      </Comp>
    );
  },
);

Header.displayName = "Header";
