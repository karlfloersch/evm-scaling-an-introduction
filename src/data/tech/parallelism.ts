import type { Tech, ResourceConsumption, SimulationContext } from './types';
import type { Resource } from '@/data/resources/types';
import type { TransactionType } from '@/data/transactions/types';
import { hasStateConflict } from '@/data/transactions/types';

/**
 * Default number of parallel execution lanes
 */
const DEFAULT_LANES = 4;

/**
 * Parallel Execution
 *
 * Execute non-conflicting transactions in parallel across multiple CPU cores.
 * This is the most impactful tech for throughput.
 *
 * Key insight: parallelism only helps when transactions access different state.
 * - ETH transfers: touch random slots → ~100% parallelism
 * - Uniswap swaps: all touch same pool → ~0% parallelism for same pool
 */
export const parallelism: Tech = {
  id: 'parallelism',
  name: 'Parallel Execution',
  description:
    'Execute transactions in parallel when they don\'t conflict on state.',
  longDescription: `
    Parallel execution allows multiple transactions to execute simultaneously
    when they access different parts of the state.

    **How it works:**
    - Multiple execution "lanes" run concurrently (e.g., 4 lanes = 4 CPU cores)
    - Each lane processes transactions sequentially
    - Transactions that conflict on state must go to the same lane

    **What determines parallelism:**
    - Transactions with "random" slot access (transfers) → spread across lanes
    - Transactions with "specific" hot slots (DEX swaps) → queue up on one lane

    **Real-world impact:**
    - 100% ETH transfers: ~4x throughput with 4 lanes
    - 100% same-pool swaps: ~1x throughput (no improvement)
    - Realistic mix: somewhere in between
  `,
  category: 'execution',

  defineResources: (baseResources: Resource[]): Resource[] => {
    // Create N lanes, each with the same capacity as the base gas resource
    const baseGas = baseResources.find((r) => r.id === 'gas');
    const laneCapacity = baseGas?.currentBaseline ?? 2.5;

    const lanes: Resource[] = Array.from({ length: DEFAULT_LANES }, (_, i) => ({
      id: `gas-lane-${i}`,
      name: `Execution Lane ${i + 1}`,
      description: `Parallel execution lane ${i + 1}`,
      unit: 'Mgas/sec',
      maxThroughput: 60,
      currentBaseline: laneCapacity,
      color: ['#FF6B6B', '#4DABF7', '#69DB7C', '#FFA94D'][i % 4],
      icon: 'cpu' as const,
    }));

    return lanes;
  },

  calculateConsumption: (
    tx: TransactionType,
    _baseConsumption: ResourceConsumption,
    context: SimulationContext
  ): ResourceConsumption => {
    // Find the best lane for this transaction (least utilized, no conflicts)
    const laneId = assignToLane(tx, context);

    return {
      [laneId]: tx.averageGas / 1_000_000,
    };
  },

  // Legacy modifiers (keeping for backwards compatibility)
  resourceModifiers: [
    {
      resourceId: 'cpu-gas',
      multiplyThroughput: DEFAULT_LANES,
      condition: {
        parallelizable: true,
      },
      explanation:
        'Multiplies CPU throughput for parallelizable transactions only.',
    },
  ],

  implementationComplexity: 'high',

  securityConsiderations: [
    'Conflict detection must be correct to avoid invalid state',
    'Re-execution overhead on conflicts',
    'Determinism must be preserved across all execution paths',
  ],

  tradeoffs: [
    'Only helps transactions that don\'t conflict',
    'Popular contracts (Uniswap pools) still bottleneck',
    'Overhead for conflict detection and re-execution',
    'Complexity in client implementation',
  ],

  isComposable: true,
  incompatibleWith: [],

  explanationSlides: ['parallel-intro', 'parallel-deep-dive'],

  color: '#FF6B6B',
  icon: 'cpu',

  parameters: [
    {
      id: 'lanes',
      name: 'Number of Lanes',
      description: 'Number of parallel execution threads',
      type: 'number',
      default: DEFAULT_LANES,
      min: 1,
      max: 32,
    },
  ],

  references: [
    {
      title: 'Block-STM: Scaling Blockchain Execution',
      url: 'https://arxiv.org/abs/2203.06871',
    },
  ],
};

