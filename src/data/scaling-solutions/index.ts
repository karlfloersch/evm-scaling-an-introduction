/**
 * Scaling Solutions Registry
 *
 * 12 scaling solutions with their resource impacts.
 *
 * Resource Impact Key:
 * - "-" = No impact
 * - "+" = Minor improvement (~50% boost)
 * - "++" = Significant improvement (~3x boost)
 * - "+++" = Major improvement (10x+ boost)
 */

import type { ScalingSolution, ScalingSolutionCategory } from './types';

export * from './types';

/**
 * Parallel Execution
 * Execute non-conflicting transactions in parallel across multiple cores.
 */
export const parallelExecution: ScalingSolution = {
  id: 'parallel-execution',
  name: 'Parallel Execution',
  description: 'Execute transactions that don\'t conflict in parallel across multiple cores',
  category: 'execution',
  resourceImpacts: {
    'evm-compute': '+++',
    'state-access': '++',
  },
  multipliers: {
    'evm-compute': 10.0,
    'state-access': 4.0,
  },
  color: '#06B6D4',
  icon: '🔀',
  examples: ['Monad', 'Sei', 'MegaETH', 'Reth parallel'],
  details: 'Parallel execution runs non-conflicting transactions simultaneously. Benefits depend heavily on workload - transfers parallelize well, but swaps on the same pool cannot.',
  tradeoffs: ['Benefits depend on actual state access patterns', 'Adds complexity to execution', 'Hot spots (popular pools) still serialize'],
  isDeployed: false,
  timeline: 'Active development',
};

/**
 * Delayed State Root (EIP-7862)
 * Compute state root after block execution, not during.
 */
export const delayedStateRoot: ScalingSolution = {
  id: 'delayed-state-root',
  name: 'Delayed State Root',
  description: 'Compute state root asynchronously after block execution (EIP-7862)',
  category: 'protocol',
  resourceImpacts: {
    'merklization': '+++',
  },
  multipliers: {
    'merklization': 10.0,
  },
  color: '#8B5CF6',
  icon: '⏱️',
  examples: ['EIP-7862', 'Proposed for Ethereum'],
  details: 'Currently state roots must be computed during block production, creating a bottleneck. Delayed state root allows the root to be computed and committed in a later block, removing merklization from the critical path.',
  tradeoffs: ['Adds 1-slot delay for state root finality', 'Requires protocol changes', 'Light client proofs delayed by 1 slot'],
  isDeployed: false,
  timeline: '2025+',
};

/**
 * State Warming
 * Pre-load state that will likely be accessed.
 */
export const stateWarming: ScalingSolution = {
  id: 'state-warming',
  name: 'State Warming',
  description: 'Pre-load state into memory before execution based on predicted access patterns',
  category: 'execution',
  resourceImpacts: {
    'evm-compute': '+',
    'state-access': '++',
  },
  multipliers: {
    'evm-compute': 1.5,
    'state-access': 3.0,
  },
  color: '#F97316',
  icon: '🔥',
  examples: ['Reth', 'Erigon prefetching'],
  details: 'State warming pre-fetches state that transactions are likely to access. This hides disk I/O latency by loading data before it\'s needed.',
  tradeoffs: ['Wasted work if predictions are wrong', 'Memory overhead', 'Benefits depend on prediction accuracy'],
  isDeployed: true,
};

/**
 * Speculative Mempool Execution
 * Execute transactions speculatively while in mempool.
 */
export const speculativeMempoolExec: ScalingSolution = {
  id: 'speculative-mempool-exec',
  name: 'Speculative Mempool Exec',
  description: 'Pre-execute transactions in the mempool before block inclusion',
  category: 'execution',
  resourceImpacts: {
    'evm-compute': '++',
    'state-access': '+',
  },
  multipliers: {
    'evm-compute': 3.0,
    'state-access': 1.5,
  },
  color: '#EC4899',
  icon: '🎯',
  examples: ['Flashbots', 'Block builders'],
  details: 'Execute transactions speculatively while they sit in the mempool. When the block is built, results are already cached. Must handle invalidation when state changes.',
  tradeoffs: ['Wasted work if transactions are invalidated', 'Complexity in handling re-execution', 'Only helps block builders, not validators'],
  isDeployed: true,
};

/**
 * Block Access Lists (EIP-7928)
 * Blocks include access lists so verifiers can pre-fetch state.
 */
