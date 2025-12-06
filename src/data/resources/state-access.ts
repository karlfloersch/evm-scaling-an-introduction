import type { Resource } from './types';

/**
 * State Access
 *
 * Reading and writing account balances, contract storage slots,
 * and other state data. This is often the primary bottleneck.
 *
 * Includes both cold (first access) and warm (cached) operations.
 */
export const stateAccess: Resource = {
  id: 'state-access',
  name: 'State Access',
  category: 'building',
  description: 'Reading and writing storage slots and account state',
  unit: 'ops/sec',
  maxThroughput: 50000, // ~50k state operations per second
  color: '#f59e0b', // amber
  icon: '💾',
  notes: 'Cold access is much slower than warm access due to disk I/O',
};
