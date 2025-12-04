/**
 * Transaction Type Definition
 *
 * A transaction type represents a category of blockchain transaction
 * with specific resource consumption patterns and demand characteristics.
 *
 * To add a new transaction type:
 * 1. Create a new file in src/data/transactions/[tx-id].ts
 * 2. Export a TransactionType object following this interface
 * 3. Import and add it to the registry in src/data/transactions/index.ts
 */
export interface TransactionType {
  /** Unique identifier (kebab-case, e.g., 'uniswap-swap') */
  id: string;

  /** Human-readable name */
  name: string;

  /** Short description */
  description: string;

  /** Category of transaction */
  category: TransactionCategory;

  /**
   * State access pattern - which storage slots this transaction reads/writes.
   * This determines parallelizability: transactions that access the same
   * specific slots cannot run in parallel.
   */
  stateAccess: StateAccess;

  /**
   * Resource consumption per transaction (legacy, for backwards compatibility)
   * Keys are resource IDs, values are units consumed per TX
   * @deprecated Use stateAccess instead - scaling solutions calculate consumption
   */
  resourceConsumption: Record<string, number>;

  /**
   * Base demand in TPS (transactions per second)
   * This is the average demand when price is at equilibrium
   */
  baseDemand: number;

  /**
   * Demand volatility (0-1)
   * 0 = steady demand, 1 = highly volatile (e.g., NFT mints, market events)
   */
  demandVolatility: number;

  /**
   * Price elasticity (0-1)
   * How much demand decreases as price increases
   * 0 = inelastic (will pay any price), 1 = highly elastic
   */
  priceElasticity: number;

  /** Average gas used (for reference) */
  averageGas: number;

  /** Current percentage of mainnet transactions (0-100) */
  percentOfMainnetTxs: number;

  /** Color for visualizations */
  color: string;

  /** Additional notes */
  notes?: string;
}

/**
 * State Access Pattern
 *
 * Defines which storage slots a transaction reads and writes.
 * Used to determine parallelizability and conflict detection.
 */
export interface StateAccess {
  /** Storage slots this transaction reads */
  reads: SlotAccess[];
  /** Storage slots this transaction writes */
  writes: SlotAccess[];
}

/**
 * Slot Access Types
 *
 * - 'specific': Always accesses this exact slot (hot spot, causes conflicts)
 * - 'random': Accesses a random slot from a namespace (no conflicts assumed)
 * - 'sender': The transaction sender's balance slot (unique per tx)
 * - 'receiver': The transaction receiver's balance slot (unique per tx)
 */
export type SlotAccess =
  | { type: 'specific'; slot: string }
  | { type: 'random'; namespace: string }
  | { type: 'sender' }
  | { type: 'receiver' };

/**
 * Check if two slot accesses conflict (could access the same storage)
 */
export function slotsConflict(s1: SlotAccess, s2: SlotAccess): boolean {
  // Specific-Specific: conflict if same slot
  if (s1.type === 'specific' && s2.type === 'specific') {
    return s1.slot === s2.slot;
  }

  // Random-Random: assume no conflict (large namespace)
  if (s1.type === 'random' && s2.type === 'random') {
    return false;
  }

  // Sender/Receiver: assume no conflict (different users)
  if (
    (s1.type === 'sender' || s1.type === 'receiver') &&
    (s2.type === 'sender' || s2.type === 'receiver')
  ) {
    return false;
  }

  // Specific vs Random/Sender/Receiver: no conflict
  return false;
}

/**
 * Check if two transactions have a state conflict
 * (one writes to a slot the other reads or writes)
 */
export function hasStateConflict(
  tx1: TransactionType,
  tx2: TransactionType
): boolean {
  const tx1Writes = tx1.stateAccess.writes;
  const tx2Writes = tx2.stateAccess.writes;
  const tx1Reads = tx1.stateAccess.reads;
  const tx2Reads = tx2.stateAccess.reads;

  // Write-Write conflict
  for (const w1 of tx1Writes) {
    for (const w2 of tx2Writes) {
      if (slotsConflict(w1, w2)) return true;
    }
  }

  // Write-Read conflict (tx1 writes what tx2 reads)
  for (const w1 of tx1Writes) {
    for (const r2 of tx2Reads) {
      if (slotsConflict(w1, r2)) return true;
    }
  }

  // Read-Write conflict (tx1 reads what tx2 writes)
  for (const r1 of tx1Reads) {
    for (const w2 of tx2Writes) {
      if (slotsConflict(r1, w2)) return true;
    }
  }

  return false;
}

/**
 * Get all specific (hot) slots accessed by a transaction
 */
export function getHotSlots(tx: TransactionType): string[] {
  const slots: string[] = [];
  for (const access of [...tx.stateAccess.reads, ...tx.stateAccess.writes]) {
    if (access.type === 'specific') {
      slots.push(access.slot);
    }
  }
  return Array.from(new Set(slots)); // Deduplicate
}

/**
 * Check if a transaction is fully parallelizable (has no hot slots)
 * Transactions with only 'random', 'sender', 'receiver' access can run in parallel
 */
export function isFullyParallelizable(tx: TransactionType): boolean {
  return getHotSlots(tx).length === 0;
}

export type TransactionCategory =
  | 'transfer'      // Simple value transfers
  | 'defi'          // DeFi operations (swaps, lending, etc.)
  | 'nft'           // NFT mints, transfers, marketplace
  | 'gaming'        // On-chain gaming transactions
  | 'governance'    // DAO votes, proposals
  | 'infrastructure' // Contract deployments, upgrades
  | 'other';

/**
 * Demand curve point
 * Represents demand at a specific price point
 */
export interface DemandPoint {
  price: number;   // Price in gwei
  quantity: number; // Demand in TPS
}

/**
 * Generate demand curve for a transaction type at a given time
 */
export function generateDemandCurve(
  txType: TransactionType,
  timestamp: number,
  pricePoints: number[] = [0, 10, 25, 50, 100, 200, 500, 1000]
): DemandPoint[] {
  // Add time-based volatility
  const volatilityFactor = 1 + (Math.sin(timestamp * 0.1) * txType.demandVolatility);

  return pricePoints.map((price) => {
    // Calculate demand at this price point
    // Higher price = lower demand (based on elasticity)
    const priceImpact = Math.exp(-price * txType.priceElasticity * 0.01);
    const quantity = txType.baseDemand * volatilityFactor * priceImpact;

    return { price, quantity: Math.max(0, quantity) };
  });
}

/**
 * Runtime state of a transaction in the simulation
 */
export interface Transaction {
  id: string;
  typeId: string;
  timestamp: number;
  gasPrice: number;
  priorityFee: number;
  status: 'pending' | 'executed' | 'dropped';
}