export const blockAccessLists: ScalingSolution = {
  id: 'block-access-lists',
  name: 'Block Access Lists',
  description: 'Blocks include lists of accessed state so verifiers can pre-fetch (EIP-7928)',
  category: 'protocol',
  resourceImpacts: {
    'block-verification': '+++',
  },
  multipliers: {
    'block-verification': 10.0,
  },
  color: '#10B981',
  icon: '📋',
  examples: ['EIP-7928', 'Proposed for Ethereum'],
  details: 'Block producers include a list of all state accessed during execution. Verifiers can pre-fetch this state in parallel while downloading the block, dramatically speeding up verification.',
  tradeoffs: ['Increases block size', 'Block producers must generate accurate lists', 'Adds complexity to block format'],
  isDeployed: false,
  timeline: '2025+',
};

/**
 * Historical State Indexing
 * Better indexing for historical state queries.
 */
export const historicalStateIndexing: ScalingSolution = {
  id: 'historical-state-indexing',
  name: 'Historical State Indexing',
  description: 'Efficient indexing structures for querying historical state',
  category: 'data',
  resourceImpacts: {
    'history-growth': '+',
  },
  multipliers: {
    'history-growth': 1.5,
  },
  color: '#64748B',
  icon: '📚',
  examples: ['Erigon', 'Archive node optimizations'],
  details: 'Specialized indexing structures make historical state queries faster and more storage-efficient. Helps archive nodes serve historical data without storing full state at every block.',
  tradeoffs: ['Index maintenance overhead', 'Trade-off between query speed and storage'],
  isDeployed: true,
};

/**
 * ZK Light Clients
 * Verify chain state with ZK proofs instead of re-execution.
 */
export const zkLightClients: ScalingSolution = {
  id: 'zk-light-clients',
  name: 'ZK Light Clients',
  description: 'Verify chain state using ZK proofs without full re-execution',
  category: 'proving',
  resourceImpacts: {
    'block-verification': '++',
    'block-distribution': '+',
    'proof-generation': '+++',
  },
  multipliers: {
    'block-verification': 3.0,
    'block-distribution': 1.5,
    'proof-generation': 10.0,
  },
  color: '#6366F1',
  icon: '🔮',
  examples: ['Helios', 'SP1', 'Succinct'],
  details: 'ZK light clients verify a proof of block validity instead of re-executing all transactions. This enables instant sync and verification on resource-constrained devices.',
  tradeoffs: ['Proof generation is expensive', 'Proving latency adds delay', 'Requires trusted prover or decentralized proving network'],
  isDeployed: false,
  timeline: 'Active development',
};

/**
 * Custom Precompiles
 * Hardware-optimized implementations for expensive operations.
 */
export const customPrecompiles: ScalingSolution = {
  id: 'custom-precompiles',
  name: 'Custom Precompiles',
  description: 'Hardware-optimized native implementations for expensive operations',
  category: 'execution',
  resourceImpacts: {
    'evm-compute': '++',
    'block-verification': '++',
    'proof-generation': '+',
  },
  multipliers: {
    'evm-compute': 3.0,
    'block-verification': 3.0,
    'proof-generation': 1.5,
  },
  color: '#A855F7',
  icon: '⚡',
  examples: ['secp256r1 (RIP-7212)', 'BLS12-381', 'KZG'],
  details: 'Precompiles are native implementations of expensive operations. They run at near-hardware speed instead of being interpreted as EVM opcodes.',
  tradeoffs: ['Requires protocol upgrade to add new ones', 'Each new precompile needs security review', 'Increases protocol complexity'],
  isDeployed: true,
};

/**
 * JIT/Native Contracts (revmc)
 * Compile hot contracts to native code.
 */
export const jitNativeContracts: ScalingSolution = {
  id: 'jit-native-contracts',
  name: 'JIT/Native Contracts',
  description: 'Compile EVM bytecode to native machine code for faster execution (revmc)',
  category: 'execution',
  resourceImpacts: {
    'evm-compute': '++',
    'block-verification': '++',
  },
  multipliers: {
    'evm-compute': 3.0,
    'block-verification': 3.0,
  },
  color: '#F59E0B',
  icon: '🚀',
  examples: ['revmc', 'Reth', 'evmone'],
  details: 'Just-In-Time compilation translates EVM bytecode to native machine code at runtime. This eliminates interpreter overhead and enables CPU-level optimizations.',
  tradeoffs: ['Compilation overhead for cold contracts', 'Memory usage for cached code', 'Must ensure semantic equivalence'],
  isDeployed: true,
};

