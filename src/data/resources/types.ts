/**
 * Resource Definition
 *
 * A resource represents a finite computational resource that limits blockchain throughput.
 * All resources are expressed as per-second throughput limits.
 *
 * Categories:
 * - Building: Resources consumed during block construction
 * - Verification: Resources consumed when validating blocks
 * - Sync/Archive: Resources related to state/history growth rates
 * - Proving: Resources for ZK proof generation
 *
 * To add a new resource:
 * 1. Create a new file in src/data/resources/[resource-id].ts
 * 2. Export a Resource object following this interface
 * 3. Import and add it to the registry in src/data/resources/index.ts
 */
export interface Resource {
  /** Unique identifier (kebab-case, e.g., 'evm-compute') */
  id: ResourceId;

  /** Human-readable name */
  name: string;

  /** Category for grouping */
  category: ResourceCategory;

  /** Short description of what this resource represents */
  description: string;

  /** Unit of measurement (e.g., 'Mgas/sec', 'ops/sec', 'bytes/sec') */
  unit: string;

  /** Maximum throughput per second (current Ethereum mainnet) */
  maxThroughput: number;

  /** Color for visualizations (hex) */
  color: string;

  /** Icon/emoji for UI */
  icon: string;

  /** Additional notes about this resource */
  notes?: string;
}

export type ResourceCategory = 'building' | 'verification' | 'sync-archive' | 'proving';

export type ResourceId =
  | 'evm-compute'
  | 'state-access'
  | 'merklization'
  | 'block-verification'
  | 'block-distribution'
  | 'state-growth'
  | 'history-growth'
  | 'proof-generation';

export type ResourceIcon =
  | 'cpu'
  | 'memory'
  | 'database'
  | 'network'
  | 'lock'
  | 'zap'
  | 'hard-drive'
  | 'activity';

/**
 * Runtime state of a resource during simulation
 */
export interface ResourceState {
  resourceId: string;

  /** Current throughput being used (in resource units) */
  currentThroughput: number;

  /** Utilization as a percentage (0-1) */
  utilization: number;

  /** Queued demand that couldn't be processed (backpressure) */
  backpressure: number;

  /** Effective max throughput (may be modified by scaling solutions) */
  effectiveMaxThroughput: number;
}
