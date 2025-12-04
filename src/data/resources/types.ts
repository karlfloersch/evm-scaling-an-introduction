/**
 * Resource Definition
 *
 * A resource represents a finite computational resource that limits blockchain throughput.
 * Examples: CPU execution (gas/sec), state reads, state writes, bandwidth, etc.
 *
 * To add a new resource:
 * 1. Create a new file in src/data/resources/[resource-id].ts
 * 2. Export a Resource object following this interface
 * 3. Import and add it to the registry in src/data/resources/index.ts
 */
export interface Resource {
  /** Unique identifier (kebab-case, e.g., 'cpu-gas') */
  id: string;

  /** Human-readable name */
  name: string;

  /** Short description of what this resource represents */
  description: string;

  /** Unit of measurement (e.g., 'Mgas/sec', 'reads/sec', 'MB/sec') */
  unit: string;

  /** Maximum theoretical throughput per second */
  maxThroughput: number;

  /** Current Ethereum mainnet baseline throughput */
  currentBaseline: number;

  /** Color for visualizations (hex) */
  color: string;

  /** Icon name for UI (from a predefined set) */
  icon: ResourceIcon;

  /** Additional notes about this resource */
  notes?: string;
}

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
