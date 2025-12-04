import { describe, it, expect } from 'vitest';
import {
  calculateAverageGas,
  calculateMaxTPS,
  calculateThroughput,
  calculateDemand,
  createInitialState,
  simulateStep,
  runFullSimulation,
  calculateSimulationStats,
  type SimulationConfig,
  type TransactionMixEntry,
  type DemandScenario,
} from '../core';
import { normalDay, nftDrop, gradualGrowth } from '../scenarios';
import type { TransactionType } from '@/data/transactions/types';

// Mock transaction types for testing
const mockTransfer: TransactionType = {
  id: 'mock-transfer',
  name: 'Mock Transfer',
  description: 'Test transfer',
  category: 'transfer',
  stateAccess: {
    reads: [{ type: 'sender' }, { type: 'receiver' }],
    writes: [{ type: 'sender' }, { type: 'receiver' }],
  },
  resourceConsumption: { 'cpu-gas': 21000 },
  baseDemand: 10,
  demandVolatility: 0.2,
  priceElasticity: 0.3,
  averageGas: 21000,
  percentOfMainnetTxs: 40,
  color: '#4DABF7',
};

const mockSwap: TransactionType = {
  id: 'mock-swap',
  name: 'Mock Swap',
  description: 'Test swap',
  category: 'defi',
  stateAccess: {
    reads: [{ type: 'specific', slot: 'pool:test' }],
    writes: [{ type: 'specific', slot: 'pool:test' }],
  },
  resourceConsumption: { 'cpu-gas': 150000 },
  baseDemand: 5,
  demandVolatility: 0.8,
  priceElasticity: 0.5,
  averageGas: 150000,
  percentOfMainnetTxs: 10,
  color: '#FF6B6B',
};

