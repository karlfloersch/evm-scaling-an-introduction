import type { Tech } from './types';

/**
 * Optimistic/Speculative Execution
 *
 * Begin executing transactions before the previous block is finalized.
 * Pipelines execution to hide latency.
 */
export const optimisticExecution: Tech = {
  id: 'optimistic-execution',
  name: 'Optimistic Execution',
  description:
    'Start executing the next block speculatively while the current block finalizes.',
  longDescription: `
    Optimistic execution pipelines block production by beginning to execute
    transactions before we know the exact state they'll execute against.

    When a new block arrives:
    1. Start executing transactions against predicted state
    2. If prediction was correct, execution is already done
    3. If wrong, re-execute only affected transactions

    This hides the latency of consensus and state root computation,
    effectively increasing throughput during steady-state operation.
  `,
  category: 'execution',

  resourceModifiers: [
    {
      resourceId: 'cpu-gas',
      multiplyThroughput: 1.5, // ~50% improvement from pipelining
      explanation: 'Pipelining hides latency, effectively increasing throughput.',
    },
  ],

  implementationComplexity: 'high',

  securityConsiderations: [
    'Mis-predictions waste compute resources',
    'State root computation must still be done correctly',
    'Careful handling of chain reorgs',
  ],

  tradeoffs: [
    'Wasted work on mis-predictions',
    'More complex state management',
    'Higher memory usage for speculative state',
    'Benefits decrease under high contention',
  ],

  isComposable: true,
  incompatibleWith: [],

  explanationSlides: ['optimistic-intro'],

  color: '#FFA94D',
  icon: 'zap',

  references: [
    {
      title: 'Monad: Optimistic Execution',
      url: 'https://docs.monad.xyz/',
    },
  ],
};
