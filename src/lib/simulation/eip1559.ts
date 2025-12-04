/**
 * EIP-1559 Fee Market Simulation
 *
 * Pure functions for simulating the EIP-1559 base fee mechanism.
 * All logic is separated from UI concerns for testability.
 */

export interface EIP1559Config {
  /** Target block utilization (0-1), default 0.5 */
  targetUtilization: number;
  /** Maximum fee change per block (0-1), default 0.125 (12.5%) */
  maxChangeRate: number;
  /** Minimum base fee in gwei, default 1 */
  minBaseFee: number;
  /** Initial base fee in gwei, default 20 */
  initialBaseFee: number;
}

export interface Block {
  number: number;
  /** Block utilization as fraction (0-1) */
  utilization: number;
  /** Base fee at time of this block (gwei) */
  baseFee: number;
}

export interface SimulationState {
  blocks: Block[];
  currentBaseFee: number;
  blockNumber: number;
}

export const DEFAULT_CONFIG: EIP1559Config = {
  targetUtilization: 0.5,
  maxChangeRate: 0.125,
  minBaseFee: 1,
  initialBaseFee: 20,
};

/**
 * Create initial simulation state
 */
export function createInitialState(config: Partial<EIP1559Config> = {}): SimulationState {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  return {
    blocks: [],
    currentBaseFee: fullConfig.initialBaseFee,
    blockNumber: 0,
  };
}

/**
 * Calculate the new base fee given current utilization.
 * This is the core EIP-1559 formula.
 *
 * Formula: newBaseFee = currentBaseFee * (1 + maxChangeRate * (utilization - target) / target)
 *
 * When utilization = target (50%): no change
 * When utilization = 100%: increase by maxChangeRate (12.5%)
 * When utilization = 0%: decrease by maxChangeRate (12.5%)
 */
export function calculateNewBaseFee(
  currentBaseFee: number,
  utilization: number,
  config: Partial<EIP1559Config> = {}
): number {
  const { targetUtilization, maxChangeRate, minBaseFee } = { ...DEFAULT_CONFIG, ...config };

  // Clamp utilization to valid range
  const clampedUtilization = Math.max(0, Math.min(1, utilization));

  // Calculate how far we are from target (can be negative or positive)
  const utilizationDelta = clampedUtilization - targetUtilization;

  // Calculate fee change as a fraction of current base fee
  // The formula ensures max change is exactly maxChangeRate when at 0% or 100% utilization
  const feeChangeRatio = maxChangeRate * (utilizationDelta / targetUtilization);

  // Apply the change
  const newBaseFee = currentBaseFee * (1 + feeChangeRatio);

  // Enforce minimum
  return Math.max(minBaseFee, newBaseFee);
}

/**
 * Simulate demand response to price.
 * Higher base fee = less demand (users priced out).
 *
 * @param demandLevel - Base demand level (0-1), how many users want to transact
 * @param currentBaseFee - Current base fee in gwei
 * @param baselineFee - The "normal" fee level for price sensitivity calculation
 * @returns Expected utilization factor before noise (0-1)
 */
export function calculateDemandResponse(
  demandLevel: number,
  currentBaseFee: number,
  baselineFee: number = 20
): number {
  // Price elasticity: as fee increases above baseline, demand decreases
  // At baseline fee, priceEffect = 1
  // At 2x baseline, priceEffect = 0.5
  // At very high fees, approaches 0
  const priceRatio = currentBaseFee / baselineFee;
  const priceEffect = 1 / priceRatio;

  // Combine demand level with price effect
  return Math.max(0, Math.min(1, demandLevel * priceEffect));
}

/**
 * Generate a random utilization value based on demand and noise.
 *
 * @param baseDemand - Expected demand level (0-1)
 * @param noiseLevel - Standard deviation of random noise (default 0.1)
 * @param randomSeed - Optional seed for deterministic testing (0-1 random value)
 */
