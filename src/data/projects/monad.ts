import type { Project } from './types';

/**
 * Monad
 *
 * High-performance EVM Layer 1 with parallel execution
 * and optimistic execution.
 */
export const monad: Project = {
  id: 'monad',
  name: 'Monad',
  description:
    'High-performance EVM L1 with parallel execution and optimistic pipelining.',
  website: 'https://monad.xyz',

  techStack: [
    'baseline-evm',
    'parallelism',
    'optimistic-execution',
    'jit-compilation',
  ],

  claimedMetrics: {
    tps: 10000,
    blockTime: 1,
  },

  status: 'testnet',

  benchmarkDetails: {
    transactionMix: {
      'eth-transfer': 100, // Often benchmarked with simple transfers
    },
    conditions: 'Optimal conditions with fully parallelizable workload',
    methodology:
      'Internal testing with controlled transaction patterns',
    source: 'Monad documentation',
  },

  color: '#8B5CF6',

  notes:
    'Claims 10,000 TPS but real-world performance depends heavily on transaction mix.',

  lastUpdated: '2024-12-01',
};
