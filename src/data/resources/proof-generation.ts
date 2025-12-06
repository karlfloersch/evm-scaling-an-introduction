import type { Resource } from './types';

/**
 * Proof Generation
 *
 * The throughput of generating ZK proofs for block execution.
 * Critical for ZK rollups and future ZK-EVM implementations.
 *
 * Currently much slower than native execution, but improving rapidly.
 */
export const proofGeneration: Resource = {
  id: 'proof-generation',
  name: 'Proof Generation',
  category: 'proving',
  description: 'ZK proof generation throughput',
  unit: 'Mgas/sec',
  maxThroughput: 2.5, // Matches EVM compute for educational demo; real-world varies widely
  color: '#a855f7', // violet
  icon: '🔐',
  notes: 'Real-world proving is 10-100x slower, but improving rapidly with RISC-V and custom circuits',
};
