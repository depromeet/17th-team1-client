"use client";

import { AddBookmarkRequest, RemoveBookmarkRequest } from "@globber/shared/types/bookmark";
import { useMutation } from "@tanstack/react-query";

import { useApi } from "../provider";

export const useAddBookmarkMutation = (onLoginGate?: () => void) => {
  const api = useApi();
  return useMutation<void, Error, AddBookmarkRequest>({
    mutationFn: ({ targetMemberId, useToken }) => api.bookmark.addBookmark(targetMemberId, useToken, onLoginGate),
  });
};

export const useRemoveBookmarkMutation = () => {
  const api = useApi();
  return useMutation<void, Error, RemoveBookmarkRequest>({
    mutationFn: ({ targetMemberId }) => api.bookmark.removeBookmark(targetMemberId),
  });
};
