export const MAINTENANCE_PATH = "/maintenance";

export const MAINTENANCE_VARIANT_PARAM = "variant";

export const MAINTENANCE_VARIANTS = ["a", "b", "c"] as const;

export type MaintenanceVariant = (typeof MAINTENANCE_VARIANTS)[number];

export const DEFAULT_MAINTENANCE_VARIANT: MaintenanceVariant = "a";

// 점검 중에도 점검 화면을 그리는 데 필요한 경로 (정적 리소스, Sentry 터널)
export const MAINTENANCE_BYPASS_PATHS: readonly string[] = [
  MAINTENANCE_PATH,
  "/_next",
  "/assets",
  "/icons",
  "/monitoring",
  "/favicon.svg",
  "/favicon.png",
  "/robots.txt",
];

export const isMaintenanceMode = () => process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export const toMaintenanceVariant = (value: string | null | undefined): MaintenanceVariant =>
  MAINTENANCE_VARIANTS.find(variant => variant === value) ?? DEFAULT_MAINTENANCE_VARIANT;
