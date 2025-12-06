import type { TransactionType } from './types';

/**
 * NFT Mint (Popular Collection)
 *
 * Minting an NFT from a popular collection.
 * The supply counter is a HOT SLOT - all mints from the same collection
 * must execute sequentially because they all increment the same counter.
 */
export const nftMint: TransactionType = {
  id: 'nft-mint',
  name: 'NFT Mint',
  description: 'Minting an NFT. Supply counter is a hot slot - all mints conflict.',
  category: 'nft',

  stateAccess: {
    reads: [
      { type: 'specific', slot: 'nft:popular-collection:supply' }, // Read current supply
      { type: 'sender' }, // Check sender can mint
    ],
    writes: [
      { type: 'specific', slot: 'nft:popular-collection:supply' }, // Increment supply
      { type: 'random', namespace: 'nft:popular-collection:tokens' }, // Create new token
      { type: 'sender' }, // Update sender's ownership
    ],
  },

  resourceConsumption: {
    'evm-compute': 0.1,          // 100,000 gas = 0.1 Mgas
    'state-access': 200,         // Token creation, ownership mapping - moderate I/O
    'merklization': 16,          // Multiple storage updates + token creation
    'block-verification': 0.1,   // Same as compute
    'block-distribution': 0.5,   // ~500 bytes (includes metadata)
    'state-growth': 0.25,        // New token storage slot created
    'history-growth': 0.5,       // ~500 bytes in history
    'proof-generation': 0.1,     // Same as compute
  },

  baseDemand: 2,
  demandVolatility: 0.95, // Extreme spikes during drops
  priceElasticity: 0.3,   // Will pay high fees for popular mints

  averageGas: 100000,
  percentOfMainnetTxs: 5,

  color: '#9775FA',

  feeGwei: 100,  // High fee - will pay premium for popular drops

  notes: 'NFT mints from the same collection conflict on the supply counter. This is why NFT drops cause congestion even with parallelism.',
};

/**
 * NFT Transfer
 *
 * Transferring an existing NFT between accounts.
 * Unlike mints, transfers only touch the specific token being transferred,
 * so different token transfers can parallelize.
 */
export const nftTransfer: TransactionType = {
  id: 'nft-transfer',
  name: 'NFT Transfer',
  description: 'Transferring an NFT between accounts. Can parallelize for different tokens.',
  category: 'nft',

  stateAccess: {
    reads: [
      { type: 'random', namespace: 'nft:tokens:ownership' }, // Token ownership
      { type: 'sender' }, // Sender's token list
    ],
    writes: [
      { type: 'random', namespace: 'nft:tokens:ownership' }, // Update ownership
      { type: 'sender' }, // Update sender's list
      { type: 'receiver' }, // Update receiver's list
    ],
  },

  resourceConsumption: {
    'evm-compute': 0.08,         // 80,000 gas = 0.08 Mgas
    'state-access': 150,         // Ownership mapping updates - moderate I/O
    'merklization': 12,          // Storage updates
    'block-verification': 0.08,  // Same as compute
    'block-distribution': 0.3,   // ~300 bytes tx data
    'state-growth': 0,           // No new state (just ownership change)
    'history-growth': 0.3,       // ~300 bytes in history
    'proof-generation': 0.08,    // Same as compute
  },

  baseDemand: 3,
  demandVolatility: 0.5,
  priceElasticity: 0.6,

  averageGas: 80000,
  percentOfMainnetTxs: 3,

  color: '#CE93D8',

  feeGwei: 50,  // Moderate fee - less time-sensitive than mints

  notes: 'Unlike mints, NFT transfers of different tokens can run in parallel.',
};
