// 클러스터링 관련 타입 정의
import type { GlobeInstance } from "globe.gl";
import type { CountryData } from "@/types/travelPatterns";

export type ClusterData = {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
  items: CountryData[];
  count: number;
  clusterType?: "individual_city" | "country_cluster" | "continent_cluster";
  isExpanded?: boolean;
  hasRecords?: boolean; // 해당 클러스터에 여행 기록이 있는지 여부
  thumbnailUrl?: string; // 클러스터의 대표 썸네일
};

export type ClusteringState = {
  mode: "country" | "city" | "continent";
  expandedCountry: string | null;
  selectedCluster: string | null;
  clusteredData: ClusterData[];
  lastInteraction: number;
  clickBasedExpansion: boolean;
  rotationPosition: { lat: number; lng: number };
  lastSignificantRotation: number;
  isZoomAnimating: boolean; // 줌 애니메이션 중인지 여부
};

export type UseClusteringProps = {
  countries: CountryData[];
  zoomLevel: number;
  selectedClusterData?: CountryData[];
  globeRef: React.RefObject<GlobeInstance | null>;
  countryThumbnails?: Record<string, string>;
  onSelectedDataChange: (data: CountryData[] | null) => void;
  onSnapZoomChange: (zoom: number | null) => void;
};