/**
 * Triedb
 * Optimized database for trie storage.
 */
export const triedb: ScalingSolution = {
  id: 'triedb',
  name: 'Triedb',
  description: 'Optimized database storage for Merkle Patricia Tries',
  category: 'state',
  resourceImpacts: {
    'state-access': '+++',
    'merklization': '++',
    'state-growth': '+',
  },
  multipliers: {
    'state-access': 10.0,
    'merklization': 3.0,
    'state-growth': 1.5,
  },
  color: '#0EA5E9',
  icon: '🗃️',
  examples: ['MDBX', 'Erigon', 'Reth storage'],
  details: 'Specialized database layouts optimized for trie operations. Reduces I/O by storing trie nodes efficiently and minimizing read amplification.',
  tradeoffs: ['Migration effort from existing databases', 'Different trade-offs for different access patterns'],
  isDeployed: true,
};

/**
 * State Expiry
 * Old unused state expires and can be pruned.
 */
export const stateExpiry: ScalingSolution = {
  id: 'state-expiry',
  name: 'State Expiry',
  description: 'Old unused state expires and is pruned from active storage',
  category: 'state',
  resourceImpacts: {
    'state-access': '+',
    'merklization': '+',
    'state-growth': '+++',
  },
  multipliers: {
    'state-access': 1.5,
    'merklization': 1.5,
    'state-growth': 10.0,
  },
  color: '#EF4444',
  icon: '⏳',
  examples: ['EIP-7736 proposal', 'Solana rent'],
  details: 'State expiry removes state that hasn\'t been accessed in a long time. Users can resurrect expired state by providing a proof.',
  tradeoffs: ['UX complexity for resurrection', 'Determining expiry period', 'Need witnesses for resurrection'],
  isDeployed: false,
  timeline: 'Research',
};

/**
 * RISC-V VM
 * Run EVM via RISC-V for better proving and execution.
 */
export const riscvVm: ScalingSolution = {
  id: 'riscv-vm',
  name: 'RISC-V VM',
  description: 'Execute EVM via RISC-V compilation for better proving efficiency',
  category: 'proving',
  resourceImpacts: {
    'evm-compute': '+++',
    'proof-generation': '+++',
  },
  multipliers: {
    'evm-compute': 10.0,
    'proof-generation': 10.0,
  },
  color: '#DC2626',
  icon: '🔧',
  examples: ['SP1', 'RISC Zero', 'Jolt', 'OP Kailua'],
  details: 'RISC-V VMs compile the EVM to RISC-V instructions. This enables faster proving (RISC-V circuits are simpler than EVM circuits) and can also speed up native execution.',
  tradeoffs: ['Compilation overhead', 'Must maintain EVM compatibility', 'Different execution characteristics'],
  isDeployed: false,
  timeline: 'Active development',
};

/**
 * All scaling solutions
 */
export const scalingSolutions: ScalingSolution[] = [
  parallelExecution,
  delayedStateRoot,
  stateWarming,
  speculativeMempoolExec,
  blockAccessLists,
  historicalStateIndexing,
  zkLightClients,
  customPrecompiles,
  jitNativeContracts,
  triedb,
  stateExpiry,
  riscvVm,
];

/**
 * Solutions grouped by category
 */
export const solutionsByCategory: Record<ScalingSolutionCategory, ScalingSolution[]> = {
  execution: [parallelExecution, stateWarming, speculativeMempoolExec, customPrecompiles, jitNativeContracts],
  state: [triedb, stateExpiry],
  data: [historicalStateIndexing],
  proving: [zkLightClients, riscvVm],
  protocol: [delayedStateRoot, blockAccessLists],
};

/**
 * Category display names
 */
export const categoryNames: Record<ScalingSolutionCategory, string> = {
  execution: 'Execution',
  state: 'State Management',
  data: 'Data & History',
  proving: 'Proving',
  protocol: 'Protocol',
};

/**
 * Lookup solution by ID
 */
export const solutionsById: Record<string, ScalingSolution> = Object.fromEntries(
  scalingSolutions.map((s) => [s.id, s])
);

/**
 * Get a solution by ID
 */
export function getSolution(id: string): ScalingSolution | undefined {
  return solutionsById[id];
}
