/**
 * Tech Registry
 *
 * This file exports all available tech for the simulation.
 * To add new tech, create a file and import it here.
 */

import { baselineEvm } from './baseline-evm';
import { parallelism } from './parallelism';
import { optimisticExecution } from './optimistic-execution';
import { verkleTrees } from './verkle-trees';
import { jitCompilation } from './jit-compilation';
import type { Tech } from './types';

export * from './types';

/**
 * All available tech
 */
export const techList: Tech[] = [
  baselineEvm,
  parallelism,
  optimisticExecution,
  verkleTrees,
  jitCompilation,
];

/**
 * Tech lookup by ID
 */
export const techById: Record<string, Tech> =
  Object.fromEntries(techList.map((t) => [t.id, t]));

/**
 * Get tech by ID
 */
export function getTech(id: string): Tech | undefined {
  return techById[id];
}

/**
 * Get tech by category
 */
export function getTechByCategory(
  category: Tech['category']
): Tech[] {
  return techList.filter((t) => t.category === category);
}

/**
 * Check if two tech are compatible
 */
export function areTechCompatible(
  tech1Id: string,
  tech2Id: string
): boolean {
  const t1 = techById[tech1Id];
  const t2 = techById[tech2Id];

  if (!t1 || !t2) return false;

  return (
    !t1.incompatibleWith.includes(tech2Id) &&
    !t2.incompatibleWith.includes(tech1Id)
  );
}

/**
 * Get all compatible tech for a given set of already selected tech
 */
export function getCompatibleTech(
  selectedIds: string[]
): Tech[] {
  return techList.filter((tech) => {
    // Check if this tech is compatible with all selected tech
    return selectedIds.every((selectedId) =>
      areTechCompatible(tech.id, selectedId)
    );
  });
}

// Backwards compatibility aliases
/** @deprecated Use techList instead */
export const scalingSolutions = techList;
/** @deprecated Use techById instead */
export const scalingSolutionsById = techById;
/** @deprecated Use getTech instead */
export const getScalingSolution = getTech;
/** @deprecated Use getTechByCategory instead */
export const getSolutionsByCategory = getTechByCategory;
/** @deprecated Use areTechCompatible instead */
export const areSolutionsCompatible = areTechCompatible;
/** @deprecated Use getCompatibleTech instead */
export const getCompatibleSolutions = getCompatibleTech;
