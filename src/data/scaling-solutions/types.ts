/**
 * Scaling Solution Types
 *
 * Defines the structure for scaling solutions and their resource impacts.
 */

import type { ResourceId } from '../resources/types';

/**
 * Impact level for a scaling solution on a resource
 * - '+': Minor improvement (~20-50% boost)
 * - '++': Significant improvement (~2-5x boost)
 * - '+++': Major improvement (5x+ boost)
 * - null: No impact on this resource
 */
export type ImpactLevel = '+' | '++' | '+++' | null;

/**
 * Category of scaling solution
 */
export type ScalingSolutionCategory =
  | 'execution'     // Execution layer improvements (JIT, parallelism, etc.)
  | 'state'         // State management (Verkle, statelessness)
  | 'data'          // Data availability (blobs, DAS)
  | 'proving'       // Proof systems (zkEVM)
  | 'protocol';     // Protocol changes (pipelining)

/**
 * Scaling Solution Definition
 */
export interface ScalingSolution {
  /** Unique identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Short description */
  description: string;

  /** Category of solution */
  category: ScalingSolutionCategory;

  /**
   * Resource impacts - which resources this solution improves
   * Maps resource IDs to impact levels
   */
  resourceImpacts: Partial<Record<ResourceId, ImpactLevel>>;

  /**
   * Multiplier values for simulation
   * Maps resource IDs to actual multipliers (e.g., 2.0 = 2x improvement)
   */
  multipliers: Partial<Record<ResourceId, number>>;

  /** Color for visualizations */
  color: string;

  /** Icon/emoji for the solution */
  icon: string;

  /** Example implementations or projects */
  examples?: string[];

  /** Detailed explanation */
  details?: string;

  /** Trade-offs or downsides */
  tradeoffs?: string[];

  /** Is this solution deployed on mainnet? */
  isDeployed?: boolean;

  /** Estimated timeline if not deployed */
  timeline?: string;
}

/**
 * Convert impact level to a multiplier for simulation
 */
export function impactToMultiplier(impact: ImpactLevel): number {
  switch (impact) {
    case '+': return 1.5;    // 50% improvement
    case '++': return 3.0;   // 3x improvement
    case '+++': return 10.0; // 10x improvement
    default: return 1.0;     // No change
  }
}

/**
 * Get display label for impact level
 */
export function impactLabel(impact: ImpactLevel): string {
  switch (impact) {
    case '+': return 'Minor boost';
    case '++': return 'Significant boost';
    case '+++': return 'Major boost';
    default: return 'No impact';
  }
}
