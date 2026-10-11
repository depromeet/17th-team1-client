import { createApiContext } from "./context";
import { createAuthService } from "./services/auth";
import { createBookmarkService } from "./services/bookmark";
import { createCityService } from "./services/city";
import { createDiaryService } from "./services/diary";
import { createEmojiService } from "./services/emoji";
import { createMemberService } from "./services/member";
import { createProfileService } from "./services/profile";
import type { ApiConfig } from "./types";

export type { ApiClient } from "./client";
export { ApiError } from "./errors";
export type * from "./types";

/**
 * 플랫폼 어댑터를 주입해 API 클라이언트와 도메인 서비스를 생성합니다.
 * 웹/앱은 각자의 어댑터로 한 번씩만 호출해 모듈 단위 싱글턴으로 사용합니다.
 */
export const createApi = (config: ApiConfig) => {
  const ctx = createApiContext(config);
  const profile = createProfileService(ctx);

  return {
    client: {
      apiGet: ctx.apiGet,
      apiPost: ctx.apiPost,
      apiPostWithHeaders: ctx.apiPostWithHeaders,
      apiPut: ctx.apiPut,
      apiPatch: ctx.apiPatch,
      apiDelete: ctx.apiDelete,
    },
    auth: createAuthService(ctx),
    bookmark: createBookmarkService(ctx),
    city: createCityService(ctx),
    diary: createDiaryService(ctx, { getS3UploadUrl: profile.getS3UploadUrl }),
    emoji: createEmojiService(ctx),
    member: createMemberService(ctx),
    profile,
  };
};

export type Api = ReturnType<typeof createApi>;
