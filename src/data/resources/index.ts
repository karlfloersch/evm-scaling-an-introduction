/**
 * Resource Registry
 *
 * Exports all 8 resources that represent blockchain throughput bottlenecks.
 * Organized by category: Building, Verification, Sync/Archive, Proving
 */

import { evmCompute } from './evm-compute';
import { stateAccess } from './state-access';
import { merklization } from './merklization';
import { blockVerification } from './block-verification';
import { blockDistribution } from './block-distribution';
import { stateGrowth } from './state-growth';
import { historyGrowth } from './history-growth';
import { proofGeneration } from './proof-generation';
import type { Resource, ResourceId, ResourceCategory } from './types';

export * from './types';

/**
 * All available resources (8 total)
 */
export const resources: Resource[] = [
  // Building
  evmCompute,
  stateAccess,
  merklization,
  // Verification
  blockVerification,
  blockDistribution,
  // Sync/Archive
  stateGrowth,
  historyGrowth,
  // Proving
  proofGeneration,
];

/**
 * Resources grouped by category
 */
export const resourcesByCategory: Record<ResourceCategory, Resource[]> = {
  building: [evmCompute, stateAccess, merklization],
  verification: [blockVerification, blockDistribution],
  'sync-archive': [stateGrowth, historyGrowth],
  proving: [proofGeneration],
};

/**
 * Category display names
 */
export const categoryNames: Record<ResourceCategory, string> = {
  building: 'Block Building',
  verification: 'Verification',
  'sync-archive': 'Sync & Archive',
  proving: 'Proving',
};

/**
 * Resource lookup by ID
 */
export const resourcesById: Record<ResourceId, Resource> = {
  'evm-compute': evmCompute,
  'state-access': stateAccess,
  'merklization': merklization,
  'block-verification': blockVerification,
  'block-distribution': blockDistribution,
  'state-growth': stateGrowth,
  'history-growth': historyGrowth,
  'proof-generation': proofGeneration,
};

/**
 * Get a resource by ID
 */
export function getResource(id: ResourceId): Resource {
  return resourcesById[id];
}

/**
 * Default resources for block packing simulation (all of them)
 */
export const defaultResources: Resource[] = resources;

// Re-export individual resources for convenience
export {
  evmCompute,
  stateAccess,
  merklization,
  blockVerification,
  blockDistribution,
  stateGrowth,
  historyGrowth,
  proofGeneration,
};
