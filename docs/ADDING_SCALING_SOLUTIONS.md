# Adding New Scaling Solutions

Scaling solutions represent techniques that improve blockchain throughput by modifying resource availability or consumption.

## Step-by-Step Guide

### 1. Create a new scaling solution file

Create a new file in `src/data/scaling-solutions/`:

```bash
touch src/data/scaling-solutions/my-solution.ts
```

### 2. Define the scaling solution

Use the `ScalingSolution` interface from `types.ts`:

```typescript
import type { ScalingSolution } from './types';

export const mySolution: ScalingSolution = {
  // Unique identifier (kebab-case)
  id: 'my-solution',

  // Human-readable name
  name: 'My Scaling Solution',

  // Short description for cards/lists
  description: 'Brief explanation of what this solution does.',

  // Detailed explanation for deep-dive slides
  longDescription: `
    Detailed explanation with multiple paragraphs.

    Include:
    - How it works technically
    - Key techniques used
    - When it helps most
  `,

  // Category (see types.ts for options)
  category: 'execution',

  // How this solution modifies resources
  resourceModifiers: [
    {
      resourceId: 'cpu-gas',
      multiplyThroughput: 4,  // 4x improvement
      condition: {
        parallelizable: true,  // Only for parallel-safe TXs
      },
      explanation: 'Multiplies CPU capacity for parallelizable transactions.',
    },
  ],

  // Implementation difficulty
  implementationComplexity: 'high',

  // Security risks to consider
  securityConsiderations: [
    'Risk 1',
    'Risk 2',
  ],

  // Limitations and trade-offs
  tradeoffs: [
    'Tradeoff 1',
    'Tradeoff 2',
  ],

  // Can this be combined with other solutions?
  isComposable: true,

  // IDs of incompatible solutions
  incompatibleWith: [],

  // Slide IDs that explain this solution
  explanationSlides: ['my-solution-intro'],

  // Color for visualizations
  color: '#4DABF7',

  // Icon name
  icon: 'cpu',

  // Optional references
  references: [
    {
      title: 'Paper or Documentation',
      url: 'https://example.com',
    },
  ],
};
```

### 3. Add to the registry

Edit `src/data/scaling-solutions/index.ts`:

```typescript
import { mySolution } from './my-solution';

export const scalingSolutions: ScalingSolution[] = [
  // ... existing solutions
  mySolution,
];
```

## Resource Modifiers

Each modifier describes how the solution affects a specific resource:

### Multiply Throughput

Increase the resource's effective capacity:

```typescript
{
  resourceId: 'cpu-gas',
  multiplyThroughput: 4,  // 4x more capacity
}
```

### Add Throughput

Add flat throughput (useful for additional hardware):

```typescript
{
  resourceId: 'verification',
  addThroughput: 10000,  // +10k verifications/sec
}
```

### Reduce Consumption

Reduce how much of a resource each transaction uses:

```typescript
{
  resourceId: 'bandwidth',
  reduceConsumption: 0.3,  // 70% smaller proofs
}
```

### Conditional Modifiers

Apply only to specific transaction types or properties:

```typescript
{
  resourceId: 'cpu-gas',
  multiplyThroughput: 4,
  condition: {
    parallelizable: true,  // Only parallel-safe TXs benefit
  },
}

{
  resourceId: 'state-reads',
  multiplyThroughput: 2,
  condition: {
    transactionTypes: ['eth-transfer', 'erc20-transfer'],  // Only these types
  },
}
```

## Solution Categories

- `execution` - Parallel execution, JIT compilation, optimistic execution
- `storage` - State management, Verkle trees, state expiry
- `networking` - Data availability, sharding, compression
- `cryptography` - Signature aggregation, ZK proofs, SNARKs
- `consensus` - Consensus optimizations, faster finality
- `hardware` - Hardware acceleration, GPUs, custom silicon

## Implementation Complexity

- `low` - Can be implemented by modifying existing code
- `medium` - Requires new subsystems or significant changes
- `high` - Requires major architectural changes
- `very-high` - Requires protocol changes or hard forks

## Example: Adding State Expiry

```typescript
import type { ScalingSolution } from './types';

export const stateExpiry: ScalingSolution = {
  id: 'state-expiry',
  name: 'State Expiry',
  description: 'Remove inactive state to reduce storage requirements.',
  longDescription: `
    State expiry automatically removes state that hasn't been accessed
    for a certain period. Expired state can be resurrected by providing
    a proof of its previous existence.

    Benefits:
    - Reduces active state size
    - Improves state access performance
    - Enables sustainable state growth

    This requires a hard fork and introduces complexity for users
    who need to resurrect expired state.
  `,
  category: 'storage',

  resourceModifiers: [
    {
      resourceId: 'state-reads',
      multiplyThroughput: 1.5,
      explanation: 'Smaller active state set improves cache hit rates.',
    },
    {
      resourceId: 'state-writes',
      multiplyThroughput: 1.3,
      explanation: 'Less state to maintain reduces write amplification.',
    },
  ],

  implementationComplexity: 'very-high',

  securityConsiderations: [
    'Users must track their state expiry',
    'Resurrection proofs add complexity',
    'Historical state must be preserved somewhere',
  ],

  tradeoffs: [
    'Requires hard fork',
    'Users may lose access to expired state',
    'Adds UX complexity for state resurrection',
    'Archive nodes still need full history',
  ],

  isComposable: true,
  incompatibleWith: [],

  explanationSlides: ['state-expiry-intro'],

  color: '#69DB7C',
  icon: 'database',

  references: [
    {
      title: 'State Expiry EIP',
      url: 'https://eips.ethereum.org/EIPS/eip-4444',
    },
  ],
};
```

## Tips

1. **Be realistic about improvements**: Don't claim 100x without evidence
2. **Consider conditions**: Most improvements only apply in certain situations
3. **Document trade-offs**: Every optimization has costs
4. **Link to sources**: Include papers, EIPs, or implementation docs
5. **Think about composability**: Can this combine with other solutions?
