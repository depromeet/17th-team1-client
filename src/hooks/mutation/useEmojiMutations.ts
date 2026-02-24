"use client";

import { useMutation } from "@tanstack/react-query";
import { pressEmoji, registerEmoji } from "@/services/emojiService";
import type { PressEmojiParams, PressEmojiResponse, RegisterEmojiParams, RegisterEmojiResponse } from "@/types/emoji";

export const useRegisterEmojiMutation = () => {
  return useMutation<RegisterEmojiResponse, Error, RegisterEmojiParams>({
    mutationFn: (params: RegisterEmojiParams) => registerEmoji(params),
  });
};

export const usePressEmojiMutation = () => {
  return useMutation<PressEmojiResponse, Error, PressEmojiParams>({
    mutationFn: (params: PressEmojiParams) => pressEmoji(params),
  });
};
