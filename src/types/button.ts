import type { CountryBasedGlobeRef } from "@/components/react-globe/CountryBasedGlobe";

// BackButton Component
export interface BackButtonProps {
  isZoomed: boolean;
  globeRef: React.RefObject<CountryBasedGlobeRef | null>;
  onReset: () => void;
}
