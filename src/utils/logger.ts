import { env } from "@/config/env";
const isDev = env.IS_LOCAL_DEV;

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDev) console.error(message, error);
    else console.error(message, error instanceof Error ? error.message : "Unknown error");
  },
};
