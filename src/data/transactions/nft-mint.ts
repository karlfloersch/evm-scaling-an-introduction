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
    'cpu-gas': 100000,
    'state-reads': 5,
    'state-writes': 4,
    'verification': 1,
  },

  baseDemand: 2,
  demandVolatility: 0.95, // Extreme spikes during drops
  priceElasticity: 0.3,   // Will pay high fees for popular mints

  averageGas: 100000,
  percentOfMainnetTxs: 5,

  color: '#9775FA',

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
    'cpu-gas': 80000,
    'state-reads': 4,
    'state-writes': 3,
    'verification': 1,
  },

  baseDemand: 3,
  demandVolatility: 0.5,
  priceElasticity: 0.6,

  averageGas: 80000,
  percentOfMainnetTxs: 3,

  color: '#CE93D8',

  notes: 'Unlike mints, NFT transfers of different tokens can run in parallel.',
};
