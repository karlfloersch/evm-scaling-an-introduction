import { describe, it, expect } from 'vitest';
import {
  calculateNewBaseFee,
  calculateDemandResponse,
  generateUtilization,
  processBlock,
  createInitialState,
  runSimulation,
  calculateStats,
  DEFAULT_CONFIG,
  type EIP1559Config,
} from '../eip1559';

describe('EIP-1559 Simulation', () => {
  describe('calculateNewBaseFee', () => {
    it('should not change base fee at target utilization (50%)', () => {
      const currentFee = 100;
      const utilization = 0.5; // exactly at target

      const newFee = calculateNewBaseFee(currentFee, utilization);

      expect(newFee).toBe(currentFee);
    });

    it('should increase base fee by 12.5% at 100% utilization', () => {
      const currentFee = 100;
      const utilization = 1.0; // full block

      const newFee = calculateNewBaseFee(currentFee, utilization);

      // At 100% utilization, delta from target (50%) = 0.5
      // feeChangeRatio = 0.125 * (0.5 / 0.5) = 0.125
      // newFee = 100 * 1.125 = 112.5
      expect(newFee).toBe(112.5);
    });

    it('should decrease base fee by 12.5% at 0% utilization', () => {
      const currentFee = 100;
      const utilization = 0; // empty block

      const newFee = calculateNewBaseFee(currentFee, utilization);

      // At 0% utilization, delta from target (50%) = -0.5
      // feeChangeRatio = 0.125 * (-0.5 / 0.5) = -0.125
      // newFee = 100 * 0.875 = 87.5
      expect(newFee).toBe(87.5);
    });

    it('should increase proportionally between 50% and 100%', () => {
      const currentFee = 100;

      // At 75% utilization, delta = 0.25
      // feeChangeRatio = 0.125 * (0.25 / 0.5) = 0.0625
      // newFee = 100 * 1.0625 = 106.25
      const newFee = calculateNewBaseFee(currentFee, 0.75);

      expect(newFee).toBe(106.25);
    });

    it('should decrease proportionally between 0% and 50%', () => {
      const currentFee = 100;

      // At 25% utilization, delta = -0.25
      // feeChangeRatio = 0.125 * (-0.25 / 0.5) = -0.0625
      // newFee = 100 * 0.9375 = 93.75
      const newFee = calculateNewBaseFee(currentFee, 0.25);

      expect(newFee).toBe(93.75);
    });

    it('should enforce minimum base fee', () => {
      const currentFee = 1;
      const utilization = 0; // empty block, fee should decrease

      const newFee = calculateNewBaseFee(currentFee, utilization);

      // Should not go below minBaseFee (default 1)
      expect(newFee).toBeGreaterThanOrEqual(DEFAULT_CONFIG.minBaseFee);
    });

    it('should clamp utilization above 1', () => {
      const currentFee = 100;
      const utilization = 1.5; // invalid, should be clamped to 1

      const newFee = calculateNewBaseFee(currentFee, utilization);

      // Should behave same as utilization = 1
      expect(newFee).toBe(112.5);
    });

    it('should clamp utilization below 0', () => {
      const currentFee = 100;
      const utilization = -0.5; // invalid, should be clamped to 0

      const newFee = calculateNewBaseFee(currentFee, utilization);

      // Should behave same as utilization = 0
      expect(newFee).toBe(87.5);
    });

    it('should respect custom config', () => {
      const currentFee = 100;
      const utilization = 1.0;
      const config: Partial<EIP1559Config> = {
        targetUtilization: 0.8, // Different target
        maxChangeRate: 0.25, // Higher max change
      };

      const newFee = calculateNewBaseFee(currentFee, utilization, config);

      // At 100% with 80% target, delta = 0.2
      // feeChangeRatio = 0.25 * (0.2 / 0.8) = 0.0625
      // newFee = 100 * 1.0625 = 106.25
      expect(newFee).toBe(106.25);
    });

    it('should compound correctly over multiple blocks', () => {
      let fee = 100;

      // 5 full blocks should compound the 12.5% increase
      for (let i = 0; i < 5; i++) {
        fee = calculateNewBaseFee(fee, 1.0);
      }

      // 100 * (1.125)^5 ≈ 180.20
      expect(fee).toBeCloseTo(180.20, 1);
    });

    it('should converge from high fee when demand is low', () => {
      let fee = 1000; // Very high fee

      // With low utilization (empty blocks due to high price), fee should decrease
      for (let i = 0; i < 20; i++) {
        fee = calculateNewBaseFee(fee, 0);
      }

      // Should be significantly lower
      expect(fee).toBeLessThan(100);
    });
  });

  describe('calculateDemandResponse', () => {
    it('should return full demand when fee equals baseline', () => {
      const demandLevel = 0.8;
      const baseFee = 20;
      const baselineFee = 20;

      const response = calculateDemandResponse(demandLevel, baseFee, baselineFee);

      expect(response).toBe(0.8);
    });

    it('should halve demand when fee doubles from baseline', () => {
      const demandLevel = 1.0;
      const baseFee = 40;
      const baselineFee = 20;

      const response = calculateDemandResponse(demandLevel, baseFee, baselineFee);

      expect(response).toBe(0.5);
    });

    it('should double demand effect when fee halves', () => {
      const demandLevel = 0.4;
      const baseFee = 10;
      const baselineFee = 20;

      const response = calculateDemandResponse(demandLevel, baseFee, baselineFee);

      // 0.4 * (20/10) = 0.8, but clamped to 1.0 max
      expect(response).toBe(0.8);
    });

    it('should clamp to 0 when fee is very high', () => {
      const demandLevel = 0.5;
      const baseFee = 10000;
      const baselineFee = 20;

      const response = calculateDemandResponse(demandLevel, baseFee, baselineFee);

      expect(response).toBeCloseTo(0.001, 3);
    });

    it('should clamp to 1 when low fee meets high demand', () => {
      const demandLevel = 1.0;
      const baseFee = 5;
      const baselineFee = 20;

      const response = calculateDemandResponse(demandLevel, baseFee, baselineFee);

      // Would be 4.0 but clamped to 1
      expect(response).toBe(1.0);
    });
  });

  describe('generateUtilization', () => {
    it('should return baseDemand when noise is 0', () => {
      const baseDemand = 0.7;
      const utilization = generateUtilization(baseDemand, 0, 0.5);

      expect(utilization).toBe(0.7);
    });

    it('should add noise when random seed is provided', () => {
      const baseDemand = 0.5;
      const noiseLevel = 0.1;

      // Random seed 1.0 should give max positive noise
      const highUtil = generateUtilization(baseDemand, noiseLevel, 1.0);
      // noise = (1.0 - 0.5) * 2 * 0.1 = 0.1
      expect(highUtil).toBeCloseTo(0.6, 5);

      // Random seed 0.0 should give max negative noise
      const lowUtil = generateUtilization(baseDemand, noiseLevel, 0.0);
      // noise = (0.0 - 0.5) * 2 * 0.1 = -0.1
      expect(lowUtil).toBeCloseTo(0.4, 5);
    });

    it('should clamp result to [0, 1]', () => {
      // High demand + positive noise should clamp to 1
      const high = generateUtilization(0.95, 0.2, 1.0);
      expect(high).toBe(1.0);

      // Low demand + negative noise should clamp to 0
      const low = generateUtilization(0.05, 0.2, 0.0);
      expect(low).toBe(0.0);
    });

    it('should be deterministic with same seed', () => {
      const util1 = generateUtilization(0.5, 0.1, 0.7);
      const util2 = generateUtilization(0.5, 0.1, 0.7);

      expect(util1).toBe(util2);
    });
  });

  describe('createInitialState', () => {
    it('should create state with default config', () => {
      const state = createInitialState();

      expect(state.blocks).toEqual([]);
      expect(state.currentBaseFee).toBe(20);
      expect(state.blockNumber).toBe(0);
    });

    it('should use custom initial base fee', () => {
      const state = createInitialState({ initialBaseFee: 50 });

      expect(state.currentBaseFee).toBe(50);
    });
  });

  describe('processBlock', () => {
    it('should add block to state', () => {
      const state = createInitialState();
      const newState = processBlock(state, 0.6);

      expect(newState.blocks.length).toBe(1);
      expect(newState.blockNumber).toBe(1);
    });

    it('should record block with current base fee', () => {
      const state = createInitialState({ initialBaseFee: 100 });
      const newState = processBlock(state, 0.6);

      expect(newState.blocks[0].baseFee).toBe(100);
      expect(newState.blocks[0].utilization).toBe(0.6);
      expect(newState.blocks[0].number).toBe(1);
    });

    it('should update base fee for next block', () => {
      const state = createInitialState({ initialBaseFee: 100 });
      const newState = processBlock(state, 0.75); // Above target

      // Fee should increase
      expect(newState.currentBaseFee).toBeGreaterThan(100);
    });

    it('should preserve immutability', () => {
      const state = createInitialState();
      const newState = processBlock(state, 0.5);

      expect(state.blocks.length).toBe(0);
      expect(newState.blocks.length).toBe(1);
    });
  });

  describe('runSimulation', () => {
    it('should run for specified number of blocks', () => {
      const state = runSimulation(10, 0.5);

      expect(state.blocks.length).toBe(10);
      expect(state.blockNumber).toBe(10);
    });

    it('should converge to stable fee at target demand', () => {
      // Demand level 0.5 should converge to target utilization
      const state = runSimulation(100, 0.5, {}, { noiseLevel: 0 });

      // Fee should be relatively stable (not exploding or crashing)
      expect(state.currentBaseFee).toBeGreaterThan(5);
      expect(state.currentBaseFee).toBeLessThan(100);
    });

    it('should increase fee under high demand', () => {
      const state = runSimulation(20, 1.0, {}, { noiseLevel: 0 });

      // With high demand, fee should increase
      // Note: demand-responsive pricing means utilization drops as fee rises
      // So fee won't increase as aggressively as if blocks stayed 100% full
      expect(state.currentBaseFee).toBeGreaterThan(DEFAULT_CONFIG.initialBaseFee * 1.5);
    });

    it('should decrease fee under low demand', () => {
      const state = runSimulation(20, 0.2, {}, { noiseLevel: 0 });

      // With low demand, utilization should be below target
      // Fee should decrease
      expect(state.currentBaseFee).toBeLessThan(DEFAULT_CONFIG.initialBaseFee);
    });

    it('should be deterministic with random seeds', () => {
      const seeds = [0.3, 0.7, 0.2, 0.8, 0.5];

      const state1 = runSimulation(5, 0.5, {}, { noiseLevel: 0.1, randomSeeds: seeds });
      const state2 = runSimulation(5, 0.5, {}, { noiseLevel: 0.1, randomSeeds: seeds });

      expect(state1.blocks).toEqual(state2.blocks);
      expect(state1.currentBaseFee).toBe(state2.currentBaseFee);
    });
  });

  describe('calculateStats', () => {
    it('should handle empty state', () => {
      const state = createInitialState();
      const stats = calculateStats(state);

      expect(stats.averageBaseFee).toBe(20);
      expect(stats.blocksAboveTarget).toBe(0);
      expect(stats.blocksBelowTarget).toBe(0);
    });

    it('should calculate correct averages', () => {
      // Create state with known blocks
      const state = runSimulation(4, 0.5, {}, {
        noiseLevel: 0,
        // No seeds needed since noiseLevel is 0
      });

      const stats = calculateStats(state);

      // All utilizations should be 0.5 (at target)
      expect(stats.averageUtilization).toBeCloseTo(0.5, 5);
    });

    it('should count blocks above and below target', () => {
      // Run simulation with seeds that create varied utilization
      const seeds = [0.0, 0.0, 1.0, 1.0]; // 2 low, 2 high
      const state = runSimulation(4, 0.5, {}, {
        noiseLevel: 0.2,
        randomSeeds: seeds,
      });

      const stats = calculateStats(state);

      expect(stats.blocksAboveTarget).toBe(2);
      expect(stats.blocksBelowTarget).toBe(2);
    });

    it('should calculate fee volatility', () => {
      // Run simulation that causes fee changes
      const state = runSimulation(20, 0.8, {}, { noiseLevel: 0 });

      const stats = calculateStats(state);

      // With consistently high utilization, fee should be increasing
      // Volatility should be non-zero
      expect(stats.feeVolatility).toBeGreaterThan(0);
      expect(stats.maxBaseFee).toBeGreaterThan(stats.minBaseFee);
    });
  });

  describe('Integration: Fee Market Dynamics', () => {
    it('should stabilize with demand-responsive pricing', () => {
      // This tests the full feedback loop:
      // High demand -> High utilization -> Fee increases -> Demand drops -> Utilization drops

      // Start with very high demand
      let state = createInitialState();
      const demandLevel = 0.9;

      for (let i = 0; i < 50; i++) {
        const demand = calculateDemandResponse(demandLevel, state.currentBaseFee);
        const utilization = generateUtilization(demand, 0); // No noise for determinism
        state = processBlock(state, utilization);
      }

      const stats = calculateStats(state);

      // System should find equilibrium where average utilization is near target
      // This is because high fees reduce demand
      expect(stats.averageUtilization).toBeGreaterThan(0.3);
      expect(stats.averageUtilization).toBeLessThan(0.7);
    });

    it('should handle sudden demand spike', () => {
      // Low demand for 20 blocks
      let state = runSimulation(20, 0.3, {}, { noiseLevel: 0 });
      const feeBeforeSpike = state.currentBaseFee;

      // Spike to high demand for 10 blocks
      for (let i = 0; i < 10; i++) {
        const demand = calculateDemandResponse(1.0, state.currentBaseFee);
        const utilization = generateUtilization(demand, 0);
        state = processBlock(state, utilization);
      }

      // Fee should have increased significantly
      expect(state.currentBaseFee).toBeGreaterThan(feeBeforeSpike * 1.5);
    });

    it('should recover from demand crash', () => {
      // High demand for 20 blocks
      let state = runSimulation(20, 0.9, {}, { noiseLevel: 0 });
      const feeAfterHighDemand = state.currentBaseFee;

      // Crash to no demand for 30 blocks
      for (let i = 0; i < 30; i++) {
        const demand = calculateDemandResponse(0.1, state.currentBaseFee);
        const utilization = generateUtilization(demand, 0);
        state = processBlock(state, utilization);
      }

      // Fee should have decreased significantly
      expect(state.currentBaseFee).toBeLessThan(feeAfterHighDemand * 0.5);
    });
  });
});
