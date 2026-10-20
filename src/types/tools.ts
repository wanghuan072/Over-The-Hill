import type { ContentRecord } from "./content";
export interface Vehicle extends ContentRecord {
  specifications?: Partial<Record<string, string>>;
  upgrades?: string[];
  unlock?: string;
  advice?: string;
  referenceImage?: string;
  referenceImageAlt?: string;
  engineStages?: { stage: string; torque: number; speedCap: number }[];
  detailFacts?: { label: string; value: string }[];
}
export interface MapLocation {
  id: string;
  title: string;
  region: string;
  category: string;
  x?: number;
  y?: number;
  elevation?: number;
  coordinateSourceUrl?: string;
  coordinateCheckedAt?: string;
  areaSlug?: string;
  description: string;
  href: string;
  sourceUrl?: string;
  verificationStatus: "confirmed" | "unverified" | "outdated";
}
export interface MapRegion {
  slug: string;
  title: string;
  mapImage?: string;
  mapWidth?: number;
  mapHeight?: number;
}
export interface Region extends ContentRecord {
  region?: string;
  places?: string[];
  trails?: string[];
  viewpoints?: string[];
  mapImage?: string;
  mapWidth?: number;
  mapHeight?: number;
}
