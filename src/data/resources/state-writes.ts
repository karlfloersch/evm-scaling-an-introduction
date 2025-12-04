import type { Resource } from './types';

/**
 * State Write Operations
 *
 * Writing to blockchain state (SSTORE operations).
 * More expensive than reads due to persistence requirements.
 */
export const stateWrites: Resource = {
  id: 'state-writes',
  name: 'State Writes',
  description:
    'Writing to blockchain state. Limited by disk I/O and the need for persistent storage with crash consistency.',
  unit: 'writes/sec',
  maxThroughput: 100000, // With NVMe SSD
  currentBaseline: 10000, // Conservative estimate
  color: '#9775FA',
  icon: 'hard-drive',
  notes:
    'State writes are inherently more expensive than reads. State expiry and history expiry can help reduce write pressure.',
};
