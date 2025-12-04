import type { Project } from './types';

/**
 * MegaETH
 *
 * Real-time blockchain targeting sub-millisecond latency
 * with a sequencer-based architecture.
 */
export const megaeth: Project = {
  id: 'megaeth',
  name: 'MegaETH',
  description:
    'Real-time blockchain targeting 100k+ TPS with sub-millisecond latency.',
  website: 'https://megaeth.systems',

  techStack: [
    'baseline-evm',
    'parallelism',
    'optimistic-execution',
    'jit-compilation',
  ],

  claimedMetrics: {
    tps: 100000,
    blockTime: 0.001, // 1ms blocks
  },

  status: 'testnet',

  benchmarkDetails: {
    transactionMix: {
      'eth-transfer': 100,
    },
    conditions:
      'Specialized hardware, controlled network, simple transactions',
    methodology: 'Internal benchmarks with optimized sequencer',
    source: 'MegaETH documentation',
  },

  color: '#EC4899',

  notes:
    'Extremely aggressive claims. Architecture relies on powerful sequencer node.',

  lastUpdated: '2024-12-01',
};
