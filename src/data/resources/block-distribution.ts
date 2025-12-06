import type { Resource } from './types';

/**
 * Block Distribution
 *
 * Network bandwidth for propagating blocks across the p2p network.
 * Larger blocks take longer to propagate, increasing orphan risk.
 *
 * Includes block headers, transactions, and any attached data (blobs).
 */
export const blockDistribution: Resource = {
  id: 'block-distribution',
  name: 'Block Distribution',
  category: 'verification',
  description: 'Propagating blocks across the network',
  unit: 'MB/sec',
  maxThroughput: 10, // ~10 MB/sec reasonable for global propagation
  color: '#8b5cf6', // purple
  icon: '📡',
  notes: 'Latency-sensitive - affects consensus and MEV dynamics',
};
