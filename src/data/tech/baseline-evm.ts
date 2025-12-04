import type { Tech, ResourceConsumption, SimulationContext } from './types';
import type { Resource } from '@/data/resources/types';
import type { TransactionType } from '@/data/transactions/types';

/**
 * Baseline EVM (No Scaling)
 *
 * This represents the current Ethereum execution model:
 * - Single execution thread
 * - All transactions execute sequentially
 * - Throughput limited by single-threaded gas/sec
 *
 * This is the baseline that all other tech builds upon.
 */
export const baselineEvm: Tech = {
  id: 'baseline-evm',
  name: 'Baseline EVM',
  description: 'Standard single-threaded EVM execution. The baseline for comparison.',
  longDescription: `
    The baseline EVM model represents current Ethereum execution:

    - **Single execution lane**: All transactions execute one at a time
    - **Sequential processing**: Even independent transactions must wait
    - **Gas-limited throughput**: ~2.5 Mgas/sec on current mainnet

    This is the starting point. All other tech modifies this baseline
    by either adding more execution capacity or reducing resource consumption.
  `,
  category: 'execution',

  defineResources: (): Resource[] => [
    {
      id: 'gas',
      name: 'Block Gas',
      description: 'Single-threaded gas execution capacity',
      unit: 'Mgas/sec',
      maxThroughput: 60, // Theoretical max on modern hardware
      currentBaseline: 2.5, // ~15M gas / 12 sec with some overhead
      color: '#FF6B6B',
      icon: 'cpu',
      notes: 'The fundamental execution bottleneck in the base EVM.',
    },
  ],

  calculateConsumption: (
    tx: TransactionType,
    _baseConsumption: ResourceConsumption,
    _context: SimulationContext
  ): ResourceConsumption => {
    // Simple: all gas goes to the single 'gas' resource
    return {
      gas: tx.averageGas / 1_000_000, // Convert to Mgas
    };
  },

  // Legacy modifiers (empty since we use defineResources/calculateConsumption)
  resourceModifiers: [],

  implementationComplexity: 'low',

  securityConsiderations: [
    'Well-tested and battle-hardened over years',
    'Simple sequential model is easy to reason about',
  ],

  tradeoffs: [
    'Single-threaded bottleneck limits throughput',
    'Cannot take advantage of multi-core hardware',
    'All transactions compete for the same execution slot',
  ],

  isComposable: true,
  incompatibleWith: [],

  explanationSlides: ['base-evm-intro'],

  color: '#627EEA', // Ethereum blue
  icon: 'cpu',

  parameters: [
    {
      id: 'gasPerSecond',
      name: 'Gas per Second',
      description: 'Baseline gas throughput (Mgas/sec)',
      type: 'number',
      default: 2.5,
      min: 0.5,
      max: 10,
    },
  ],

  references: [
    {
      title: 'Ethereum Yellow Paper',
      url: 'https://ethereum.github.io/yellowpaper/paper.pdf',
    },
  ],
};
