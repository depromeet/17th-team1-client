"use client";

export function LoadingSpinner() {
  return (
    <div className="w-14 h-14 relative overflow-hidden">
      <div className="w-12 h-12 left-[5.45px] top-[5.46px] absolute bg-[conic-gradient(from_180deg_at_50.00%_50.00%,_rgba(241,_241,_241,_0)_0deg,_#00D9FF_360deg)] rounded-full animate-spin" />
      <div className="w-1.5 h-1.5 left-[27.27px] top-[49.09px] absolute bg-cyan-400 rounded-full" />
    </div>
  );
}
