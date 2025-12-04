/**
 * Core Simulation Engine
 *
 * Simulates blockchain throughput based on:
 * - Resource capacity (gas/sec)
 * - Transaction demand curves
 * - Tech multipliers
 * - Demand scenarios
 *
 * All functions are pure for testability.
 */

import { calculateNewBaseFee, calculateDemandResponse, DEFAULT_CONFIG as EIP1559_CONFIG } from './eip1559';
import type { TransactionType } from '@/data/transactions/types';

// ============================================================================
// Types
// ============================================================================

export interface SimulationConfig {
  /** Base gas capacity in Mgas/sec (e.g., 2.5 for mainnet) */
  gasPerSecond: number;

  /** Tech multiplier (e.g., 4 for 4-lane parallel execution) */
  techMultiplier: number;

  /** Transaction mix to simulate */
  transactionMix: TransactionMixEntry[];

  /** Demand scenario */
  scenario: DemandScenario;

  /** Simulation speed (time units per real second) */
  simulationSpeed: number;
}

export interface TransactionMixEntry {
  txType: TransactionType;
  /** Relative weight in the mix (will be normalized) */
  weight: number;
}

export interface DemandScenario {
  id: string;
  name: string;
  description: string;
  /** Duration in time units */
  duration: number;
  /** Returns demand multiplier (1.0 = normal) at normalized time (0-1) */
  getDemandMultiplier: (normalizedTime: number) => number;
}

export interface SimulationState {
  /** Current simulation time (0 to scenario.duration) */
  timestamp: number;

  /** Whether simulation has completed */
  isComplete: boolean;

  // Demand metrics
  /** Total demand in TPS at current price */
  totalDemand: number;
  /** Demand breakdown by transaction type */
  demandByType: Record<string, number>;

  // Supply/capacity metrics
  /** Effective gas capacity in Mgas/sec (after tech multiplier) */
  gasCapacity: number;
  /** Gas actually being used in Mgas/sec */
  gasUsed: number;
  /** Utilization as fraction (0-1) */
  utilization: number;

  // Throughput metrics
  /** Actual transactions per second being processed */
  tps: number;
  /** TPS breakdown by transaction type */
  tpsByType: Record<string, number>;

  // Fee market
  /** Current base fee in gwei */
  baseFee: number;

  // Backlog
  /** Number of pending transactions */
  pendingTxs: number;
}

