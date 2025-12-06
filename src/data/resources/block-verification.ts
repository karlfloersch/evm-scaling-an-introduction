import type { Resource } from './types';

/**
 * Block Verification
 *
 * The cost of re-executing a block to verify its correctness.
 * Validators and full nodes must verify every block they receive.
 *
 * This should be roughly equal to or faster than block building
 * to maintain decentralization.
 */
export const blockVerification: Resource = {
  id: 'block-verification',
  name: 'Block Verification',
  category: 'verification',
  description: 'Re-executing blocks to verify correctness',
  unit: 'Mgas/sec',
  maxThroughput: 2.5, // Should match or exceed building speed
  color: '#3b82f6', // blue
  icon: '✅',
  notes: 'Must be fast enough for validators to verify within slot time',
};
