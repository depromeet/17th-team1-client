"use client";

import type {
  PressEmojiParams,
  PressEmojiResponse,
  RegisterEmojiParams,
  RegisterEmojiResponse,
} from "@globber/shared/types/emoji";
import { useMutation } from "@tanstack/react-query";

import { useApi } from "../provider";

export const useRegisterEmojiMutation = () => {
  const api = useApi();
  return useMutation<RegisterEmojiResponse, Error, RegisterEmojiParams>({
    mutationFn: (params: RegisterEmojiParams) => api.emoji.registerEmoji(params),
  });
};

export const usePressEmojiMutation = () => {
  const api = useApi();
  return useMutation<PressEmojiResponse, Error, PressEmojiParams>({
    mutationFn: (params: PressEmojiParams) => api.emoji.pressEmoji(params),
  });
};
