export type AtlasReward = { name: string; count: number };
export type AtlasArea = {
  slug: string;
  title: string;
  region: string;
  image: string;
  satellite: string;
  hazards: { key: string; label: string; image: string }[];
};
export type MapNote = {
  id: string;
  areaSlug: string;
  x: number;
  y: number;
  label: string;
};
export type AtlasPlace = {
  id: string;
  title: string;
  category: string;
  areaSlug?: string;
  x: number;
  y: number;
  elevation?: number;
  reward?: string;
  progressId?: string;
  speciesId?: string;
  rewards?: AtlasReward[];
  repeatRewards?: AtlasReward[];
};
export type AtlasTrail = {
  placeId: string;
  areaSlug: string;
  title: string;
  points: { x: number; y: number; elevation: number }[];
};
export type AtlasSpecies = {
  title: string;
  image: string;
  rarity: string;
  habitat: string;
  time: string;
  weather: string;
  description: string;
  rewards: AtlasReward[];
};
