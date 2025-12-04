import type { Resource } from './types';

/**
 * Cryptographic Verification
 *
 * ECDSA signature verification, hash computations, etc.
 * Can be parallelized and hardware-accelerated.
 */
export const verification: Resource = {
  id: 'verification',
  name: 'Crypto Verification',
  description:
    'Cryptographic operations like signature verification and hashing. Can be parallelized across cores.',
  unit: 'verifications/sec',
  maxThroughput: 50000, // With parallel verification
  currentBaseline: 5000, // Single-threaded baseline
  color: '#FFA94D',
  icon: 'lock',
  notes:
    'Signature aggregation (BLS) and batching can dramatically reduce verification overhead.',
};
