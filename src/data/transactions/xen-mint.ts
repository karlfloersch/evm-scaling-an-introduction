import type { TransactionType } from './types';

/**
 * XEN Crypto Free Mint
 *
 * XEN was a "free mint" token that consumed enormous state resources
 * because each mint creates new storage slots for the token balances
 * and tracking data. The minting was "free" (no token price), so users
 * only paid the base gas fee - making it extremely underpriced relative
 * to the state bloat it caused.
 *
 * This is a perfect example of how a single resource (state) can be
 * consumed by low-value transactions, blocking higher-value ones.
 */
export const xenMint: TransactionType = {
  id: 'xen-mint',
  name: 'XEN Mint',
  description: 'Free mint token - extremely high state usage, very low fee.',
  category: 'other',

  stateAccess: {
    reads: [
      { type: 'specific', slot: 'xen:global-rank' },    // Global rank counter
      { type: 'specific', slot: 'xen:total-supply' },   // Total supply
      { type: 'sender' },                               // Sender balance
    ],
    writes: [
      { type: 'specific', slot: 'xen:global-rank' },    // Increment rank
      { type: 'specific', slot: 'xen:total-supply' },   // Increment supply
      { type: 'random', namespace: 'xen:mint-info' },   // New mint tracking slot
      { type: 'random', namespace: 'xen:stake-info' },  // New stake tracking slot
      { type: 'sender' },                               // New balance entry
    ],
  },

  resourceConsumption: {
    'evm-compute': 0.02,          // 20,000 gas (low compute)
    'state-access': 2500,         // EXTREMELY HIGH - 2500 state operations per tx!
    'merklization': 200,          // Many new storage slots to hash
    'block-verification': 0.02,   // Same as compute
    'block-distribution': 0.2,    // ~200 bytes tx data
    'state-growth': 0.5,          // Some new state per mint
    'history-growth': 0.2,        // ~200 bytes in history
    'proof-generation': 0.02,     // Same as compute
  },

  baseDemand: 50,
  demandVolatility: 0.9,   // Extremely spiky during "free mint" events
  priceElasticity: 0.95,   // Very elastic - people only mint when gas is low

  averageGas: 20000,  // Low gas, massive state impact
  percentOfMainnetTxs: 0.5,

  color: '#666666',  // Gray - "worthless" transactions

  feeGwei: 5,  // Very low fee - just base gas

  notes: 'The poster child for state bloat. Free mints consumed massive state while paying minimal fees, demonstrating why single-dimensional gas pricing fails.',
};
