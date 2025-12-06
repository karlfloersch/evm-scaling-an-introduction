import type { Resource } from './types';

/**
 * History Growth
 *
 * The rate at which historical data (blocks, receipts, logs) accumulates.
 * Archive nodes must store all of this; full nodes can prune older data.
 *
 * Expressed as max acceptable growth per second.
 */
export const historyGrowth: Resource = {
  id: 'history-growth',
  name: 'History Growth',
  category: 'sync-archive',
  description: 'Rate of block and receipt data accumulation',
  unit: 'KB/sec',
  maxThroughput: 100, // ~100 KB/sec = ~3 TB/year
  color: '#06b6d4', // cyan
  icon: '📚',
  notes: 'EIP-4444 proposes history expiry to reduce storage requirements',
};
