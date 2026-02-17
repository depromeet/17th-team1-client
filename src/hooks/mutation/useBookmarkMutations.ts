"use client";

import { useMutation } from "@tanstack/react-query";
import { addBookmark, removeBookmark } from "@/services/bookmarkService";
import { AddBookmarkRequest, RemoveBookmarkRequest } from "@/types/bookmark";

export const useAddBookmarkMutation = () => {
  return useMutation<void, Error, AddBookmarkRequest>({
    mutationFn: ({ targetMemberId, useToken }) => addBookmark(targetMemberId, useToken),
  });
};

export const useRemoveBookmarkMutation = () => {
  return useMutation<void, Error, RemoveBookmarkRequest>({
    mutationFn: ({ targetMemberId }) => removeBookmark(targetMemberId),
  });
};
