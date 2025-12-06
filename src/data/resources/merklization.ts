import type { Resource } from './types';

/**
 * Merklization
 *
 * Computing the state root by updating the Merkle Patricia Trie.
 * Currently in the hot path for block building, adding ~15% to block times.
 *
 * This is a major target for optimization (delayed state root, verkle trees).
 */
export const merklization: Resource = {
  id: 'merklization',
  name: 'Merklization',
  category: 'building',
  description: 'State root calculation via Merkle Patricia Trie updates',
  unit: 'hashes/sec',
  maxThroughput: 100000, // ~100k hash operations per second
  color: '#eab308', // yellow
  icon: '🌳',
  notes: 'Currently adds ~15% overhead to block building. EIP-7862 proposes deferring this.',
};
