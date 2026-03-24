export type PlantTier = {
  tier: number;
  name: string;
  health: string;
};

// Three primary plant types (Seedling → Fern → Monstera), each with progression stages.
// Mirrors community.tier (int) in the backend Community model.
export const PLANT_TIERS: PlantTier[] = [
  { tier: 0, name: "Seedling", health: "Fragile" },
  { tier: 1, name: "Sprout", health: "Tender" },
  { tier: 2, name: "Young Fern", health: "Developing" },
  { tier: 3, name: "Fern", health: "Established" },
  { tier: 4, name: "Lush Fern", health: "Rooted" },
  { tier: 5, name: "Monstera", health: "Thriving" },
  { tier: 6, name: "Monstera Bloom", health: "Vibrant" },
  { tier: 7, name: "Monstera Canopy", health: "Radiant" },
];

export function getPlantTier(tier: number): PlantTier {
  return PLANT_TIERS[Math.min(Math.max(tier, 0), PLANT_TIERS.length - 1)];
}

export function getNextPlantTier(tier: number): PlantTier | null {
  return tier + 1 < PLANT_TIERS.length ? PLANT_TIERS[tier + 1] : null;
}
