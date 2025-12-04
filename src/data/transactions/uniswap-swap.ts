import type { TransactionType } from './types';

/**
 * Uniswap ETH/USDC Swap
 *
 * Token swap on Uniswap V3 for the ETH/USDC pair.
 * This is a HOT SLOT - all swaps on this pool touch the same state,
 * so they CANNOT be parallelized with each other.
 */
export const uniswapSwapEthUsdc: TransactionType = {
  id: 'uniswap-swap-eth-usdc',
  name: 'Swap ETH/USDC',
  description: 'Uniswap V3 swap on the most popular ETH/USDC pool. Hot slot - cannot parallelize.',
  category: 'defi',

  stateAccess: {
    reads: [
      { type: 'specific', slot: 'pool:uniswap-v3-eth-usdc' }, // Pool state
      { type: 'specific', slot: 'pool:uniswap-v3-eth-usdc:ticks' }, // Tick data
      { type: 'sender' }, // User balances
    ],
    writes: [
      { type: 'specific', slot: 'pool:uniswap-v3-eth-usdc' }, // Update pool reserves
      { type: 'sender' }, // Update user balances
    ],
  },

  resourceConsumption: {
    'cpu-gas': 150000,
    'state-reads': 12,
    'state-writes': 6,
    'verification': 1,
  },

  baseDemand: 3,
  demandVolatility: 0.8,
  priceElasticity: 0.5,

  averageGas: 150000,
  percentOfMainnetTxs: 5,

  color: '#FF6B9D',

  notes: 'The most popular DEX pool. ALL swaps on this pool conflict - they must execute sequentially even with parallel execution enabled.',
};

/**
 * Uniswap ETH/DAI Swap
 *
 * Swap on a different pool than ETH/USDC.
 * Can run in parallel with ETH/USDC swaps, but conflicts with other ETH/DAI swaps.
 */
export const uniswapSwapEthDai: TransactionType = {
  id: 'uniswap-swap-eth-dai',
  name: 'Swap ETH/DAI',
  description: 'Uniswap V3 swap on ETH/DAI pool. Different pool from ETH/USDC.',
  category: 'defi',

  stateAccess: {
    reads: [
      { type: 'specific', slot: 'pool:uniswap-v3-eth-dai' },
      { type: 'specific', slot: 'pool:uniswap-v3-eth-dai:ticks' },
      { type: 'sender' },
    ],
    writes: [
      { type: 'specific', slot: 'pool:uniswap-v3-eth-dai' },
      { type: 'sender' },
    ],
  },

  resourceConsumption: {
    'cpu-gas': 150000,
    'state-reads': 12,
    'state-writes': 6,
    'verification': 1,
  },

  baseDemand: 1,
  demandVolatility: 0.7,
  priceElasticity: 0.5,

  averageGas: 150000,
  percentOfMainnetTxs: 2,

  color: '#F9A825',

  notes: 'Different pool from ETH/USDC - can run in parallel with ETH/USDC swaps but not with other ETH/DAI swaps.',
};
