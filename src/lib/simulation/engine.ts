/**
 * EVM Scaling Simulation Engine
 *
 * Core simulation logic for modeling resource consumption,
 * transaction throughput, and fee markets.
 *
 * The new architecture:
 * - Tech defines resources via `defineResources`
 * - Tech calculates consumption via `calculateConsumption`
 * - Resources are composed from the tech stack
 */

import type { Resource, ResourceState } from '@/data/resources/types';
import type { TransactionType, Transaction, DemandPoint } from '@/data/transactions/types';
import type { Tech, SimulationContext, ResourceConsumption } from '@/data/tech/types';
import { composeResources, calculateTotalConsumption, applyTechStack, applyConsumptionReduction } from '@/data/tech/types';
import { generateDemandCurve, isFullyParallelizable } from '@/data/transactions/types';

/**
 * Simulation configuration
 */
export interface SimulationConfig {
  resources: Resource[];
  transactionTypes: TransactionType[];
  techStack: Tech[];
  feeMarketModel: FeeMarketModel;
  duration: number;
  timestep: number;
  eip1559Params: EIP1559Params;
}

export interface EIP1559Params {
  targetUtilization: number;
  maxChangeRate: number;
  minBaseFee: number;
}

/**
 * Simulation state at a point in time
 */
export interface SimulationSnapshot {
  timestamp: number;
  resourceStates: Record<string, ResourceState>;
  baseFee: number;
  transactionsExecuted: number;
  transactionsPending: number;
  gasUsed: number;
  tps: number;
}

/**
 * Complete simulation result
 */
export interface SimulationResult {
  snapshots: SimulationSnapshot[];
  summary: {
    averageTPS: number;
    peakTPS: number;
    averageUtilization: Record<string, number>;
    peakBackpressure: Record<string, number>;
    averageBaseFee: number;
    feeVolatility: number;
    bottleneckResource: string;
    totalTransactionsExecuted: number;
  };
}

export type FeeMarketModel = 'eip1559' | 'multidim-1559' | 'ai-oracle' | 'fixed';

/**
 * Calculate effective max throughput for a resource after applying tech stack
 */
function getEffectiveMaxThroughput(
  resource: Resource,
  techStack: Tech[]
): number {
  return applyTechStack(
    resource.currentBaseline, // Start from current baseline, not theoretical max
    techStack,
    resource.id
  );
}

/**
 * Calculate resource consumption for a transaction using new architecture
 */
function getResourceConsumptionNew(
  txType: TransactionType,
  techStack: Tech[],
  context: SimulationContext
): ResourceConsumption {
  return calculateTotalConsumption(txType, techStack, context);
}

/**
 * Calculate resource consumption for a transaction (legacy path)
 */
function getResourceConsumption(
  txType: TransactionType,
  resource: Resource,
  techStack: Tech[]
): number {
  const baseConsumption = txType.resourceConsumption[resource.id] || 0;
  return applyConsumptionReduction(
    baseConsumption,
    techStack,
    resource.id,
    txType.id,
    isFullyParallelizable(txType)
  );
}

/**
 * Calculate demand at a given price point
 */
function getDemandAtPrice(
  txType: TransactionType,
  timestamp: number,
  price: number
): number {
  const demandCurve = generateDemandCurve(txType, timestamp);

  // Interpolate demand at the given price
  for (let i = 0; i < demandCurve.length - 1; i++) {
    if (price >= demandCurve[i].price && price <= demandCurve[i + 1].price) {
      const t =
        (price - demandCurve[i].price) /
        (demandCurve[i + 1].price - demandCurve[i].price);
      return (
        demandCurve[i].quantity * (1 - t) + demandCurve[i + 1].quantity * t
      );
    }
  }

  // If price is beyond the curve, return the closest endpoint
  if (price <= demandCurve[0].price) return demandCurve[0].quantity;
  return demandCurve[demandCurve.length - 1].quantity;
}

/**
 * Calculate EIP-1559 base fee adjustment
 */
function calculateEIP1559BaseFee(
  currentBaseFee: number,
  utilization: number,
  params: EIP1559Params
): number {
  const utilizationDelta = utilization - params.targetUtilization;
  const feeChange =
    currentBaseFee * params.maxChangeRate * (utilizationDelta / params.targetUtilization);

  return Math.max(params.minBaseFee, currentBaseFee + feeChange);
}

/**
 * Run a single simulation step
 */
