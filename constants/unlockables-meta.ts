/** Static frontend metadata for unlockables, keyed by the seeded DB ID (1–6). */
export type UnlockableMeta = {
  name: string;
  description: string;
  accent: string;
};

export const UNLOCKABLES_META: Record<number, UnlockableMeta> = {
  1: { name: "Clay Pot",         description: "Warm terracotta with a rounded rim.",       accent: "#C5794A" },
  2: { name: "Speckled Planter", description: "Soft ceramic finish with a pebble glaze.",  accent: "#E8D7BC" },
  3: { name: "Moss Ribbon",      description: "A leafy band for milestone weeks.",          accent: "#4D8F63" },
  4: { name: "Sunrise Wrap",     description: "A bright accent for perfect streaks.",       accent: "#F2A65A" },
  5: { name: "Ladybird Charm",   description: "A tiny lucky visitor for the leaves.",       accent: "#D44B3A" },
  6: { name: "Gold Star Tag",    description: "Marks an all-community completion day.",     accent: "#E0B43B" },
};
