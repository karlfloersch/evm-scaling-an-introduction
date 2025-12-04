/**
 * Resource Registry
 *
 * This file exports all available resources for the simulation.
 * To add a new resource, create a file and import it here.
 */

import { cpuGas } from './cpu-gas';
import { stateReads } from './state-reads';
import { stateWrites } from './state-writes';
import { bandwidth } from './bandwidth';
import { verification } from './verification';
import type { Resource } from './types';

export * from './types';

/**
 * All available resources
 */
export const resources: Resource[] = [
  cpuGas,
  stateReads,
  stateWrites,
  bandwidth,
  verification,
];

/**
 * Resource lookup by ID
 */
export const resourcesById: Record<string, Resource> = Object.fromEntries(
  resources.map((r) => [r.id, r])
);

/**
 * Default resources to include in simulations
 */
export const defaultResources: Resource[] = [
  cpuGas,
  stateReads,
  stateWrites,
];

/**
 * Get a resource by ID
 */
export function getResource(id: string): Resource | undefined {
  return resourcesById[id];
}
