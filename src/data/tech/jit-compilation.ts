import type { Tech } from './types';

/**
 * JIT Compilation
 *
 * Just-In-Time compile EVM bytecode to native machine code
 * for faster execution.
 */
export const jitCompilation: Tech = {
  id: 'jit-compilation',
  name: 'JIT Compilation',
  description:
    'Compile EVM bytecode to native code at runtime for faster execution.',
  longDescription: `
    JIT compilation translates EVM bytecode to native machine code,
    which can execute 10-100x faster than interpreted bytecode.

    Hot contracts (frequently called) benefit most as the compilation
    cost is amortized over many executions.

    Approaches:
    - revm with revmc (Rust-based JIT)
    - EVMONE with JIT support
    - Custom AOT compilation for known contracts
  `,
  category: 'execution',

  resourceModifiers: [
    {
      resourceId: 'cpu-gas',
      multiplyThroughput: 3, // ~3x improvement for compute-heavy operations
      explanation: 'Native code executes much faster than interpreted bytecode.',
    },
  ],

  implementationComplexity: 'high',

  securityConsiderations: [
    'JIT must produce identical results to interpreter',
    'Compilation bugs could cause consensus failures',
    'Memory safety of generated code',
  ],

  tradeoffs: [
    'Initial compilation overhead',
    'Memory usage for compiled code cache',
    'Complexity in implementation',
    'Must maintain interpreter as fallback',
  ],

  isComposable: true,
  incompatibleWith: [],

  explanationSlides: ['jit-intro'],

  color: '#4DABF7',
  icon: 'zap',

  references: [
    {
      title: 'revmc - EVM JIT Compiler',
      url: 'https://github.com/paradigmxyz/revmc',
    },
  ],
};
