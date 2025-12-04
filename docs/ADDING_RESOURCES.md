# Adding New Resources

Resources represent finite computational limits that constrain blockchain throughput. Examples include CPU execution capacity, state read/write throughput, and network bandwidth.

## Step-by-Step Guide

### 1. Create a new resource file

Create a new file in `src/data/resources/`:

```bash
touch src/data/resources/my-resource.ts
```

### 2. Define the resource

Use the `Resource` interface from `types.ts`:

```typescript
import type { Resource } from './types';

export const myResource: Resource = {
  // Unique identifier (kebab-case)
  id: 'my-resource',

  // Human-readable name
  name: 'My Resource',

  // Brief description
  description: 'What this resource represents and why it matters.',

  // Unit of measurement (e.g., 'Mgas/sec', 'ops/sec', 'MB/sec')
  unit: 'ops/sec',

  // Maximum theoretical throughput with ideal hardware
  maxThroughput: 100000,

  // Current Ethereum mainnet baseline
  currentBaseline: 10000,

  // Hex color for visualizations
  color: '#FF6B6B',

  // Icon name (see types.ts for options)
  icon: 'cpu',

  // Optional notes
  notes: 'Additional context about this resource.',
};
```

### 3. Add to the registry

Edit `src/data/resources/index.ts`:

```typescript
import { myResource } from './my-resource';

export const resources: Resource[] = [
  // ... existing resources
  myResource,
];
```

### 4. Update transaction consumption

If existing transactions should consume this resource, update their `resourceConsumption` in `src/data/transactions/*.ts`:

```typescript
resourceConsumption: {
  'cpu-gas': 21000,
  'my-resource': 1,  // Add consumption for your resource
},
```

## Available Icons

- `cpu` - CPU/processor
- `memory` - RAM/memory
- `database` - Storage/state
- `network` - Networking/bandwidth
- `lock` - Cryptography/security
- `zap` - Speed/optimization
- `hard-drive` - Disk/persistence
- `activity` - General activity

## Guidelines

1. **Be specific**: Each resource should represent a distinct bottleneck
2. **Use realistic baselines**: Reference actual Ethereum mainnet data
3. **Document your sources**: Add links to benchmarks or papers in notes
4. **Consider scaling solutions**: Think about which solutions affect this resource

## Example: Adding Calldata Bandwidth

```typescript
import type { Resource } from './types';

export const calldataBandwidth: Resource = {
  id: 'calldata-bandwidth',
  name: 'Calldata Bandwidth',
  description: 'Calldata that must be included in blocks and propagated across the network.',
  unit: 'KB/sec',
  maxThroughput: 100, // ~100 KB/sec with current limits
  currentBaseline: 15, // ~15 KB/sec average
  color: '#FFA94D',
  icon: 'network',
  notes: 'EIP-4844 blobs provide additional data bandwidth separate from calldata.',
};
```