describe('Core Simulation', () => {
  describe('calculateAverageGas', () => {
    it('should calculate weighted average gas', () => {
      const mix: TransactionMixEntry[] = [
        { txType: mockTransfer, weight: 1 },
        { txType: mockSwap, weight: 1 },
      ];

      const avgGas = calculateAverageGas(mix);

      // (21000 + 150000) / 2 = 85500
      expect(avgGas).toBe(85500);
    });

    it('should handle weighted mix', () => {
      const mix: TransactionMixEntry[] = [
        { txType: mockTransfer, weight: 3 },
        { txType: mockSwap, weight: 1 },
      ];

      const avgGas = calculateAverageGas(mix);

      // (21000 * 3 + 150000 * 1) / 4 = 53250
      expect(avgGas).toBe(53250);
    });

    it('should return default for empty mix', () => {
      const avgGas = calculateAverageGas([]);
      expect(avgGas).toBe(21000);
    });
  });

  describe('calculateMaxTPS', () => {
    it('should calculate max TPS from gas capacity', () => {
      // 2.5 Mgas/sec with 25000 gas per tx = 100 TPS
      const maxTPS = calculateMaxTPS(2.5, 25000);
      expect(maxTPS).toBe(100);
    });

    it('should handle simple transfers', () => {
      // 2.5 Mgas/sec with 21000 gas per tx ≈ 119 TPS
      const maxTPS = calculateMaxTPS(2.5, 21000);
      expect(maxTPS).toBeCloseTo(119.05, 1);
    });

    it('should scale with gas capacity', () => {
      const baseline = calculateMaxTPS(2.5, 21000);
      const doubled = calculateMaxTPS(5.0, 21000);

      expect(doubled).toBeCloseTo(baseline * 2, 1);
    });
  });

  describe('calculateThroughput', () => {
    it('should return demand when under capacity', () => {
      const { tps, utilization } = calculateThroughput(50, 2.5, 21000);

      expect(tps).toBe(50);
      expect(utilization).toBeLessThan(1);
    });

    it('should cap at capacity when demand exceeds it', () => {
      const maxTPS = calculateMaxTPS(2.5, 21000);
      const { tps, utilization } = calculateThroughput(1000, 2.5, 21000);

      expect(tps).toBeCloseTo(maxTPS, 1);
      expect(utilization).toBe(1);
    });

    it('should calculate correct gas used', () => {
      const { tps, gasUsed } = calculateThroughput(100, 2.5, 21000);

      // 100 TPS * 21000 gas / 1M = 2.1 Mgas/sec
      expect(gasUsed).toBeCloseTo(tps * 21000 / 1_000_000, 3);
    });
  });

  describe('calculateDemand', () => {
    it('should calculate total demand', () => {
      const mix: TransactionMixEntry[] = [
        { txType: mockTransfer, weight: 1 },
      ];

      const { total } = calculateDemand(mix, 20, 1);

      // At baseline fee (20 gwei), demand response = 1
      // baseDemand = 10
      expect(total).toBeGreaterThan(0);
    });

    it('should reduce demand at higher fees', () => {
      const mix: TransactionMixEntry[] = [
        { txType: mockTransfer, weight: 1 },
      ];

      const lowFee = calculateDemand(mix, 20, 1);
      const highFee = calculateDemand(mix, 100, 1);

      expect(highFee.total).toBeLessThan(lowFee.total);
    });

    it('should apply demand multiplier', () => {
      const mix: TransactionMixEntry[] = [
        { txType: mockTransfer, weight: 1 },
      ];

      const normal = calculateDemand(mix, 20, 1);
      const spike = calculateDemand(mix, 20, 3);

      expect(spike.total).toBeCloseTo(normal.total * 3, 1);
    });
  });

  describe('createInitialState', () => {
    it('should create state with correct gas capacity', () => {
      const config: SimulationConfig = {
        gasPerSecond: 2.5,
        techMultiplier: 1,
        transactionMix: [{ txType: mockTransfer, weight: 1 }],
        scenario: normalDay,
        simulationSpeed: 1,
      };

      const state = createInitialState(config);

      expect(state.gasCapacity).toBe(2.5);
      expect(state.timestamp).toBe(0);
      expect(state.isComplete).toBe(false);
      expect(state.baseFee).toBe(20);
    });

    it('should apply tech multiplier to capacity', () => {
      const config: SimulationConfig = {
        gasPerSecond: 2.5,
        techMultiplier: 4,
        transactionMix: [{ txType: mockTransfer, weight: 1 }],
        scenario: normalDay,
        simulationSpeed: 1,
      };

      const state = createInitialState(config);

      expect(state.gasCapacity).toBe(10); // 2.5 * 4
    });
  });

  describe('simulateStep', () => {
    const baseConfig: SimulationConfig = {
      gasPerSecond: 2.5,
      techMultiplier: 1,
      transactionMix: [{ txType: mockTransfer, weight: 1 }],
      scenario: normalDay,
      simulationSpeed: 1,
    };

    it('should advance timestamp', () => {
      const state = createInitialState(baseConfig);
      const nextState = simulateStep(state, baseConfig, 1);

      expect(nextState.timestamp).toBe(1);
    });

    it('should mark complete when reaching duration', () => {
      const state = { ...createInitialState(baseConfig), timestamp: 299 };
      const nextState = simulateStep(state, baseConfig, 2);

      expect(nextState.isComplete).toBe(true);
      expect(nextState.timestamp).toBe(300);
    });

    it('should calculate TPS', () => {
      const state = createInitialState(baseConfig);
      const nextState = simulateStep(state, baseConfig, 1);

      expect(nextState.tps).toBeGreaterThan(0);
    });

    it('should update base fee based on utilization', () => {
      // Use a mix with high base demand to ensure we hit capacity
      const highDemandTransfer: TransactionType = {
        ...mockTransfer,
        baseDemand: 500, // Very high demand
      };

      const highDemandConfig: SimulationConfig = {
        ...baseConfig,
        transactionMix: [{ txType: highDemandTransfer, weight: 1 }],
        scenario: {
          ...normalDay,
          getDemandMultiplier: () => 2, // Double the already high demand
        },
      };

      const state = createInitialState(highDemandConfig);
      const nextState = simulateStep(state, highDemandConfig, 1);

      // Should hit capacity, causing utilization > 50%, so fee increases
      expect(nextState.utilization).toBeGreaterThan(0.5);
      expect(nextState.baseFee).toBeGreaterThan(state.baseFee);
    });
  });

  describe('runFullSimulation', () => {
    it('should run until completion', () => {
      const config: SimulationConfig = {
        gasPerSecond: 2.5,
        techMultiplier: 1,
        transactionMix: [{ txType: mockTransfer, weight: 1 }],
        scenario: normalDay,
        simulationSpeed: 1,
      };

      const history = runFullSimulation(config, 1);

      expect(history.states.length).toBeGreaterThan(1);
      expect(history.states[history.states.length - 1].isComplete).toBe(true);
    });

    it('should handle NFT drop scenario', () => {
      const config: SimulationConfig = {
        gasPerSecond: 2.5,
        techMultiplier: 1,
        transactionMix: [{ txType: mockTransfer, weight: 1 }],
        scenario: nftDrop,
        simulationSpeed: 1,
      };

      const history = runFullSimulation(config, 1);
      const stats = calculateSimulationStats(history);

      // NFT drop should have higher peak than average
      expect(stats.peakTPS).toBeGreaterThan(stats.avgTPS);
    });

    it('should show scaling benefit', () => {
      // Use high demand to ensure we're hitting capacity limits
      const highDemandTransfer: TransactionType = {
        ...mockTransfer,
        baseDemand: 200, // High enough to saturate baseline
      };

      // Use stress test scenario for sustained high load
      const stressScenario: DemandScenario = {
        id: 'test-stress',
        name: 'Test Stress',
        description: 'High sustained demand',
        duration: 50,
        getDemandMultiplier: () => 3, // Triple demand
      };

      const baseConfig: SimulationConfig = {
        gasPerSecond: 2.5,
        techMultiplier: 1,
        transactionMix: [{ txType: highDemandTransfer, weight: 1 }],
        scenario: stressScenario,
        simulationSpeed: 1,
      };

      const scaledConfig: SimulationConfig = {
        ...baseConfig,
        techMultiplier: 4,
      };

      const baseHistory = runFullSimulation(baseConfig, 1);
      const scaledHistory = runFullSimulation(scaledConfig, 1);

      const baseStats = calculateSimulationStats(baseHistory);
      const scaledStats = calculateSimulationStats(scaledHistory);

      // With high demand, base should be constrained and scaled should do better
      // Note: Price elasticity means demand drops as fees rise, so utilization won't hit 100%
      expect(baseStats.avgUtilization).toBeGreaterThan(0.5); // Base should be above target
      expect(scaledStats.peakTPS).toBeGreaterThan(baseStats.peakTPS); // Scaled can handle peaks better
    });
  });

  describe('calculateSimulationStats', () => {
    it('should calculate statistics correctly', () => {
      const config: SimulationConfig = {
        gasPerSecond: 2.5,
        techMultiplier: 1,
        transactionMix: [{ txType: mockTransfer, weight: 1 }],
        scenario: nftDrop,
        simulationSpeed: 1,
      };

      const history = runFullSimulation(config, 1);
      const stats = calculateSimulationStats(history);

      expect(stats.avgTPS).toBeGreaterThan(0);
      expect(stats.peakTPS).toBeGreaterThanOrEqual(stats.avgTPS);
      expect(stats.avgUtilization).toBeGreaterThanOrEqual(0);
      expect(stats.avgUtilization).toBeLessThanOrEqual(1);
    });

    it('should handle empty history', () => {
      const stats = calculateSimulationStats({ states: [], config: {} as SimulationConfig });

      expect(stats.avgTPS).toBe(0);
      expect(stats.peakTPS).toBe(0);
    });
  });
});
