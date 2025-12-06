import type { TransactionType } from './types';

/**
 * Rollup Batch Submission
 *
 * A rollup posting compressed transaction data to L1.
 * CPU-light but very heavy on block distribution (calldata).
 * Illustrates how different tx types stress different resources.
 */
export const rollupBatch: TransactionType = {
  id: 'rollup-batch',
  name: 'Rollup Batch',
  description: 'L2 rollup posting compressed batch data. Heavy on calldata, light on compute.',
  category: 'infrastructure',

  stateAccess: {
    reads: [
      { type: 'specific', slot: 'rollup:sequencer-inbox' }, // Read inbox state
    ],
    writes: [
      { type: 'specific', slot: 'rollup:sequencer-inbox' }, // Update inbox
    ],
  },

  resourceConsumption: {
    'evm-compute': 0.05,         // 50,000 gas compute (minimal)
    'state-access': 2,           // 1 read + 1 write
    'merklization': 2,           // Just the inbox update
    'block-verification': 0.05,  // Same as compute
    'block-distribution': 100,   // ~100KB of calldata per batch!
    'state-growth': 0,           // No L1 state growth
    'history-growth': 100,       // 100KB of history
    'proof-generation': 0.05,    // Same as compute
  },

  baseDemand: 0.1,  // Few batches per block
  demandVolatility: 0.2,
  priceElasticity: 0.2, // Will pay high fees to post data

  averageGas: 500000, // ~500k gas mostly for calldata

  percentOfMainnetTxs: 1,

  color: '#38BDF8',

  feeGwei: 20,  // Moderate fee - infrastructure pays reliably

  notes: 'Rollup batches show how calldata-heavy transactions stress block distribution differently than compute-heavy transactions.',
};

/**
 * ZK Proof Verification
 *
 * Verifying a ZK proof on-chain (e.g., ZK-rollup validity proof).
 * Very compute-heavy due to cryptographic operations.
 */
export const zkProofVerify: TransactionType = {
  id: 'zk-proof-verify',
  name: 'ZK Proof Verify',
  description: 'Verifying a ZK validity proof. Extremely compute-intensive.',
  category: 'infrastructure',

  stateAccess: {
    reads: [
      { type: 'specific', slot: 'zk-rollup:verifier' }, // Verifier contract
      { type: 'specific', slot: 'zk-rollup:state-root' }, // Current state root
    ],
    writes: [
      { type: 'specific', slot: 'zk-rollup:state-root' }, // Update state root
    ],
  },

  resourceConsumption: {
    'evm-compute': 0.5,          // 500,000 gas = 0.5 Mgas (heavy crypto)
    'state-access': 3,           // 2 reads + 1 write
    'merklization': 4,           // State root update
    'block-verification': 0.5,   // Same as compute
    'block-distribution': 0.5,   // ~500 bytes proof data
    'state-growth': 0,           // No state growth
    'history-growth': 0.5,       // ~500 bytes in history
    'proof-generation': 0.5,     // Same as compute
  },

  baseDemand: 0.01, // Very few per block
  demandVolatility: 0.1,
  priceElasticity: 0.1, // Will pay any price

  averageGas: 500000,

  percentOfMainnetTxs: 0.1,

  color: '#A78BFA',

  feeGwei: 25,  // Will pay any price - critical infrastructure

  notes: 'ZK proof verification is the most compute-intensive operation. Custom precompiles can dramatically reduce this cost.',
};
