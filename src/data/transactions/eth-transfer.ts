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
    'cpu-gas': 21000,
    'state-reads': 2,
    'state-writes': 2,
    'verification': 1,
  },

  baseDemand: 20,
  demandVolatility: 0.3,
  priceElasticity: 0.7,

  averageGas: 21000,
  percentOfMainnetTxs: 25,

  color: '#4DABF7',

  notes: 'The benchmark favorite - simple transfers touch random slots so they parallelize perfectly. This is why 100% transfer benchmarks show inflated TPS.',
};