function simulationStep(
  config: SimulationConfig,
  prevSnapshot: SimulationSnapshot,
  resources: Resource[]
): SimulationSnapshot {
  const { transactionTypes, techStack, eip1559Params, timestep } = config;

  const timestamp = prevSnapshot.timestamp + timestep;
  const baseFee = prevSnapshot.baseFee;

  // Build simulation context
  const context: SimulationContext = {
    currentTransactions: transactionTypes,
    timestamp,
    activeTech: techStack,
    laneAssignments: {},
  };

  // Initialize resource states
  const resourceStates: Record<string, ResourceState> = {};
  for (const resource of resources) {
    const effectiveMax = getEffectiveMaxThroughput(resource, techStack);
    resourceStates[resource.id] = {
      resourceId: resource.id,
      currentThroughput: 0,
      utilization: 0,
      backpressure: 0,
      effectiveMaxThroughput: effectiveMax,
    };
  }

  // Calculate demand and execute transactions
  let transactionsExecuted = 0;
  let gasUsed = 0;

  for (const txType of transactionTypes) {
    // Get demand at current price
    const demand = getDemandAtPrice(txType, timestamp, baseFee);
    const desiredTxCount = demand * timestep;

    // Use new architecture if tech has calculateConsumption, otherwise legacy
    const hasTechConsumption = techStack.some(t => t.calculateConsumption);

    let executableTxCount = desiredTxCount;

    if (hasTechConsumption) {
      // New architecture: use calculateConsumption from tech
      const consumption = getResourceConsumptionNew(txType, techStack, context);

      for (const [resourceId, amount] of Object.entries(consumption)) {
        if (resourceStates[resourceId]) {
          const maxTxsForResource =
            (resourceStates[resourceId].effectiveMaxThroughput * timestep) / amount;

          const remainingCapacity =
            maxTxsForResource -
            resourceStates[resourceId].currentThroughput / (amount / timestep);

          executableTxCount = Math.min(executableTxCount, remainingCapacity);
        }
      }

      executableTxCount = Math.max(0, executableTxCount);

      // Update resource consumption
      for (const [resourceId, amount] of Object.entries(consumption)) {
        if (resourceStates[resourceId]) {
          const used = amount * executableTxCount;
          resourceStates[resourceId].currentThroughput += used / timestep;
        }
      }
    } else {
      // Legacy path
      for (const resource of resources) {
        const consumption = getResourceConsumption(txType, resource, techStack);
        if (consumption > 0) {
          const maxTxsForResource =
            (resourceStates[resource.id].effectiveMaxThroughput * timestep) /
            consumption;

          const remainingCapacity =
            maxTxsForResource -
            resourceStates[resource.id].currentThroughput /
              (consumption / timestep);

          executableTxCount = Math.min(executableTxCount, remainingCapacity);
        }
      }

      executableTxCount = Math.max(0, executableTxCount);

      // Update resource consumption (legacy)
      for (const resource of resources) {
        const consumption = getResourceConsumption(txType, resource, techStack);
        const used = consumption * executableTxCount;
        resourceStates[resource.id].currentThroughput += used / timestep;
      }
    }

    // Track transactions
    transactionsExecuted += executableTxCount;
    gasUsed += txType.averageGas * executableTxCount;

    // Track backpressure (unmet demand)
    const backpressure = (desiredTxCount - executableTxCount) / timestep;
    if (backpressure > 0) {
      for (const resource of resources) {
        const utilization =
          resourceStates[resource.id].currentThroughput /
          resourceStates[resource.id].effectiveMaxThroughput;
        if (utilization > 0.9) {
          resourceStates[resource.id].backpressure += backpressure;
        }
      }
    }
  }

  // Calculate utilization
  let maxUtilization = 0;
  for (const resource of resources) {
    resourceStates[resource.id].utilization = Math.min(
      1,
      resourceStates[resource.id].currentThroughput /
        resourceStates[resource.id].effectiveMaxThroughput
    );
    maxUtilization = Math.max(
      maxUtilization,
      resourceStates[resource.id].utilization
    );
  }

  // Calculate new base fee
  let newBaseFee = baseFee;
  if (config.feeMarketModel === 'eip1559') {
    newBaseFee = calculateEIP1559BaseFee(baseFee, maxUtilization, eip1559Params);
  }

  return {
    timestamp,
    resourceStates,
    baseFee: newBaseFee,
    transactionsExecuted: Math.round(transactionsExecuted),
    transactionsPending: 0,
    gasUsed: Math.round(gasUsed),
    tps: transactionsExecuted / timestep,
  };
}

/**
 * Run a complete simulation
 */
