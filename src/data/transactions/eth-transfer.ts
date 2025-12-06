import type { TransactionType } from './types';

/**
 * Simple ETH Transfer
 *
 * The simplest transaction type - just moving ETH between accounts.
 * Very efficient, highly parallelizable because each transfer touches
 * unique sender/receiver balance slots.
 */
export const ethTransfer: TransactionType = {
  id: 'eth-transfer',
  name: 'ETH Transfer',
  description: 'Simple ETH transfer between accounts. Minimal state access.',
  category: 'transfer',

  stateAccess: {
    reads: [
      { type: 'sender' },   // Read sender balance
      { type: 'receiver' }, // Read receiver balance
    ],
    writes: [
      { type: 'sender' },   // Update sender balance
      { type: 'receiver' }, // Update receiver balance
    ],
  },

  resourceConsumption: {
    'evm-compute': 0.021,        // 21,000 gas = 0.021 Mgas
    'state-access': 100,         // Account reads/writes with some I/O overhead
    'merklization': 4,           // 2 account updates (2 hashes each)
    'block-verification': 0.021, // Same as compute for re-execution
    'block-distribution': 0.00011, // ~110 bytes tx data = 0.00011 MB
    'state-growth': 0,           // No new state created
    'history-growth': 0.11,      // ~110 bytes in history (KB)
    'proof-generation': 0.021,   // Same as compute
  },

  baseDemand: 20,
  demandVolatility: 0.3,
  priceElasticity: 0.7,

  averageGas: 21000,
  percentOfMainnetTxs: 25,

  color: '#4DABF7',

  feeGwei: 30,  // Moderate fee - basic utility

  notes: 'The benchmark favorite - simple transfers touch random slots so they parallelize perfectly. This is why 100% transfer benchmarks show inflated TPS.',
};
