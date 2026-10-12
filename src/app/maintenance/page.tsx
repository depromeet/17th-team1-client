import type { Metadata } from "next";

import { MaintenancePageContent } from "@/components/common/MaintenancePageContent";
import { MAINTENANCE_VARIANT_PARAM, toMaintenanceVariant } from "@/constants/maintenance";

export const metadata: Metadata = {
  title: "서비스 점검 중 - Globber",
  robots: { index: false, follow: false },
};

type MaintenancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const params = await searchParams;
  const variantParam = params[MAINTENANCE_VARIANT_PARAM];
  const variant = toMaintenanceVariant(Array.isArray(variantParam) ? variantParam[0] : variantParam);

  return <MaintenancePageContent variant={variant} />;
}