export function runSimulation(config: SimulationConfig): SimulationResult {
  const snapshots: SimulationSnapshot[] = [];

  // Compose resources from tech stack
  const resources = composeResources(config.techStack, config.resources);

  // Initial state
  const initialResourceStates: Record<string, ResourceState> = {};
  for (const resource of resources) {
    initialResourceStates[resource.id] = {
      resourceId: resource.id,
      currentThroughput: 0,
      utilization: 0,
      backpressure: 0,
      effectiveMaxThroughput: getEffectiveMaxThroughput(resource, config.techStack),
    };
  }

  let currentSnapshot: SimulationSnapshot = {
    timestamp: 0,
    resourceStates: initialResourceStates,
    baseFee: 20,
    transactionsExecuted: 0,
    transactionsPending: 0,
    gasUsed: 0,
    tps: 0,
  };

  snapshots.push(currentSnapshot);

  // Run simulation
  const steps = Math.ceil(config.duration / config.timestep);
  for (let i = 0; i < steps; i++) {
    currentSnapshot = simulationStep(config, currentSnapshot, resources);
    snapshots.push(currentSnapshot);
  }

  // Calculate summary statistics
  const summary = calculateSummary(snapshots, resources);

  return { snapshots, summary };
}

/**
 * Calculate summary statistics from simulation snapshots
 */
function calculateSummary(
  snapshots: SimulationSnapshot[],
  resources: Resource[]
): SimulationResult['summary'] {
  const tpsValues = snapshots.map((s) => s.tps);
  const baseFeeValues = snapshots.map((s) => s.baseFee);

  // Per-resource statistics
  const avgUtilization: Record<string, number> = {};
  const peakBackpressure: Record<string, number> = {};

  for (const resource of resources) {
    const utilizations = snapshots.map(
      (s) => s.resourceStates[resource.id]?.utilization || 0
    );
    const backpressures = snapshots.map(
      (s) => s.resourceStates[resource.id]?.backpressure || 0
    );

    avgUtilization[resource.id] = average(utilizations);
    peakBackpressure[resource.id] = Math.max(...backpressures);
  }

  // Find bottleneck (resource with highest average utilization)
  let bottleneckResource = resources[0]?.id || '';
  let maxAvgUtil = 0;
  for (const [resourceId, util] of Object.entries(avgUtilization)) {
    if (util > maxAvgUtil) {
      maxAvgUtil = util;
      bottleneckResource = resourceId;
    }
  }

  // Fee volatility (standard deviation / mean)
  const avgBaseFee = average(baseFeeValues);
  const feeStdDev = standardDeviation(baseFeeValues);
  const feeVolatility = avgBaseFee > 0 ? feeStdDev / avgBaseFee : 0;

  return {
    averageTPS: average(tpsValues),
    peakTPS: Math.max(...tpsValues),
    averageUtilization: avgUtilization,
    peakBackpressure,
    averageBaseFee: avgBaseFee,
    feeVolatility,
    bottleneckResource,
    totalTransactionsExecuted: snapshots.reduce(
      (sum, s) => sum + s.transactionsExecuted,
      0
    ),
  };
}

// Helper functions
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = average(values);
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(average(squareDiffs));
}

/**
 * Quick estimate of TPS for a given configuration
 * (without running full simulation)
 */
export function estimateTPS(
  resources: Resource[],
  transactionTypes: TransactionType[],
  techStack: Tech[]
): number {
  // Compose resources from tech stack
  const composedResources = composeResources(techStack, resources);

  // For each resource, calculate max TPS based on that resource
  const tpsPerResource: Record<string, number> = {};

  for (const resource of composedResources) {
    const effectiveMax = getEffectiveMaxThroughput(resource, techStack);

    // Calculate weighted average consumption across transaction types
    let totalConsumption = 0;
    let totalWeight = 0;

    for (const txType of transactionTypes) {
      const consumption = getResourceConsumption(txType, resource, techStack);
      const weight = txType.percentOfMainnetTxs;

      if (consumption > 0) {
        totalConsumption += consumption * weight;
        totalWeight += weight;
      }
    }

    if (totalConsumption > 0 && totalWeight > 0) {
      const avgConsumption = totalConsumption / totalWeight;
      tpsPerResource[resource.id] = effectiveMax / avgConsumption;
    }
  }

  // Return the minimum (bottleneck)
  const tpsValues = Object.values(tpsPerResource);
  return tpsValues.length > 0 ? Math.min(...tpsValues) : 0;
}