export interface SimulationHistory {
  states: SimulationState[];
  config: SimulationConfig;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONFIG: Omit<SimulationConfig, 'transactionMix' | 'scenario'> = {
  gasPerSecond: 2.5,      // Mainnet baseline ~2.5 Mgas/sec
  techMultiplier: 1,      // No scaling tech
  simulationSpeed: 1,     // Real-time
};

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate weighted average gas per transaction for a mix
 */
export function calculateAverageGas(mix: TransactionMixEntry[]): number {
  const totalWeight = mix.reduce((sum, m) => sum + m.weight, 0);
  if (totalWeight === 0) return 21000; // Default to simple transfer

  let weightedGas = 0;
  for (const { txType, weight } of mix) {
    weightedGas += txType.averageGas * (weight / totalWeight);
  }
  return weightedGas;
}

/**
 * Calculate maximum TPS given gas capacity and average gas per tx
 */
export function calculateMaxTPS(
  gasCapacityMgas: number,
  avgGasPerTx: number
): number {
  // Convert Mgas/sec to gas/sec, then divide by gas per tx
  return (gasCapacityMgas * 1_000_000) / avgGasPerTx;
}

/**
 * Calculate actual TPS and utilization
 */
export function calculateThroughput(
  demand: number,
  gasCapacityMgas: number,
  avgGasPerTx: number
): { tps: number; utilization: number; gasUsed: number } {
  const maxTPS = calculateMaxTPS(gasCapacityMgas, avgGasPerTx);

  // Actual TPS is minimum of demand and capacity
  const tps = Math.min(demand, maxTPS);

  // Utilization is how much of capacity we're using
  const utilization = maxTPS > 0 ? tps / maxTPS : 0;

  // Gas used in Mgas/sec
  const gasUsed = (tps * avgGasPerTx) / 1_000_000;

  return { tps, utilization, gasUsed };
}

/**
 * Calculate demand for each transaction type at current price
 */
export function calculateDemand(
  mix: TransactionMixEntry[],
  baseFee: number,
  demandMultiplier: number,
  baselineFee: number = 20
): { total: number; byType: Record<string, number> } {
  const byType: Record<string, number> = {};
  let total = 0;

  const totalWeight = mix.reduce((sum, m) => sum + m.weight, 0);

  for (const { txType, weight } of mix) {
    // Normalize weight
    const normalizedWeight = totalWeight > 0 ? weight / totalWeight : 0;

    // Base demand scaled by weight
    const baseDemand = txType.baseDemand * normalizedWeight * mix.length;

    // Apply price elasticity
    const priceEffect = calculateDemandResponse(1, baseFee, baselineFee);

    // Apply scenario multiplier
    const demand = baseDemand * demandMultiplier * priceEffect;

    byType[txType.id] = Math.max(0, demand);
    total += byType[txType.id];
  }

  return { total, byType };
}

// ============================================================================
// Simulation State Management
// ============================================================================

/**
 * Create initial simulation state
 */
export function createInitialState(config: SimulationConfig): SimulationState {
  const gasCapacity = config.gasPerSecond * config.techMultiplier;

  return {
    timestamp: 0,
    isComplete: false,
    totalDemand: 0,
    demandByType: {},
    gasCapacity,
    gasUsed: 0,
    utilization: 0,
    tps: 0,
    tpsByType: {},
    baseFee: 20, // Starting base fee
    pendingTxs: 0,
  };
}

/**
 * Advance simulation by one time step
 */
export function simulateStep(
  prevState: SimulationState,
  config: SimulationConfig,
  dt: number
): SimulationState {
  const timestamp = prevState.timestamp + dt;

  // Check if simulation is complete
  if (timestamp >= config.scenario.duration) {
    return { ...prevState, timestamp: config.scenario.duration, isComplete: true };
  }

  // Get demand multiplier from scenario
  const normalizedTime = timestamp / config.scenario.duration;
  const demandMultiplier = config.scenario.getDemandMultiplier(normalizedTime);

  // Calculate demand at current price
  const { total: totalDemand, byType: demandByType } = calculateDemand(
    config.transactionMix,
    prevState.baseFee,
    demandMultiplier
  );

  // Calculate capacity
  const gasCapacity = config.gasPerSecond * config.techMultiplier;

  // Calculate throughput
  const avgGas = calculateAverageGas(config.transactionMix);
  const { tps, utilization, gasUsed } = calculateThroughput(
    totalDemand,
    gasCapacity,
    avgGas
  );

  // Calculate TPS by type (proportional to demand)
  const tpsByType: Record<string, number> = {};
  for (const [typeId, demand] of Object.entries(demandByType)) {
    tpsByType[typeId] = totalDemand > 0 ? (demand / totalDemand) * tps : 0;
  }

  // Update base fee using EIP-1559 logic
  const newBaseFee = calculateNewBaseFee(prevState.baseFee, utilization, {
    ...EIP1559_CONFIG,
    // Faster adjustment for visualization
    maxChangeRate: 0.125 * 2,
  });

  // Update pending transactions (simplified model)
  const excessDemand = Math.max(0, totalDemand - tps);
  const processedFromQueue = Math.min(prevState.pendingTxs, tps * 0.1); // Process 10% of queue capacity
  const pendingTxs = Math.max(0, prevState.pendingTxs + excessDemand * dt - processedFromQueue * dt);

  return {
    timestamp,
    isComplete: false,
    totalDemand,
    demandByType,
    gasCapacity,
    gasUsed,
    utilization,
    tps,
    tpsByType,
    baseFee: newBaseFee,
    pendingTxs,
  };
}

/**
 * Run a complete simulation and return history
 */
export function runFullSimulation(
  config: SimulationConfig,
  timestep: number = 0.1
): SimulationHistory {
  const states: SimulationState[] = [];
  let state = createInitialState(config);
  states.push(state);

  while (!state.isComplete) {
    state = simulateStep(state, config, timestep);
    states.push(state);
  }

  return { states, config };
}

// ============================================================================
// Statistics
// ============================================================================

export interface SimulationStats {
  avgTPS: number;
  peakTPS: number;
  minTPS: number;
  avgUtilization: number;
  peakUtilization: number;
  avgBaseFee: number;
  peakBaseFee: number;
  minBaseFee: number;
  peakPendingTxs: number;
  totalTxProcessed: number;
}

export function calculateSimulationStats(history: SimulationHistory): SimulationStats {
  const { states } = history;

  if (states.length === 0) {
    return {
      avgTPS: 0,
      peakTPS: 0,
      minTPS: 0,
      avgUtilization: 0,
      peakUtilization: 0,
      avgBaseFee: 20,
      peakBaseFee: 20,
      minBaseFee: 20,
      peakPendingTxs: 0,
      totalTxProcessed: 0,
    };
  }

  // Skip first 10% of simulation for warmup when calculating min values
  const warmupCutoff = Math.floor(states.length * 0.1);
  const statesAfterWarmup = states.slice(warmupCutoff);

  const tpsValues = states.map(s => s.tps);
  const tpsAfterWarmup = statesAfterWarmup.map(s => s.tps);
  const utilValues = states.map(s => s.utilization);
  const feeValues = states.map(s => s.baseFee);
  const feeAfterWarmup = statesAfterWarmup.map(s => s.baseFee);
  const pendingValues = states.map(s => s.pendingTxs);

  // Calculate total transactions (sum of TPS over time)
  const totalTxProcessed = tpsValues.reduce((a, b) => a + b, 0);

  return {
    avgTPS: tpsValues.reduce((a, b) => a + b, 0) / tpsValues.length,
    peakTPS: Math.max(...tpsValues),
    minTPS: tpsAfterWarmup.length > 0 ? Math.min(...tpsAfterWarmup) : 0,
    avgUtilization: utilValues.reduce((a, b) => a + b, 0) / utilValues.length,
    peakUtilization: Math.max(...utilValues),
    avgBaseFee: feeValues.reduce((a, b) => a + b, 0) / feeValues.length,
    peakBaseFee: Math.max(...feeValues),
    minBaseFee: feeAfterWarmup.length > 0 ? Math.min(...feeAfterWarmup) : 20,
    peakPendingTxs: Math.max(...pendingValues),
    totalTxProcessed,
  };
}
