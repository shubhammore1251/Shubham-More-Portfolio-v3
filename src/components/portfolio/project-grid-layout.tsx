export type ProjectTile =
  | "feature"
  | "feature-wide"
  | "portrait"
  | "half"
  | "compact"
  | "compact-horizontal";

/**
 * Tile sizes used by ProjectsSection.
 * - 1 project: one wide showcase
 * - 2 projects: featured/secondary 7:5 pairing
 * - 3 projects: one full-width horizontal feature, followed by two equal cards
 *   on the next row. The feature does not span rows or inherit their height.
 * - 4+ projects: balanced 7:5 opening pair, then complete pairs/triples
 */
export function getProjectTiles(count: number): ProjectTile[] {
  const total = Math.floor(count);
  if (!Number.isFinite(total) || total <= 0) return [];
  if (total === 1) return ["feature-wide"];
  if (total === 2) return ["feature", "portrait"];
  if (total === 3) return ["feature", "compact", "compact"];

  const tiles: ProjectTile[] = ["feature", "portrait"];
  const remaining = total - 2;
  const remainder = remaining % 3;
  const compactCount =
    remainder === 0 ? remaining : remaining - (remainder === 1 ? 4 : 2);

  for (let index = 0; index < compactCount; index += 3) {
    tiles.push("compact", "compact", "compact");
  }

  if (remainder === 1) {
    tiles.push("half", "half", "half", "half");
  } else if (remainder === 2) {
    tiles.push("half", "half");
  }

  return tiles.slice(0, total);
}
