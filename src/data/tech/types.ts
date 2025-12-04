/**
 * Tech Definition
 *
 * A Tech represents a technique or optimization that improves
 * blockchain throughput. The key insight is that tech doesn't just
 * modify existing resources - it DEFINES the resource model and how
 * transactions consume those resources.
 *
 * To add new tech:
 * 1. Create a new file in src/data/tech/[tech-id].ts
 * 2. Export a Tech object following this interface
 * 3. Import and add it to the registry in src/data/tech/index.ts
 */

import type { Resource } from '@/data/resources/types';
import type { TransactionType } from '@/data/transactions/types';

/**
 * Context available during simulation for resource calculation
 */
export interface SimulationContext {
  /** Other transactions in the current block/batch */
  currentTransactions: TransactionType[];
  /** Current simulation timestamp */
  timestamp: number;
  /** Active tech stack */
  activeTech: Tech[];
  /** Lane assignments for parallel execution (txId -> laneId) */
  laneAssignments?: Record<string, string>;
}

/**
 * Resource consumption calculated by tech
 */
export interface ResourceConsumption {
  /** Resource ID -> amount consumed */
  [resourceId: string]: number;
}

export interface Tech {
  /** Unique identifier (kebab-case, e.g., 'parallel-execution') */
  id: string;

  /** Human-readable name */
  name: string;

  /** Short description */
  description: string;

  /** Detailed explanation for the presentation */
  longDescription: string;

  /** Category of tech */
  category: TechCategory;

  /**
   * Define what resources exist when this tech is active.
   * Called once at simulation start to build the resource model.
   *
   * @param baseResources - Resources from previous tech in the stack
   * @returns New or modified resources
   */
  defineResources?: (baseResources: Resource[]) => Resource[];

  /**
   * Calculate how a transaction consumes resources with this tech.
   * Called for each transaction during simulation.
   *
   * @param tx - The transaction type
   * @param baseConsumption - Consumption calculated by previous tech
   * @param context - Simulation context (other txs, timestamp, etc.)
   * @returns Resource consumption map
   */
  calculateConsumption?: (
    tx: TransactionType,
    baseConsumption: ResourceConsumption,
    context: SimulationContext
  ) => ResourceConsumption;

  /**
   * Legacy: How this tech modifies resources (simple multipliers)
   * @deprecated Use defineResources and calculateConsumption instead
   */
  resourceModifiers: ResourceModifier[];

  /** Implementation complexity */
  implementationComplexity: 'low' | 'medium' | 'high' | 'very-high';

  /** Security considerations and risks */
  securityConsiderations: string[];

  /** Trade-offs and limitations */
  tradeoffs: string[];

  /** Whether this can be combined with other tech */
  isComposable: boolean;

  /** IDs of tech this is incompatible with */
  incompatibleWith: string[];

  /** IDs of slides that explain this tech */
  explanationSlides: string[];

  /** Color for visualizations */
  color: string;

  /** Icon name */
  icon: string;

  /** Configurable parameters for this tech */
  parameters?: TechParameter[];

  /** Links to relevant resources */
  references?: {
    title: string;
    url: string;
  }[];
}

/**
 * Configurable parameter for tech
 */
export interface TechParameter {
  id: string;
  name: string;
  description: string;
  type: 'number' | 'boolean' | 'select';
  default: number | boolean | string;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
}

export type TechCategory =
  | 'execution'      // Parallel execution, JIT compilation, etc.
  | 'storage'        // State management, Verkle trees, etc.
  | 'networking'     // Data availability, sharding, etc.
  | 'cryptography'   // Signature aggregation, ZK proofs, etc.
  | 'consensus'      // Consensus optimizations
  | 'hardware';      // Hardware acceleration, precompiles

/**
 * Resource Modifier (Legacy)
 * @deprecated Use defineResources and calculateConsumption instead
 */
export interface ResourceModifier {
  resourceId: string;
  multiplyThroughput?: number;
  addThroughput?: number;
  reduceConsumption?: number;
  condition?: ModifierCondition;
  explanation?: string;
}

export interface ModifierCondition {
  transactionTypes?: string[];
  parallelizable?: boolean;
  properties?: Record<string, unknown>;
}

/**
 * Compose resources from a tech stack
 */
export function composeResources(
  techStack: Tech[],
  initialResources: Resource[] = []
): Resource[] {
  let resources = [...initialResources];

  for (const tech of techStack) {
    if (tech.defineResources) {
      resources = tech.defineResources(resources);
    }
  }

  return resources;
}

/**
 * Calculate consumption through a tech stack
 */
export function calculateTotalConsumption(
  tx: TransactionType,
  techStack: Tech[],
  context: SimulationContext
): ResourceConsumption {
  let consumption: ResourceConsumption = {};

  for (const tech of techStack) {
    if (tech.calculateConsumption) {
      consumption = tech.calculateConsumption(tx, consumption, context);
    }
  }

  return consumption;
}

// Legacy functions for backwards compatibility
export function applyTechStack(
  baseMaxThroughput: number,
  techStack: Tech[],
  resourceId: string
): number {
  let effectiveThroughput = baseMaxThroughput;

  for (const tech of techStack) {
    for (const modifier of tech.resourceModifiers) {
      if (modifier.resourceId !== resourceId) continue;

      if (modifier.multiplyThroughput) {
        effectiveThroughput *= modifier.multiplyThroughput;
      }
      if (modifier.addThroughput) {
        effectiveThroughput += modifier.addThroughput;
      }
    }
  }

  return effectiveThroughput;
}

export function applyConsumptionReduction(
  baseConsumption: number,
  techStack: Tech[],
  resourceId: string,
  txTypeId?: string,
  isParallelizable?: boolean
): number {
  let effectiveConsumption = baseConsumption;

  for (const tech of techStack) {
    for (const modifier of tech.resourceModifiers) {
      if (modifier.resourceId !== resourceId) continue;
      if (!modifier.reduceConsumption) continue;

      if (modifier.condition) {
        if (modifier.condition.transactionTypes && txTypeId) {
          if (!modifier.condition.transactionTypes.includes(txTypeId)) {
            continue;
          }
        }
        if (
          modifier.condition.parallelizable !== undefined &&
          isParallelizable !== undefined
        ) {
          if (modifier.condition.parallelizable !== isParallelizable) {
            continue;
          }
        }
      }

      effectiveConsumption *= modifier.reduceConsumption;
    }
  }

  return effectiveConsumption;
}

// Backwards compatibility aliases
/** @deprecated Use Tech instead */
export type ScalingSolution = Tech;
/** @deprecated Use TechCategory instead */
export type ScalingSolutionCategory = TechCategory;
/** @deprecated Use TechParameter instead */
export type SolutionParameter = TechParameter;
/** @deprecated Use applyTechStack instead */
export const applyScalingSolutions = applyTechStack;
