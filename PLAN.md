# EVM Scaling: An Interactive Introduction

## Project Overview

An interactive, scroll-based presentation website that teaches EVM scalability fundamentals through simulations and visualizations. Inspired by [The Secret Lives of Data](https://thesecretlivesofdata.com/raft/).

**Key Goals:**
1. Build a shared mental model for EVM scaling
2. Interactive simulations that let users experiment with resources, fee markets, and scaling solutions
3. Presentation/slide mode for talks
4. Extensible architecture for AI agents and contributors to add content
5. Compare real projects and their scaling approaches

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14 (App Router) | Best Vercel integration, React ecosystem, SSR for SEO |
| Styling | Tailwind CSS + CSS Modules | Rapid development, component isolation |
| Visualizations | D3.js + Visx | Most powerful for custom simulations, React-friendly |
| Animations | Framer Motion | Smooth scroll-triggered animations, gesture support |
| State | Zustand | Lightweight, perfect for simulation state |
| Data | TypeScript definitions + JSON | Version controlled, AI-editable, no backend complexity |
| Database | SQLite (optional) | For caching simulation results, user presets |
| Deployment | Vercel | Zero-config, edge functions if needed |

---

## Architecture

```
/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Main presentation entry
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── slide/[id]/           # Direct slide navigation
│   │   └── sandbox/              # Standalone simulation playground
│   │
│   ├── components/
│   │   ├── slides/               # Individual slide components
│   │   │   ├── 00-intro/
│   │   │   ├── 01-the-model/
│   │   │   ├── 02-fee-markets/
│   │   │   ├── 03-scaling-solutions/
│   │   │   ├── 04-projects/
│   │   │   ├── 05-conclusion/
│   │   │   └── 99-pump-your-numbers/
│   │   │
│   │   ├── simulations/          # Reusable simulation components
│   │   │   ├── ResourceModel/    # n-resource simulation
│   │   │   ├── FeeMarket/        # EIP-1559 and pricing simulations
│   │   │   ├── TransactionFlow/  # TX visualization
│   │   │   └── ScalingSandbox/   # Compose scaling solutions
│   │   │
│   │   ├── visualizations/       # D3/Visx chart components
│   │   │   ├── DemandCurve/
│   │   │   ├── ResourceUtilization/
│   │   │   ├── BackpressureGauge/
│   │   │   ├── ThroughputChart/
│   │   │   └── ComparisonMatrix/
│   │   │
│   │   ├── ui/                   # Shared UI components
│   │   │   ├── SlideContainer/
│   │   │   ├── ScrollProgress/
│   │   │   ├── ParameterSlider/
│   │   │   ├── ToggleGroup/
│   │   │   └── CodeBlock/
│   │   │
│   │   └── presentation/         # Presentation mode components
│   │       ├── SlideNavigation/
│   │       ├── PresenterMode/
│   │       └── KeyboardControls/
│   │
│   ├── lib/
│   │   ├── simulation/           # Core simulation engine
│   │   │   ├── engine.ts         # Main simulation loop
│   │   │   ├── resources.ts      # Resource definitions & calculations
│   │   │   ├── transactions.ts   # TX type definitions
│   │   │   ├── fee-markets.ts    # Pricing model implementations
│   │   │   └── demand.ts         # Demand curve functions
│   │   │
│   │   ├── scaling/              # Scaling solution logic
│   │   │   ├── types.ts          # ScalingSolution interface
│   │   │   ├── registry.ts       # Solution registry
│   │   │   └── composer.ts       # Compose multiple solutions
│   │   │
│   │   └── utils/
│   │       ├── math.ts
│   │       └── formatting.ts
│   │
│   ├── data/                     # Static data definitions (AI-editable)
│   │   ├── resources/            # Resource definitions
│   │   │   ├── index.ts          # Resource registry
│   │   │   ├── cpu-gas.ts
│   │   │   ├── state-access.ts
│   │   │   ├── bandwidth.ts
│   │   │   └── ...
│   │   │
│   │   ├── transactions/         # Transaction type definitions
│   │   │   ├── index.ts
│   │   │   ├── eth-transfer.ts
│   │   │   ├── erc20-transfer.ts
│   │   │   ├── uniswap-swap.ts
│   │   │   └── ...
│   │   │
│   │   ├── scaling-solutions/    # Scaling solution definitions
│   │   │   ├── index.ts
│   │   │   ├── parallelism.ts
│   │   │   ├── state-expiry.ts
│   │   │   ├── verkle-trees.ts
│   │   │   └── ...
│   │   │
│   │   └── projects/             # Project definitions
│   │       ├── index.ts
│   │       ├── monad.ts
│   │       ├── megaeth.ts
│   │       ├── reth.ts
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── useSimulation.ts
│   │   ├── useScrollProgress.ts
│   │   ├── useSlideNavigation.ts
│   │   └── usePresentationMode.ts
│   │
│   └── stores/
│       ├── simulation.ts         # Simulation state
│       └── presentation.ts       # Presentation mode state
│
├── public/
│   └── images/
│
├── docs/                         # Documentation for contributors
│   ├── ADDING_RESOURCES.md
│   ├── ADDING_TRANSACTIONS.md
│   ├── ADDING_SCALING_SOLUTIONS.md
│   └── ADDING_PROJECTS.md
│
└── scripts/
    └── validate-data.ts          # Validate data definitions
```

---

## Core Data Models

### Resource Definition

```typescript
// src/data/resources/types.ts
interface Resource {
  id: string;
  name: string;
  description: string;
  unit: string;                    // e.g., "gas/sec", "bytes/sec"
  maxThroughput: number;           // Maximum throughput per second
  currentBaseline: number;         // Current Ethereum mainnet baseline

  // For visualization
  color: string;
  icon: string;
}

// Example: src/data/resources/cpu-gas.ts
export const cpuGas: Resource = {
  id: 'cpu-gas',
  name: 'Single-threaded CPU Gas',
  description: 'Gas execution on a single CPU thread',
  unit: 'Mgas/sec',
  maxThroughput: 60,              // ~60 Mgas/sec theoretical max
  currentBaseline: 2.5,           // ~2.5 Mgas/sec on mainnet (15M gas / 6 sec)
  color: '#FF6B6B',
  icon: 'cpu',
};
```

### Transaction Type Definition

```typescript
// src/data/transactions/types.ts
interface TransactionType {
  id: string;
  name: string;
  description: string;

  // Resource consumption per transaction
  resourceConsumption: Record<string, number>;

  // Demand curve: given time, returns demand at each price point
  // Returns array of [price, quantity] tuples
  demandCurve: (timestamp: number) => [number, number][];

  // Or simplified: base demand + volatility
  baseDemand: number;             // Average TPS demand
  demandVolatility: number;       // 0-1 scale
  priceElasticity: number;        // How demand changes with price

  // Real-world data
  averageGas: number;
  percentOfMainnetTxs: number;    // Current % of mainnet transactions
}

// Example: src/data/transactions/uniswap-swap.ts
export const uniswapSwap: TransactionType = {
  id: 'uniswap-swap',
  name: 'Uniswap V3 Swap',
  description: 'Token swap on Uniswap V3',

  resourceConsumption: {
    'cpu-gas': 150000,            // ~150k gas
    'state-reads': 8,             // ~8 state reads
    'state-writes': 4,            // ~4 state writes
    'calldata': 200,              // ~200 bytes calldata
  },

  baseDemand: 5,                  // 5 TPS baseline
  demandVolatility: 0.8,          // High volatility (market events)
  priceElasticity: 0.6,           // Moderate price sensitivity

  averageGas: 150000,
  percentOfMainnetTxs: 8,
};
```

### Scaling Solution Definition

```typescript
// src/data/scaling-solutions/types.ts
interface ScalingSolution {
  id: string;
  name: string;
  description: string;
  category: 'execution' | 'storage' | 'networking' | 'cryptography';

  // How this solution modifies resources
  resourceModifiers: ResourceModifier[];

  // Complexity and trade-offs
  implementationComplexity: 'low' | 'medium' | 'high';
  securityConsiderations: string[];
  tradeoffs: string[];

  // For simulation
  isComposable: boolean;          // Can combine with other solutions
  incompatibleWith: string[];     // IDs of incompatible solutions

  // For presentation
  explanationSlides: string[];    // Slide IDs that explain this
}

interface ResourceModifier {
  resourceId: string;

  // One of these modification types:
  multiplyThroughput?: number;    // e.g., 4x for 4-core parallelism
  addThroughput?: number;         // Add flat throughput
  reduceConsumption?: number;     // e.g., 0.5 = 50% less consumption

  // Conditional modifiers
  condition?: {
    transactionTypes?: string[];  // Only affects these TX types
    parallelizable?: boolean;     // Only if TX is parallelizable
  };
}

// Example: src/data/scaling-solutions/parallelism.ts
export const parallelism: ScalingSolution = {
  id: 'parallelism',
  name: 'Parallel Execution',
  description: 'Execute non-conflicting transactions in parallel across multiple CPU cores',
  category: 'execution',

  resourceModifiers: [
    {
      resourceId: 'cpu-gas',
      multiplyThroughput: 4,       // Configurable: depends on core count
      condition: {
        parallelizable: true,     // Only parallel-safe TXs benefit
      },
    },
  ],

  implementationComplexity: 'high',
  securityConsiderations: [
    'Must correctly detect transaction conflicts',
    'State access patterns must be known ahead of time',
  ],
  tradeoffs: [
    'Overhead for conflict detection',
    'Not all transactions can be parallelized',
    'Sequential bottleneck for conflicting TXs',
  ],

  isComposable: true,
  incompatibleWith: [],

  explanationSlides: ['parallel-intro', 'parallel-deep-dive'],
};
```

### Project Definition

```typescript
// src/data/projects/types.ts
interface Project {
  id: string;
  name: string;
  description: string;
  website: string;

  // Which scaling solutions they implement
  scalingSolutions: string[];     // IDs of scaling solutions

  // Custom resource overrides (for projects with unique approaches)
  customResourceOverrides?: Partial<Record<string, number>>;

  // Claimed vs estimated performance
  claimedTPS?: number;
  claimedGasPerSec?: number;

  // Our estimated performance (from simulation)
  // Calculated dynamically based on scaling solutions

  // Launch status
  status: 'mainnet' | 'testnet' | 'development' | 'announced';

  // For the "pump your numbers" section
  benchmarkDetails?: {
    transactionMix: Record<string, number>;  // What TX mix they benchmark with
    conditions: string;                       // "Ideal conditions", etc.
  };
}

// Example: src/data/projects/monad.ts
export const monad: Project = {
  id: 'monad',
  name: 'Monad',
  description: 'High-performance EVM with parallel execution and optimistic execution',
  website: 'https://monad.xyz',

  scalingSolutions: [
    'parallelism',
    'optimistic-execution',
    'monad-db',
  ],

  claimedTPS: 10000,

  status: 'testnet',

  benchmarkDetails: {
    transactionMix: {
      'eth-transfer': 100,        // 100% simple transfers
    },
    conditions: 'Fully parallelizable workload, no state conflicts',
  },
};
```

---

## Simulation Engine

### Core Simulation Loop

```typescript
// src/lib/simulation/engine.ts
interface SimulationConfig {
  resources: Resource[];
  transactionTypes: TransactionType[];
  scalingSolutions: ScalingSolution[];
  feeMarket: FeeMarketModel;

  duration: number;               // Simulation duration in seconds
  timestep: number;               // Timestep resolution (e.g., 0.1 sec)
}

interface SimulationState {
  timestamp: number;

  // Per-resource state
  resourceUtilization: Record<string, number>;    // 0-1 utilization
  backpressure: Record<string, number>;           // Queued demand

  // Fee market state
  baseFee: number;
  priorityFees: number[];

  // Transaction state
  pendingTransactions: Transaction[];
  executedTransactions: Transaction[];

  // Metrics
  throughput: Record<string, number>;             // Actual throughput achieved
  totalTPS: number;
  revenueGenerated: number;
}

interface SimulationResult {
  states: SimulationState[];                      // State at each timestep

  // Aggregate metrics
  averageUtilization: Record<string, number>;
  peakBackpressure: Record<string, number>;
  averageTPS: number;
  peakTPS: number;

  // Fee market metrics
  feeVolatility: number;
  averageFee: number;
}
```

### Fee Market Models

```typescript
// src/lib/simulation/fee-markets.ts
interface FeeMarketModel {
  id: string;
  name: string;

  // Given current state, calculate next base fee
  calculateBaseFee: (
    currentState: SimulationState,
    config: SimulationConfig,
  ) => number;
}

// EIP-1559 implementation
export const eip1559: FeeMarketModel = {
  id: 'eip1559',
  name: 'EIP-1559',

  calculateBaseFee: (state, config) => {
    const targetUtilization = 0.5;                // 50% target
    const maxChangeRate = 0.125;                  // 12.5% max change

    // Calculate average utilization across resources
    const avgUtilization = average(Object.values(state.resourceUtilization));

    // Adjust fee based on utilization
    const utilizationDelta = avgUtilization - targetUtilization;
    const feeChange = state.baseFee * maxChangeRate * (utilizationDelta / targetUtilization);

    return Math.max(1, state.baseFee + feeChange);
  },
};

// "AI Oracle" optimal fee predictor
export const aiOracle: FeeMarketModel = {
  id: 'ai-oracle',
  name: 'AI Oracle (Optimal)',

  calculateBaseFee: (state, config) => {
    // Uses future demand knowledge (cheating, but shows optimal)
    // Useful for demonstrating the upper bound of fee market efficiency
    // ...
  },
};

// Multidimensional EIP-1559 (for multiple resources)
export const multidimensionalEIP1559: FeeMarketModel = {
  id: 'multidim-1559',
  name: 'Multidimensional EIP-1559',

  calculateBaseFee: (state, config) => {
    // Per-resource pricing with combined optimization
    // ...
  },
};
```

---

## Presentation Structure

### Slide Organization

Each "slide" is a scroll section that can contain:
- Text content (MDX)
- Interactive simulations
- Visualizations
- Parameter controls

```typescript
// src/components/slides/types.ts
interface SlideDefinition {
  id: string;
  title: string;
  section: string;                // For navigation grouping

  // Content
  component: React.ComponentType;

  // Interactivity
  simulation?: {
    type: 'resource' | 'fee-market' | 'scaling' | 'custom';
    defaultConfig: Partial<SimulationConfig>;
  };

  // Animation triggers
  animations?: {
    onEnter?: () => void;
    onProgress?: (progress: number) => void;
    onExit?: () => void;
  };
}
```

### Presentation Sections

#### Section 0: Introduction
- **Slide 0.1**: The Problem
  - "We have an execution bottleneck with PeerDAS"
  - Show current Ethereum throughput vs potential
  - "Projects claim high TPS but underperform in practice"

- **Slide 0.2**: Why This Matters
  - Interactive: Show a "benchmark theater" example
  - Introduce the goal: a shared model for reasoning about scaling

#### Section 1: The Model
- **Slide 1.1**: Resources
  - Interactive: Add/remove resources, see how they affect capacity
  - Visual: Resource capacity bars

- **Slide 1.2**: Transactions
  - Show different TX types and their resource consumption
  - Interactive: Drag transactions, see resource usage

- **Slide 1.3**: Demand Curves
  - Visualize demand curves for different TX types
  - Interactive: Adjust volatility, see demand changes

- **Slide 1.4**: Putting It Together
  - Full simulation with resources + transactions
  - Show backpressure building up

#### Section 2: Fee Markets
- **Slide 2.1**: Why Fees?
  - Show what happens without fees (DoS, spam)
  - Interactive: Remove fees, watch chaos

- **Slide 2.2**: EIP-1559 Explained
  - Animated step-through of the algorithm
  - Interactive: Adjust parameters, see fee behavior

- **Slide 2.3**: EIP-1559 in Action
  - Simulation: Watch EIP-1559 find equilibrium
  - Compare: High vs low demand volatility

- **Slide 2.4**: Optimal Fee Markets
  - Show "AI Oracle" optimal pricing
  - Compare to EIP-1559, show the gap

- **Slide 2.5**: Multidimensional Fees
  - Multiple resources = multiple fee dimensions
  - Preview of future challenges

#### Section 3: Scaling Solutions
- **Slide 3.1**: Taxonomy of Solutions
  - Categories: Execution, Storage, Networking, Cryptography
  - Visual: Solution tree/map

- **Slide 3.2**: Parallel Execution
  - Deep dive with animation
  - Interactive: Add parallelism, see impact
  - Show limitation: sequential bottleneck

- **Slide 3.3**: Optimistic Execution
  - How speculative execution works
  - When it helps vs hurts

- **Slide 3.4**: State Optimizations
  - Verkle trees, state expiry, history expiry
  - Impact on different resources

- **Slide 3.5**: Hardware Acceleration
  - Precompiles, GPUs, custom silicon
  - Resource impact

- **Slide 3.6**: Solution Composition
  - Interactive: Stack multiple solutions
  - See combined effect on simulation

#### Section 4: Projects
- **Slide 4.1**: Project Comparison
  - Table/matrix of projects vs solutions
  - Interactive: Click project, see simulation

- **Slide 4.2-4.N**: Individual Project Deep Dives
  - Per-project slides (auto-generated from data)
  - Show their claimed vs simulated performance

#### Section 5: Conclusion
- **Slide 5.1**: The Path Forward
  - Summary of key insights
  - What matters most for scaling

- **Slide 5.2**: Open Challenges
  - Fee market complexity as we scale
  - Cross-shard communication
  - State growth

- **Slide 5.3**: Call to Action
  - How to contribute to this model
  - Links and resources

#### Section 99: Pump Your Numbers
- **Slide 99.1**: The Benchmark Game
  - Tongue-in-cheek guide to inflating metrics
  - Interactive: Design a benchmark to maximize TPS

- **Slide 99.2**: Red Flags
  - What to look for in benchmark claims
  - Common tricks and how to spot them

- **Slide 99.3**: Your Turn
  - Interactive: "Marketing mode" simulator
  - Select optimizations, pick favorable TX mix
  - Generate your own impressive-sounding metrics

---

## Key Interactive Components

### 1. Resource Simulation Panel
- Add/remove resources
- Adjust throughput caps
- Real-time utilization visualization

### 2. Transaction Designer
- Create custom TX types
- Set resource consumption
- Define demand curves

### 3. Fee Market Simulator
- Select pricing model
- Watch fee discovery in real-time
- Compare models side-by-side

### 4. Scaling Solution Composer
- Drag-and-drop solution stacking
- See real-time impact on simulation
- Incompatibility warnings

### 5. Project Analyzer
- Select a project
- See which solutions they use
- Run simulation with their config
- Compare claimed vs simulated TPS

### 6. Benchmark Theater (Pump Your Numbers)
- Marketing mode toggle
- Pick favorable TX mix
- Generate inflated metrics
- Export "impressive" charts

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Next.js project setup with Tailwind
- [ ] Basic scroll-based slide system
- [ ] Core data type definitions
- [ ] Initial resource/transaction/solution data
- [ ] Basic simulation engine (no visualization)

### Phase 2: Visualizations
- [ ] Resource utilization charts
- [ ] Demand curve visualizations
- [ ] Fee market graphs
- [ ] Transaction flow animations
- [ ] Backpressure gauge

### Phase 3: Simulations
- [ ] Full simulation engine with multiple fee models
- [ ] Real-time simulation rendering
- [ ] Interactive parameter controls
- [ ] Solution composition logic

### Phase 4: Content
- [ ] Write all slide content
- [ ] Add all known scaling solutions
- [ ] Add all known projects
- [ ] Create "Pump Your Numbers" section

### Phase 5: Polish
- [ ] Presentation mode (keyboard nav, speaker notes)
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Documentation for contributors

### Phase 6: Launch
- [ ] Deploy to Vercel
- [ ] Set up contribution guidelines
- [ ] Create issues for community contributions

---

## Contribution Guide (For AI Agents)

### Adding a New Resource

1. Create file: `src/data/resources/[resource-id].ts`
2. Export a `Resource` object following the type definition
3. Add to registry in `src/data/resources/index.ts`
4. Run `npm run validate-data` to verify

### Adding a New Transaction Type

1. Create file: `src/data/transactions/[tx-id].ts`
2. Export a `TransactionType` object
3. Define resource consumption for all existing resources
4. Add to registry in `src/data/transactions/index.ts`

### Adding a New Scaling Solution

1. Create file: `src/data/scaling-solutions/[solution-id].ts`
2. Export a `ScalingSolution` object
3. Define resource modifiers
4. Add to registry in `src/data/scaling-solutions/index.ts`
5. Optionally create explanation slides

### Adding a New Project

1. Create file: `src/data/projects/[project-id].ts`
2. Export a `Project` object
3. Reference existing scaling solution IDs
4. Add to registry in `src/data/projects/index.ts`

---

## Open Questions / Future Work

1. **Real benchmark data**: Can we import actual benchmark data from projects?
2. **User presets**: Should users be able to save/share simulation configs?
3. **Embedded mode**: Should slides be embeddable in other sites?
4. **Versioning**: How to handle changes to the model over time?
5. **Community contributions**: Process for reviewing/merging new solutions/projects?

---

## File Generation Order

When implementing, create files in this order:

1. `package.json` - Dependencies
2. `tsconfig.json` - TypeScript config
3. `tailwind.config.ts` - Tailwind config
4. `src/app/layout.tsx` - Root layout
5. `src/app/page.tsx` - Main page
6. `src/data/*/types.ts` - Type definitions
7. `src/lib/simulation/engine.ts` - Core engine
8. `src/components/ui/*` - Basic UI components
9. `src/components/slides/SlideContainer.tsx` - Slide wrapper
10. `src/components/visualizations/*` - Charts and graphs
11. `src/data/resources/*.ts` - Resource definitions
12. `src/data/transactions/*.ts` - Transaction definitions
13. `src/data/scaling-solutions/*.ts` - Solution definitions
14. `src/data/projects/*.ts` - Project definitions
15. `src/components/slides/*/*` - Individual slides
16. `docs/*.md` - Contributor documentation
