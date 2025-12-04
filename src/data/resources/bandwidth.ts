import type { Resource } from './types';

/**
 * Network Bandwidth
 *
 * Data that needs to be propagated across the network.
 * With PeerDAS this is becoming less of a bottleneck.
 */
export const bandwidth: Resource = {
  id: 'bandwidth',
  name: 'Network Bandwidth',
  description:
    'Data throughput across the p2p network. Includes block propagation, transaction gossip, and blob data.',
  unit: 'MB/sec',
  maxThroughput: 10, // Post-PeerDAS target
  currentBaseline: 0.5, // ~0.5 MB/sec current effective throughput
  color: '#69DB7C',
  icon: 'network',
  notes:
    'PeerDAS significantly increases bandwidth capacity by distributing blob data sampling across nodes.',
};
