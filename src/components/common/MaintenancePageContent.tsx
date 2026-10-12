"use client";

import Image from "next/image";

import { Wrench } from "lucide-react";

import { GlobberHeaderIcon } from "@/assets/icons";
import Error500Icon from "@/assets/icons/500_error.png";
import { Button } from "@/components/common/Button";
import type { MaintenanceVariant } from "@/constants/maintenance";

type MaintenancePageContentProps = {
  variant: MaintenanceVariant;
};

const GLOBE_IMAGE_SRC = "/assets/globe.webp";

const MAINTENANCE_DETAILS = [
  { label: "점검 내용", value: "여행 사진 표시 오류 수정" },
  { label: "진행 상태", value: "작업 중", highlight: true },
  { label: "재개 예정", value: "복구 완료 즉시" },
];

// 점검이 끝났다면 원래 요청한 페이지가 그대로 열린다 (점검 중에는 URL을 유지한 채 rewrite 되므로)
const handleRefresh = () => {
  window.location.reload();
};

function MaintenanceVariantA() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col items-center gap-10">
        <div className="w-48 h-48 relative">
          <Image
            src={GLOBE_IMAGE_SRC}
            alt=""
            fill
            priority
            className="object-contain drop-shadow-[0_0_40px_rgba(71,209,255,0.2)]"
          />
          <span className="absolute -right-1 bottom-2 w-16 h-16 rounded-full bg-surface-secondary border border-surface-placeholder--16 grid place-items-center">
            <Wrench
              aria-hidden
              className="w-8 h-8 text-blue-theme animate-[spin_8s_linear_infinite] motion-reduce:animate-none"
            />
          </span>
        </div>
        <div className="w-full flex flex-col items-center gap-5">
          <h1 className="w-full text-center text-text-primary text-3xl font-bold leading-9">지금은 점검 중이에요.</h1>
          <p className="w-full text-center text-text-secondary text-lg font-medium leading-7">
            더 안정적인 서비스를 위해
            <br />
            점검을 진행하고 있습니다.
            <br />
            불편을 드려 죄송합니다.
          </p>
        </div>
        <div className="w-full px-4 pt-4 pb-7">
          <Button variant="primary" size="lg" onClick={handleRefresh} className="w-full">
            새로고침
          </Button>
        </div>
      </div>
    </div>
  );
}

function MaintenanceVariantB() {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-[512px] px-6 pt-8">
        <GlobberHeaderIcon viewBox="0 0 240 57" width={101} height={24} aria-label="Globber" />
        <div className="mt-12 flex flex-col items-start gap-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-theme/30 bg-blue-theme/10 px-3.5 py-1.5 text-sm font-bold text-blue-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-theme opacity-75 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-theme" />
            </span>
            점검 중
          </span>
          <h1 className="text-text-primary text-3xl font-bold leading-10">
            더 나은 서비스 제공을 위해
            <br />
            <span className="text-blue-theme">잠시 점검하고 있어요.</span>
          </h1>
          <p className="text-text-secondary text-base font-medium leading-relaxed">
            불편을 드려 죄송합니다.
            <br />
            점검이 끝나는 대로 바로 다시 열어둘게요.
          </p>
          <Button variant="primary" size="lg" onClick={handleRefresh} className="mt-2 w-full">
            새로고침
          </Button>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -bottom-[22vh] w-[130vw] max-w-[640px] -translate-x-1/2 aspect-square drop-shadow-[0_-10px_60px_rgba(71,209,255,0.18)]"
      >
        <Image
          src={GLOBE_IMAGE_SRC}
          alt=""
          fill
          priority
          className="object-contain animate-[spin_60s_linear_infinite] motion-reduce:animate-none"
        />
      </div>
    </div>
  );
}

function MaintenanceVariantC() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col gap-7">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-24 h-24 relative">
            <Image src={Error500Icon} alt="" fill priority className="object-contain" />
          </div>
          <h1 className="text-text-primary text-[26px] font-bold leading-[34px]">서비스 점검 중입니다</h1>
          <p className="text-text-secondary text-base font-medium leading-relaxed">
            이용에 불편을 드려 죄송합니다.
            <br />
            최대한 빠르게 복구하겠습니다.
          </p>
        </div>
        <dl className="flex flex-col rounded-[20px] bg-surface-placeholder--8 px-[18px] py-1.5">
          {MAINTENANCE_DETAILS.map(({ label, value, highlight }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 py-3.5 text-[15px] [&+&]:border-t [&+&]:border-surface-placeholder--8"
            >
              <dt className="shrink-0 text-gray-400">{label}</dt>
              <dd
                className={
                  highlight ? "text-right font-medium text-blue-0" : "text-right font-medium text-text-primary"
                }
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-2.5">
          <Button variant="primary" size="lg" onClick={handleRefresh} className="w-full">
            새로고침
          </Button>
          <p className="text-center text-[13px] text-text-thirdly">저장된 여행 기록은 안전하게 보관되어 있어요.</p>
        </div>
      </div>
    </div>
  );
}

const MAINTENANCE_VARIANT_COMPONENTS = {
  a: MaintenanceVariantA,
  b: MaintenanceVariantB,
  c: MaintenanceVariantC,
} satisfies Record<MaintenanceVariant, () => React.JSX.Element>;

export function MaintenancePageContent({ variant }: MaintenancePageContentProps) {
  const VariantComponent = MAINTENANCE_VARIANT_COMPONENTS[variant];

  return <VariantComponent />;
}
