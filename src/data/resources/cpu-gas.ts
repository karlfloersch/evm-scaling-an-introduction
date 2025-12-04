import type { Resource } from './types';

/**
 * Single-threaded CPU Gas Execution
 *
 * The primary execution resource - how many gas units can be
 * processed per second on a single CPU thread.
 */
export const cpuGas: Resource = {
  id: 'cpu-gas',
  name: 'CPU Execution',
  description:
    'Single-threaded gas execution capacity. The fundamental bottleneck for most EVM operations.',
  unit: 'Mgas/sec',
  maxThroughput: 60, // Theoretical max ~60 Mgas/sec on modern hardware
  currentBaseline: 2.5, // ~15M gas / 12 sec = 1.25 Mgas/sec, but let's say ~2.5 with improvements
  color: '#FF6B6B',
  icon: 'cpu',
  notes:
    'This is the most common bottleneck. Parallelism can add multiple lanes but each lane is still limited.',
};
