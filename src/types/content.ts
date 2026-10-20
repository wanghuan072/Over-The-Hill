export interface ContentSection {
  heading: string;
  paragraphs: string[];
  steps?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  sourceIds?: string[];
  image?: {
    src: string;
    alt: string;
    caption: string;
    kind?: "map" | "model" | "scene" | "diagram";
  };
  callout?: { title: string; text: string };
  links?: { label: string; href: string }[];
}
export interface ContentSource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  scope: string;
  checkedAt: string;
  kind?: "official-video" | "gameplay-video";
  publishedAt?: string;
  durationSeconds?: number;
}
export interface ContentFact {
  label: string;
  value: string;
  sourceId: string;
  timestampSeconds?: number;
}
export interface ContentRecord {
  readingMinutes?: number;
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image: string;
  imageAlt: string;
  imageLabel?: string;
  imageKind?: "garage-icon" | "game-icon" | "game-model" | "game-screenshot";
  playerNotes?: string[];
  listGroup?: string;
  hidden?: boolean;
  displayFacts?: { label: string; value: string }[];
  sourceUrl: string;
  sourceUrls?: string[];
  sourceIds?: string[];
  summary?: string;
  evidenceNote?: string;
  questions?: { question: string; answer: string }[];
  facts?: ContentFact[];
  sourceType: "official" | "in-game";
  verificationStatus: "confirmed" | "unverified" | "outdated";
  gameVersion: string;
  lastVerifiedAt: string;
  updatedAt?: string;
  publishedAt: string;
  sections: ContentSection[];
  related: string[];
  seo: { title: string; description: string };
}
export interface SearchItem {
  title: string;
  description: string;
  category: string;
  href: string;
  image: string;
  imageAlt: string;
  imageLabel?: string;
  imageKind?: "garage-icon" | "game-icon" | "game-model" | "game-screenshot";
  searchText?: string;
  attributes?: { label: string; value: string }[];
  scope?: string;
}
