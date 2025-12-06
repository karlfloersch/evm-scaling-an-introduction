import type { Resource } from './types';

/**
 * EVM Compute
 *
 * The raw computational throughput of the EVM - executing opcodes,
 * running precompiles, and performing cryptographic operations.
 *
 * Current Ethereum mainnet: ~2.5 Mgas/sec (30M gas / 12s slot)
 */
export const evmCompute: Resource = {
  id: 'evm-compute',
  name: 'EVM Compute',
  category: 'building',
  description: 'Opcode execution, precompiles, and cryptographic operations',
  unit: 'Mgas/sec',
  maxThroughput: 2.5, // ~30M gas / 12 seconds
  color: '#22c55e', // green
  icon: '⚙️',
  notes: 'This is pure computation - excludes state access overhead',
};
