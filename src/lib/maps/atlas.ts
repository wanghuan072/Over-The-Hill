import data from "@/data/maps/atlas.json";
import { locations, vehicles } from "@/lib/data/catalog";
import type {
  AtlasPlace,
  AtlasReward,
  AtlasSpecies,
  AtlasTrail,
} from "@/types/maps";

const details: Record<
  string,
  { rewards?: AtlasReward[]; repeatRewards?: AtlasReward[] }
> = data.details;
export const atlasPlaces: AtlasPlace[] = [
  ...locations.flatMap((place) =>
    typeof place.x === "number" && typeof place.y === "number"
      ? [
          {
            id: place.id,
            title: place.title,
            category: place.category,
            areaSlug: place.areaSlug,
            x: place.x,
            y: place.y,
            elevation: place.elevation,
            progressId: place.id,
            ...details[place.id],
            reward: vehicles.find((v) => v.unlock === `Complete ${place.title}`)
              ?.title,
          },
        ]
      : [],
  ),
  ...data.points,
];
export const atlasTrails: AtlasTrail[] = data.trails;
export const atlasSpecies: Record<string, AtlasSpecies> = data.species;
