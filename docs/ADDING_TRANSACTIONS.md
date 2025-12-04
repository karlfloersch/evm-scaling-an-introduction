# Adding New Transaction Types

Transaction types represent different categories of blockchain transactions, each with unique resource consumption patterns and demand characteristics.

## Step-by-Step Guide

### 1. Create a new transaction file

Create a new file in `src/data/transactions/`:

```bash
touch src/data/transactions/my-transaction.ts
```

### 2. Define the transaction type

Use the `TransactionType` interface from `types.ts`:

```typescript
import type { TransactionType } from './types';

export const myTransaction: TransactionType = {
  // Unique identifier (kebab-case)
  id: 'my-transaction',

  // Human-readable name
  name: 'My Transaction',

  // Brief description
  description: 'What this transaction does.',

  // Category (see types.ts for options)
  category: 'defi',

  // Resource consumption per transaction
  resourceConsumption: {
    'cpu-gas': 100000,      // Gas units consumed
    'state-reads': 5,        // Number of SLOAD operations
    'state-writes': 2,       // Number of SSTORE operations
    'verification': 1,       // Signature verifications
  },

  // Base demand in TPS when fees are at equilibrium
  baseDemand: 5,

  // Demand volatility (0-1): 0 = steady, 1 = highly variable
  demandVolatility: 0.5,

  // Price elasticity (0-1): How much demand drops with price
  priceElasticity: 0.6,

  // Average gas used
  averageGas: 100000,

  // Approximate % of mainnet transactions
  percentOfMainnetTxs: 5,

  // Can this transaction be parallelized?
  parallelizable: true,

  // Color for visualizations
  color: '#9775FA',

  // Optional notes
  notes: 'Additional context about this transaction type.',
};
```

### 3. Add to the registry

Edit `src/data/transactions/index.ts`:

```typescript
import { myTransaction } from './my-transaction';

export const transactionTypes: TransactionType[] = [
  // ... existing types
  myTransaction,
];
```

## Understanding the Parameters

### Resource Consumption

Map resource IDs to the amount consumed per transaction:

```typescript
resourceConsumption: {
  'cpu-gas': 150000,    // 150k gas
  'state-reads': 8,     // 8 SLOAD operations
  'state-writes': 4,    // 4 SSTORE operations
  'verification': 1,    // 1 signature check
}
```

### Demand Parameters

- **baseDemand**: Average TPS at normal price levels
- **demandVolatility**: How much demand fluctuates (NFT mints: 0.95, ETH transfers: 0.3)
- **priceElasticity**: How sensitive users are to price (arbitrage: 0.2, regular users: 0.7)

### Parallelizability

Set `parallelizable: true` if transactions of this type can execute in parallel when they don't access the same state. Consider:

- **Parallelizable**: Simple transfers between different accounts
- **Not parallelizable**: Swaps on popular DEX pools (they all touch the same state)

## Transaction Categories

- `transfer` - Simple value transfers (ETH, tokens)
- `defi` - DeFi operations (swaps, lending, staking)
- `nft` - NFT mints, transfers, marketplace
- `gaming` - On-chain gaming transactions
- `governance` - DAO votes, proposals
- `infrastructure` - Contract deployments, upgrades
- `other` - Everything else

## Example: Adding a Lending Protocol Borrow

```typescript
import type { TransactionType } from './types';

export const aaveBorrow: TransactionType = {
  id: 'aave-borrow',
  name: 'Aave Borrow',
  description: 'Borrowing assets from Aave lending protocol.',
  category: 'defi',

  resourceConsumption: {
    'cpu-gas': 250000,
    'state-reads': 15,
    'state-writes': 5,
    'verification': 1,
  },

  baseDemand: 2,
  demandVolatility: 0.6,
  priceElasticity: 0.5,

  averageGas: 250000,
  percentOfMainnetTxs: 2,

  parallelizable: false, // Uses shared pool state
  color: '#B6509E',

  notes: 'Includes interest rate calculation and collateral checks.',
};
```

## Tips

1. **Use real data**: Check Etherscan for actual gas usage of similar transactions
2. **Consider state access**: Count SLOAD/SSTORE from contract code or traces
3. **Think about contention**: If transactions compete for the same state, mark as non-parallelizable
4. **Be conservative with percentages**: They should roughly sum to 100% across all types
