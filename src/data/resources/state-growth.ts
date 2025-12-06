import type { Resource } from './types';

/**
 * State Growth
 *
 * The rate at which new state (accounts, storage slots) accumulates.
 * High growth rates make it harder to run full nodes over time.
 *
 * Expressed as max acceptable growth per second to normalize with other resources.
 */
export const stateGrowth: Resource = {
  id: 'state-growth',
  name: 'State Growth',
  category: 'sync-archive',
  description: 'Rate of new state accumulation',
  unit: 'KB/sec',
  maxThroughput: 50, // ~50 KB/sec = ~1.5 TB/year
  color: '#ec4899', // pink
  icon: '📈',
  notes: 'State expiry could reduce this by removing old unused state',
};
