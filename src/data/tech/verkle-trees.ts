import type { Tech } from './types';

/**
 * Verkle Trees
 *
 * Replace Merkle Patricia Tries with Verkle trees for smaller proofs
 * and more efficient state access.
 */
export const verkleTrees: Tech = {
  id: 'verkle-trees',
  name: 'Verkle Trees',
  description:
    'Replace Merkle trees with Verkle trees for smaller proofs and faster access.',
  longDescription: `
    Verkle trees use vector commitments instead of hash-based commitments.
    This enables much smaller proofs (~150 bytes vs ~1KB for Merkle proofs)
    and more efficient state access patterns.

    Benefits:
    - Smaller witness sizes for stateless clients
    - Flatter tree structure = fewer disk reads
    - Better caching due to structure
    - Enables true stateless validation

    This is a consensus-level change requiring a hard fork.
  `,
  category: 'storage',

  resourceModifiers: [
    {
      resourceId: 'state-reads',
      multiplyThroughput: 2, // Fewer disk reads needed
      explanation: 'Flatter tree structure reduces disk reads per state access.',
    },
    {
      resourceId: 'bandwidth',
      reduceConsumption: 0.3, // 70% smaller proofs
      explanation: 'Verkle proofs are ~70% smaller than Merkle proofs.',
    },
  ],

  implementationComplexity: 'very-high',

  securityConsiderations: [
    'New cryptographic assumptions (polynomial commitments)',
    'Requires careful migration of existing state',
    'New attack surfaces from different tree structure',
  ],

  tradeoffs: [
    'Requires hard fork',
    'Complex migration from MPT',
    'Different security assumptions',
    'One-time conversion cost',
  ],

  isComposable: true,
  incompatibleWith: [],

  explanationSlides: ['verkle-intro'],

  color: '#69DB7C',
  icon: 'database',

  references: [
    {
      title: 'Verkle Trees - Vitalik',
      url: 'https://vitalik.eth.limo/general/2021/06/18/verkle.html',
    },
  ],
};