/**
 * Assign a transaction to the best execution lane
 *
 * Strategy:
 * 1. Check for conflicts with transactions already assigned to each lane
 * 2. Assign to first non-conflicting lane
 * 3. If all lanes have conflicts, assign to the lane with fewest conflicts
 */
function assignToLane(
  tx: TransactionType,
  context: SimulationContext
): string {
  const numLanes = DEFAULT_LANES;
  const laneAssignments = context.laneAssignments || {};

  // Group existing transactions by lane
  const txsByLane: Record<string, TransactionType[]> = {};
  for (let i = 0; i < numLanes; i++) {
    txsByLane[`gas-lane-${i}`] = [];
  }

  for (const [txId, laneId] of Object.entries(laneAssignments)) {
    const assignedTx = context.currentTransactions.find((t) => t.id === txId);
    if (assignedTx && txsByLane[laneId]) {
      txsByLane[laneId].push(assignedTx);
    }
  }

  // Find the best lane
  let bestLane = 'gas-lane-0';
  let minConflicts = Infinity;

  for (let i = 0; i < numLanes; i++) {
    const laneId = `gas-lane-${i}`;
    const laneTxs = txsByLane[laneId];

    // Count conflicts with transactions in this lane
    let conflicts = 0;
    for (const laneTx of laneTxs) {
      if (hasStateConflict(tx, laneTx)) {
        conflicts++;
      }
    }

    // Prefer lane with no conflicts
    if (conflicts === 0) {
      return laneId;
    }

    // Otherwise track the lane with fewest conflicts
    if (conflicts < minConflicts) {
      minConflicts = conflicts;
      bestLane = laneId;
    }
  }

  return bestLane;
}

/**
 * Calculate the effective parallelism factor for a transaction mix
 *
 * Returns a number between 1 (no parallelism) and numLanes (perfect parallelism)
 */
export function calculateEffectiveParallelism(
  transactions: TransactionType[],
  numLanes: number = DEFAULT_LANES
): number {
  if (transactions.length === 0) return numLanes;

  // Count how many transaction pairs conflict
  let totalPairs = 0;
  let conflictingPairs = 0;

  for (let i = 0; i < transactions.length; i++) {
    for (let j = i + 1; j < transactions.length; j++) {
      totalPairs++;
      if (hasStateConflict(transactions[i], transactions[j])) {
        conflictingPairs++;
      }
    }
  }

  // If no pairs, assume perfect parallelism
  if (totalPairs === 0) return numLanes;

  // Conflict rate determines how much parallelism we lose
  const conflictRate = conflictingPairs / totalPairs;

  // Simple model: effective parallelism reduces with conflict rate
  // 0% conflicts → numLanes, 100% conflicts → 1
  return 1 + (numLanes - 1) * (1 - conflictRate);
}

/**
 * Estimate throughput improvement from parallelism for a transaction mix
 */
export function estimateParallelismSpeedup(
  transactionMix: Record<string, number>, // txTypeId -> percentage
  transactionTypes: TransactionType[],
  numLanes: number = DEFAULT_LANES
): number {
  // Weight transactions by their percentage in the mix
  const weightedTxs: TransactionType[] = [];

  for (const [txId, percentage] of Object.entries(transactionMix)) {
    const txType = transactionTypes.find((t) => t.id === txId);
    if (txType) {
      // Add proportional number of "virtual" transactions
      const count = Math.round(percentage);
      for (let i = 0; i < count; i++) {
        weightedTxs.push(txType);
      }
    }
  }

  return calculateEffectiveParallelism(weightedTxs, numLanes);
}