export function generateUtilization(
  baseDemand: number,
  noiseLevel: number = 0.1,
  randomSeed?: number
): number {
  // Use provided random value or generate one
  const random = randomSeed !== undefined ? randomSeed : Math.random();

  // Convert uniform [0,1] to noise centered around 0
  // Using simple approximation: (random - 0.5) * 2 gives range [-1, 1]
  const noise = (random - 0.5) * 2 * noiseLevel;

  // Apply noise to base demand
  const utilization = baseDemand + noise;

  // Clamp to valid range
  return Math.max(0, Math.min(1, utilization));
}

/**
 * Process a single block in the simulation.
 * Returns the new state after processing the block.
 */
export function processBlock(
  state: SimulationState,
  utilization: number,
  config: Partial<EIP1559Config> = {}
): SimulationState {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Create the block record with current base fee
  const newBlock: Block = {
    number: state.blockNumber + 1,
    utilization,
    baseFee: state.currentBaseFee,
  };

  // Calculate new base fee for next block
  const newBaseFee = calculateNewBaseFee(state.currentBaseFee, utilization, fullConfig);

  return {
    blocks: [...state.blocks, newBlock],
    currentBaseFee: newBaseFee,
    blockNumber: state.blockNumber + 1,
  };
}

/**
 * Run a complete simulation for N blocks with given demand level.
 * Useful for testing and non-interactive visualizations.
 */
export function runSimulation(
  numBlocks: number,
  demandLevel: number,
  config: Partial<EIP1559Config> = {},
  options: {
    noiseLevel?: number;
    randomSeeds?: number[]; // For deterministic testing
  } = {}
): SimulationState {
  const { noiseLevel = 0.1, randomSeeds } = options;
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  let state = createInitialState(fullConfig);

  for (let i = 0; i < numBlocks; i++) {
    // Calculate demand response to current price
    const baseDemand = calculateDemandResponse(
      demandLevel,
      state.currentBaseFee,
      fullConfig.initialBaseFee
    );

    // Add noise to get actual utilization
    const randomSeed = randomSeeds?.[i];
    const utilization = generateUtilization(baseDemand, noiseLevel, randomSeed);

    // Process the block
    state = processBlock(state, utilization, fullConfig);
  }

  return state;
}

/**
 * Calculate statistics from simulation state
 */
export interface SimulationStats {
  averageBaseFee: number;
  minBaseFee: number;
  maxBaseFee: number;
  averageUtilization: number;
  blocksAboveTarget: number;
  blocksBelowTarget: number;
  feeVolatility: number; // Standard deviation / mean
}

export function calculateStats(
  state: SimulationState,
  config: Partial<EIP1559Config> = {}
): SimulationStats {
  const { targetUtilization } = { ...DEFAULT_CONFIG, ...config };
  const { blocks } = state;

  if (blocks.length === 0) {
    return {
      averageBaseFee: state.currentBaseFee,
      minBaseFee: state.currentBaseFee,
      maxBaseFee: state.currentBaseFee,
      averageUtilization: 0,
      blocksAboveTarget: 0,
      blocksBelowTarget: 0,
      feeVolatility: 0,
    };
  }

  const fees = blocks.map(b => b.baseFee);
  const utilizations = blocks.map(b => b.utilization);

  const avgFee = fees.reduce((a, b) => a + b, 0) / fees.length;
  const avgUtil = utilizations.reduce((a, b) => a + b, 0) / utilizations.length;

  // Calculate standard deviation for volatility
  const feeVariance = fees.reduce((sum, f) => sum + Math.pow(f - avgFee, 2), 0) / fees.length;
  const feeStdDev = Math.sqrt(feeVariance);

  return {
    averageBaseFee: avgFee,
    minBaseFee: Math.min(...fees),
    maxBaseFee: Math.max(...fees),
    averageUtilization: avgUtil,
    blocksAboveTarget: blocks.filter(b => b.utilization > targetUtilization).length,
    blocksBelowTarget: blocks.filter(b => b.utilization < targetUtilization).length,
    feeVolatility: avgFee > 0 ? feeStdDev / avgFee : 0,
  };
}
