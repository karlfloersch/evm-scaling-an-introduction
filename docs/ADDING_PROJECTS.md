# Adding New Projects

Projects represent real blockchain implementations that use various scaling solutions. They're used for comparison and to validate our simulation model against real-world claims.

## Step-by-Step Guide

### 1. Create a new project file

Create a new file in `src/data/projects/`:

```bash
touch src/data/projects/my-project.ts
```

### 2. Define the project

Use the `Project` interface from `types.ts`:

```typescript
import type { Project } from './types';

export const myProject: Project = {
  // Unique identifier (kebab-case)
  id: 'my-project',

  // Project name
  name: 'My Project',

  // Brief description
  description: 'Short description of what this project does.',

  // Official website
  website: 'https://myproject.io',

  // Optional logo URL
  logo: 'https://myproject.io/logo.png',

  // IDs of scaling solutions used (from src/data/scaling-solutions/)
  scalingSolutions: [
    'parallelism',
    'jit-compilation',
  ],

  // Custom resource overrides (optional)
  // Use when project has unique optimizations not captured by solutions
  customResourceOverrides: {
    'cpu-gas': 100,  // Override effective max throughput
  },

  // Claimed performance metrics
  claimedMetrics: {
    tps: 10000,
    gasPerSecond: 1000000000,  // 1 Ggas/sec
    blockTime: 1,
    finality: 2,
  },

  // Launch status
  status: 'testnet',

  // Benchmark details for "Pump Your Numbers" analysis
  benchmarkDetails: {
    transactionMix: {
      'eth-transfer': 100,  // 100% simple transfers
    },
    conditions: 'Controlled test environment, ideal network conditions',
    methodology: 'Internal testing framework',
    source: 'Project documentation',
  },

  // Color for visualizations
  color: '#8B5CF6',

  // Optional notes
  notes: 'Additional context about this project.',

  // When this data was last verified
  lastUpdated: '2024-12-01',
};
```

### 3. Add to the registry

Edit `src/data/projects/index.ts`:

```typescript
import { myProject } from './my-project';

export const projects: Project[] = [
  // ... existing projects
  myProject,
];
```

## Understanding Project Fields

### Scaling Solutions

Reference IDs of solutions from `src/data/scaling-solutions/`:

```typescript
scalingSolutions: [
  'parallelism',           // From parallelism.ts
  'optimistic-execution',  // From optimistic-execution.ts
  'jit-compilation',       // From jit-compilation.ts
],
```

The simulation will apply these solutions' resource modifiers automatically.

### Custom Resource Overrides

For projects with unique optimizations not captured by our scaling solutions:

```typescript
customResourceOverrides: {
  'cpu-gas': 150,  // Override to 150 Mgas/sec effective capacity
  'state-reads': 1000000,  // Custom state read throughput
},
```

Use sparingly and document why in the notes.

### Claimed Metrics

What the project officially claims:

```typescript
claimedMetrics: {
  tps: 10000,              // Transactions per second
  gasPerSecond: 1e9,       // Gas per second (1 Ggas)
  blockTime: 0.5,          // Seconds per block
  finality: 1,             // Seconds to finality
},
```

### Benchmark Details

Critical for the "Pump Your Numbers" section. Document how claimed metrics were achieved:

```typescript
benchmarkDetails: {
  // What transaction types were used?
  transactionMix: {
    'eth-transfer': 100,  // All simple transfers = inflated TPS
  },

  // What conditions?
  conditions: 'Single validator, local network, no contention',

  // How was it measured?
  methodology: 'Custom benchmarking tool, 60 second runs',

  // Where did this come from?
  source: 'https://project.io/benchmarks',
},
```

### Project Status

- `mainnet` - Live production network
- `testnet` - Public testnet
- `devnet` - Developer testnet (limited access)
- `development` - In development, no public network
- `announced` - Announced but not available
- `deprecated` - No longer active

## Example: Adding a New L2

```typescript
import type { Project } from './types';

export const myL2: Project = {
  id: 'my-l2',
  name: 'My Layer 2',
  description: 'Optimistic rollup with parallel execution.',
  website: 'https://myl2.io',

  scalingSolutions: [
    'parallelism',
    'optimistic-execution',
  ],

  claimedMetrics: {
    tps: 5000,
    blockTime: 2,
    finality: 3600,  // 1 hour challenge period
  },

  status: 'mainnet',

  benchmarkDetails: {
    transactionMix: {
      'eth-transfer': 50,
      'erc20-transfer': 30,
      'uniswap-swap': 20,
    },
    conditions: 'Production mainnet data from last 30 days',
    methodology: 'Block explorer analysis',
    source: 'https://explorer.myl2.io/stats',
  },

  color: '#10B981',

  notes: 'Launched mainnet Q3 2024. Uses fraud proofs for security.',

  lastUpdated: '2024-12-01',
};
```

## Tips

1. **Verify claims**: Link to official sources for all metrics
2. **Be specific about benchmarks**: Vague benchmark conditions are a red flag
3. **Include realistic mixes**: Projects that only benchmark simple transfers are gaming the system
4. **Update regularly**: Performance claims change, keep lastUpdated current
5. **Note caveats**: If claims seem unrealistic, explain why in notes
6. **Compare fairly**: Use the same transaction mix when comparing projects

## Common Red Flags for Benchmark Claims

Document these in the `notes` field:

- **100% simple transfers**: Unrealistic workload
- **Single validator/sequencer**: No network overhead
- **Empty blocks**: No state access
- **No contention**: All transactions perfectly parallelizable
- **Lab conditions**: Not representative of production
- **Cherry-picked metrics**: TPS without gas context
