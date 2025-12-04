/**
 * Demand Scenarios
 *
 * Pre-defined scenarios that control how demand changes over time.
 * Each scenario has a duration and a function that returns
 * the demand multiplier at any point in time.
 */

import type { DemandScenario } from './core';

/**
 * Normal Day
 * Steady demand with minor fluctuations throughout the day
 */
export const normalDay: DemandScenario = {
  id: 'normal',
  name: 'Normal Day',
  description: 'Steady demand with minor fluctuations',
  duration: 300,
  getDemandMultiplier: (t) => {
    // Gentle sine wave for natural variation
    return 1 + 0.2 * Math.sin(t * Math.PI * 4);
  },
};

/**
 * NFT Drop
 * Sudden massive spike when a popular collection goes live
 */
export const nftDrop: DemandScenario = {
  id: 'nft-drop',
  name: 'NFT Drop',
  description: 'Popular mint causes demand spike',
  duration: 300,
  getDemandMultiplier: (t) => {
    // Build up anticipation
    if (t < 0.2) return 1 + t * 2;

    // Spike at mint time
    if (t < 0.25) return 1.4 + (t - 0.2) / 0.05 * 4;

    // Peak chaos
    if (t < 0.4) return 5.4;

    // Gradual decay as supply runs out
    if (t < 0.7) return 5.4 - (t - 0.4) / 0.3 * 3;

    // Return to slightly elevated normal
    return 2.4 - (t - 0.7) / 0.3 * 1.2;
  },
};

/**
 * Market Crash
 * Sustained high demand as everyone rushes to DeFi
 */
export const marketCrash: DemandScenario = {
  id: 'market-crash',
  name: 'Market Crash',
  description: 'Panic selling creates sustained high demand',
  duration: 300,
  getDemandMultiplier: (t) => {
    // Normal start
    if (t < 0.1) return 1;

    // Sudden spike as news breaks
    if (t < 0.15) return 1 + (t - 0.1) / 0.05 * 3;

    // Sustained chaos with waves of panic
    if (t < 0.8) {
      const baseHigh = 4;
      const waves = Math.sin(t * Math.PI * 8) * 0.8;
      return baseHigh + waves;
    }

    // Gradual recovery
    return 4 - (t - 0.8) / 0.2 * 2.5;
  },
};

/**
 * Gradual Growth
 * Demand slowly increasing - good for showing capacity limits
 */
export const gradualGrowth: DemandScenario = {
  id: 'gradual-growth',
  name: 'Gradual Growth',
  description: 'Demand steadily increases over time',
  duration: 300,
  getDemandMultiplier: (t) => {
    // Linear growth from 0.5x to 3x
    return 0.5 + t * 2.5;
  },
};

/**
 * Stress Test
 * Maximum sustained load - shows what breaks first
 */
export const stressTest: DemandScenario = {
  id: 'stress-test',
  name: 'Stress Test',
  description: 'Maximum sustained load',
  duration: 300,
  getDemandMultiplier: (t) => {
    // Ramp up quickly then hold at max
    if (t < 0.1) return 1 + t * 40;
    return 5;
  },
};

/**
 * Oscillating Demand
 * Regular peaks and troughs - good for showing EIP-1559 response
 */
export const oscillating: DemandScenario = {
  id: 'oscillating',
  name: 'Oscillating',
  description: 'Regular demand cycles',
  duration: 300,
  getDemandMultiplier: (t) => {
    // Oscillate between 0.5x and 3x
    return 1.75 + 1.25 * Math.sin(t * Math.PI * 6);
  },
};

/**
 * All available scenarios
 */
export const scenarios: DemandScenario[] = [
  normalDay,
  nftDrop,
  marketCrash,
  gradualGrowth,
  stressTest,
  oscillating,
];

/**
 * Get scenario by ID
 */
export function getScenario(id: string): DemandScenario | undefined {
  return scenarios.find(s => s.id === id);
}

/**
 * Default scenario
 */
export const defaultScenario = normalDay;
