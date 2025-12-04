/**
 * Project Definition
 *
 * A project represents a blockchain or execution layer implementation
 * that uses various tech.
 *
 * To add a new project:
 * 1. Create a new file in src/data/projects/[project-id].ts
 * 2. Export a Project object following this interface
 * 3. Import and add it to the registry in src/data/projects/index.ts
 */
export interface Project {
  /** Unique identifier (kebab-case, e.g., 'monad') */
  id: string;

  /** Project name */
  name: string;

  /** Short description */
  description: string;

  /** Website URL */
  website: string;

  /** Project logo URL (optional) */
  logo?: string;

  /**
   * IDs of tech this project implements
   * These should match IDs from src/data/tech/
   */
  techStack: string[];

  /**
   * Custom resource overrides for this project
   * Use this for projects with unique approaches not captured by tech
   * Keys are resource IDs, values are max throughput overrides
   */
  customResourceOverrides?: Record<string, number>;

  /**
   * Claimed performance metrics
   */
  claimedMetrics?: {
    tps?: number;
    gasPerSecond?: number;
    blockTime?: number;
    finality?: number;
  };

  /** Current launch status */
  status: ProjectStatus;

  /**
   * Benchmark details (for "Pump Your Numbers" section)
   * Describes how the project generates their performance claims
   */
  benchmarkDetails?: BenchmarkDetails;

  /** Color for visualizations */
  color: string;

  /** Additional notes */
  notes?: string;

  /** When was this data last updated */
  lastUpdated: string;
}

export type ProjectStatus =
  | 'mainnet'       // Live on mainnet
  | 'testnet'       // Public testnet
  | 'devnet'        // Developer testnet
  | 'development'   // In development
  | 'announced'     // Announced but not available
  | 'deprecated';   // No longer active

export interface BenchmarkDetails {
  /**
   * Transaction mix used in benchmarks
   * Keys are transaction type IDs, values are percentages (should sum to 100)
   */
  transactionMix: Record<string, number>;

  /** Description of benchmark conditions */
  conditions: string;

  /** Any special notes about methodology */
  methodology?: string;

  /** Source of the benchmark data */
  source?: string;
}

/**
 * Estimated performance for a project
 * Calculated by the simulation engine
 */
export interface ProjectPerformance {
  projectId: string;

  /** Estimated TPS with realistic transaction mix */
  estimatedTPS: number;

  /** Estimated gas per second */
  estimatedGasPerSecond: number;

  /** Bottleneck resource ID */
  bottleneckResource: string;

  /** Per-resource utilization at max throughput */
  resourceUtilization: Record<string, number>;

  /** Transaction breakdown at max throughput */
  transactionBreakdown: Record<string, number>;

  /** Comparison to claimed metrics */
  claimVsEstimate?: {
    tpsRatio: number;  // claimed / estimated
    explanation: string;
  };
}

/**
 * Compare multiple projects
 */
export interface ProjectComparison {
  projects: ProjectPerformance[];

  /** Which project performs best overall */
  bestOverall: string;

  /** Best for specific transaction types */
  bestFor: Record<string, string>;

  /** Summary of key differences */
  summary: string;
}
