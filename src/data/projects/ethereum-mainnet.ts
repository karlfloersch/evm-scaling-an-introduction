import type { Project } from './types';

/**
 * Ethereum Mainnet
 *
 * The baseline - current Ethereum L1 with no special scaling.
 */
export const ethereumMainnet: Project = {
  id: 'ethereum-mainnet',
  name: 'Ethereum Mainnet',
  description:
    'Current Ethereum L1 - the baseline for comparison.',
  website: 'https://ethereum.org',

  techStack: ['baseline-evm'], // The baseline tech

  claimedMetrics: {
    tps: 15, // Roughly 15 TPS depending on gas usage
    gasPerSecond: 1250000, // 15M gas / 12 sec
    blockTime: 12,
    finality: 384, // ~6.4 minutes for finality
  },

  status: 'mainnet',

  benchmarkDetails: {
    transactionMix: {
      'eth-transfer': 25,
      'erc20-transfer': 20,
      'uniswap-swap': 8,
      'nft-mint': 5,
    },
    conditions: 'Real-world mainnet conditions',
    methodology: 'Observed on-chain data',
    source: 'Etherscan, on-chain analytics',
  },

  color: '#627EEA',

  notes: 'The baseline. All other projects should be compared to this.',

  lastUpdated: '2024-12-01',
};
