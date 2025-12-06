/**
 * Transaction Type Registry
 *
 * This file exports all available transaction types for the simulation.
 * To add a new transaction type, create a file and import it here.
 */

import { ethTransfer } from './eth-transfer';
import { erc20Transfer } from './erc20-transfer';
import { uniswapSwapEthUsdc, uniswapSwapEthDai } from './uniswap-swap';
import { nftMint, nftTransfer } from './nft-mint';
import { rollupBatch, zkProofVerify } from './rollup-batch';
import { xenMint } from './xen-mint';
import type { TransactionType } from './types';

export * from './types';

/**
 * All available transaction types
 */
export const transactionTypes: TransactionType[] = [
  ethTransfer,
  erc20Transfer,
  uniswapSwapEthUsdc,
  uniswapSwapEthDai,
  nftMint,
  nftTransfer,
  rollupBatch,
  zkProofVerify,
  xenMint,
];

/**
 * Transaction type lookup by ID
 */
export const transactionTypesById: Record<string, TransactionType> =
  Object.fromEntries(transactionTypes.map((t) => [t.id, t]));

/**
 * Default transaction types to include in simulations
 */
export const defaultTransactionTypes: TransactionType[] = [
  ethTransfer,
  erc20Transfer,
  uniswapSwapEthUsdc,
  nftMint,
];

/**
 * Get a transaction type by ID
 */
export function getTransactionType(id: string): TransactionType | undefined {
  return transactionTypesById[id];
}

/**
 * Get a realistic mainnet transaction mix
 * Returns transaction type IDs mapped to percentages
 */
export function getRealisticTransactionMix(): Record<string, number> {
  return Object.fromEntries(
    transactionTypes.map((t) => [t.id, t.percentOfMainnetTxs])
  );
}

/**
 * Calculate weighted average gas for a transaction mix
 */
export function calculateAverageGas(mix: Record<string, number>): number {
  let totalGas = 0;
  let totalPercent = 0;

  for (const [txId, percent] of Object.entries(mix)) {
    const txType = transactionTypesById[txId];
    if (txType) {
      totalGas += txType.averageGas * percent;
      totalPercent += percent;
    }
  }

  return totalPercent > 0 ? totalGas / totalPercent : 0;
}

/**
 * Get all unique hot slots across transaction types
 */
export function getAllHotSlots(): string[] {
  const slots = new Set<string>();
  for (const tx of transactionTypes) {
    for (const access of [...tx.stateAccess.reads, ...tx.stateAccess.writes]) {
      if (access.type === 'specific') {
        slots.add(access.slot);
      }
    }
  }
  return Array.from(slots);
}

/**
 * Group transaction types by the hot slots they access
 */
export function groupByHotSlot(): Record<string, TransactionType[]> {
  const groups: Record<string, TransactionType[]> = {};

  for (const tx of transactionTypes) {
    for (const access of [...tx.stateAccess.reads, ...tx.stateAccess.writes]) {
      if (access.type === 'specific') {
        if (!groups[access.slot]) {
          groups[access.slot] = [];
        }
        if (!groups[access.slot].includes(tx)) {
          groups[access.slot].push(tx);
        }
      }
    }
  }

  return groups;
}
