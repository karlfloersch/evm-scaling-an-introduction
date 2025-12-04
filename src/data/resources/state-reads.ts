import type { Resource } from './types';

/**
 * State Read Operations
 *
 * Reading from blockchain state (SLOAD operations).
 * Limited by database performance and caching.
 */
export const stateReads: Resource = {
  id: 'state-reads',
  name: 'State Reads',
  description:
    'Reading from blockchain state. Limited by disk I/O, database performance, and caching efficiency.',
  unit: 'reads/sec',
  maxThroughput: 500000, // With good SSD and caching
  currentBaseline: 50000, // Conservative estimate for mainnet
  color: '#4DABF7',
  icon: 'database',
  notes:
    'State reads are often cached, so hot paths are much faster than cold paths. Verkle trees can improve this.',
};
