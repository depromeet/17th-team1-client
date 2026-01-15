"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { dateSelectSchema, DateSelectFormData, formatYearMonth, extractDigits } from "@/schemas/date";
import { BaseInputBottomSheet } from "./BaseInputBottomSheet";

type DateSelectBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (date: string) => void;
};

export const DateSelectBottomSheet = ({ isOpen, onClose, onConfirm }: DateSelectBottomSheetProps) => {
  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<DateSelectFormData>({
    resolver: standardSchemaResolver(dateSelectSchema),
    defaultValues: {
      date: "",
    },
    mode: "onChange",
  });

  const dateValue = watch("date");

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const digits = extractDigits(event.target.value);

      if (digits.length <= 6) {
        const formatted = formatYearMonth(digits);
        setValue("date", formatted, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onSubmit = useCallback(
    (data: DateSelectFormData) => {
      onConfirm?.(data.date);
      onClose();
      reset({ date: "" });
    },
    [onConfirm, onClose, reset]
  );

  const handleClose = useCallback(() => {
    onClose();
    reset({ date: "" });
  }, [onClose, reset]);

  // 바텀시트가 열릴 때 폼 리셋
  useEffect(() => {
    if (isOpen) reset({ date: "" });
  }, [isOpen, reset]);

  return (
    <BaseInputBottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleSubmit(onSubmit)}
      title="날짜 추가"
      isValid={isValid}
    >
      <input
        type="text"
        value={dateValue}
        onChange={handleInputChange}
        placeholder="YYYY.MM"
        className="w-full bg-[#1B293E] outline-none text-white placeholder-text-thirdly border border-[#243246] focus:border-[#778A9B] rounded-2xl px-4 py-3.5 text-base transition-colors"
        inputMode="numeric"
      />
    </BaseInputBottomSheet>
  );
};
