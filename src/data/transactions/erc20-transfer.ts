import type { TransactionType } from './types';

/**
 * ERC-20 Token Transfer
 *
 * Transferring tokens like USDC, USDT, etc.
 * More state-heavy than ETH transfers but still parallelizable
 * because each transfer touches unique user balance slots.
 */
export const erc20Transfer: TransactionType = {
  id: 'erc20-transfer',
  name: 'ERC-20 Transfer',
  description: 'Token transfer (USDC, USDT, etc.). More state operations than ETH transfer.',
  category: 'transfer',

  stateAccess: {
    reads: [
      { type: 'sender' },   // Read sender token balance
      { type: 'receiver' }, // Read receiver token balance
      { type: 'random', namespace: 'token:allowances' }, // Check allowance (if transferFrom)
    ],
    writes: [
      { type: 'sender' },   // Update sender balance
      { type: 'receiver' }, // Update receiver balance
    ],
  },

  resourceConsumption: {
    'evm-compute': 0.065,        // 65,000 gas = 0.065 Mgas
    'state-access': 150,         // Token balance reads/writes with I/O overhead
    'merklization': 8,           // 2 storage + 2 balance updates
    'block-verification': 0.065, // Same as compute
    'block-distribution': 0.14,  // ~140 bytes tx data
    'state-growth': 0,           // Usually no new state
    'history-growth': 0.14,      // ~140 bytes in history
    'proof-generation': 0.065,   // Same as compute
  },

  baseDemand: 15,
  demandVolatility: 0.4,
  priceElasticity: 0.6,

  averageGas: 65000,
  percentOfMainnetTxs: 20,

  color: '#69DB7C',

  feeGwei: 40,  // Higher fee - important financial utility

  notes: 'Stablecoin transfers are a large portion of chain activity. Like ETH transfers, they parallelize well.',
};
