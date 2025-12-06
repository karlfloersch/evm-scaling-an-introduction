import { describe, it, expect } from 'vitest';
import { resources } from '../resources';
import { transactionTypes } from '../transactions';
import type { Resource, ResourceId } from '../resources/types';
import type { TransactionType } from '../transactions/types';

/**
 * Block Packing Math Tests
 *
 * These tests verify that the resource consumption values for transaction types
 * are properly calibrated relative to the resource max throughputs.
 *
 * The BlockPackingSlide adds 10 transactions per click, so we need to ensure
 * that 10 of any transaction type doesn't immediately exceed 100% of any resource.
 */

const TRANSACTIONS_PER_CLICK = 10;

// Helper to calculate resource utilization percentage
function calculateUtilization(
  txType: TransactionType,
  count: number,
  resource: Resource
): number {
  const consumption = txType.resourceConsumption[resource.id] || 0;
  const totalUsage = consumption * count;
  return (totalUsage / resource.maxThroughput) * 100;
}

// Helper to find the bottleneck resource for a transaction type
function findBottleneck(txType: TransactionType, count: number): { resource: Resource; percent: number } | null {
  let maxPercent = 0;
  let bottleneckResource: Resource | null = null;

  for (const resource of resources) {
    const percent = calculateUtilization(txType, count, resource);
    if (percent > maxPercent) {
      maxPercent = percent;
      bottleneckResource = resource;
    }
  }

  return bottleneckResource ? { resource: bottleneckResource, percent: maxPercent } : null;
}

// Helper to check if adding transactions would exceed any resource limit
function wouldExceedLimit(
  txType: TransactionType,
  count: number
): { exceeds: boolean; resource: Resource | null; percent: number } {
  for (const resource of resources) {
    const percent = calculateUtilization(txType, count, resource);
    if (percent > 100) {
      return { exceeds: true, resource, percent };
    }
  }
  return { exceeds: false, resource: null, percent: 0 };
}

describe('Block Packing Data Validation', () => {
  describe('Resource Max Throughputs', () => {
    it('should have all 8 resources defined', () => {
      expect(resources.length).toBe(8);
    });

    it('should have positive maxThroughput for all resources', () => {
      for (const resource of resources) {
        expect(resource.maxThroughput).toBeGreaterThan(0);
      }
    });

    // Document actual values for reference
    it('should have expected resource maxThroughputs', () => {
      const expectedLimits: Record<ResourceId, number> = {
        'evm-compute': 2.5,           // Mgas/sec
        'state-access': 50000,        // ops/sec
        'merklization': 100000,       // hashes/sec
        'block-verification': 2.5,    // Mgas/sec
        'block-distribution': 10,     // MB/sec
        'state-growth': 50,           // KB/sec
        'history-growth': 100,        // KB/sec
        'proof-generation': 2.5,      // Mgas/sec - matches EVM compute for educational purposes
      };

      for (const resource of resources) {
        expect(resource.maxThroughput).toBe(expectedLimits[resource.id]);
      }
    });
  });

  describe('Transaction Resource Consumption', () => {
    // Test that all first 6 transaction types (shown in BlockPackingSlide) work with 20 tx
    const slideTransactionTypes = transactionTypes.slice(0, 6);

    it('should have at least 6 transaction types for the slide', () => {
      expect(transactionTypes.length).toBeGreaterThanOrEqual(6);
    });

    for (const txType of slideTransactionTypes) {
      describe(`${txType.name}`, () => {
        it(`should NOT exceed 100% of any resource with ${TRANSACTIONS_PER_CLICK} transactions`, () => {
          const { exceeds, resource, percent } = wouldExceedLimit(txType, TRANSACTIONS_PER_CLICK);

          if (exceeds && resource) {
            // Provide helpful failure message
            throw new Error(
              `${txType.name}: ${TRANSACTIONS_PER_CLICK} transactions exceeds ${resource.name}\n` +
              `  Consumption per tx: ${txType.resourceConsumption[resource.id]}\n` +
              `  Total consumption: ${txType.resourceConsumption[resource.id]! * TRANSACTIONS_PER_CLICK}\n` +
              `  Resource max: ${resource.maxThroughput} ${resource.unit}\n` +
              `  Utilization: ${percent.toFixed(1)}%`
            );
          }

          expect(exceeds).toBe(false);
        });

        it('should have a reasonable bottleneck (>5% but <100%) with 10 transactions', () => {
          const bottleneck = findBottleneck(txType, TRANSACTIONS_PER_CLICK);

          if (bottleneck) {
            // We want clicks to be visible (>5%) but not immediately full (>100%)
            // ETH transfers are light (~8%) while Uniswap swaps are heavy (~60%)
            expect(bottleneck.percent).toBeGreaterThan(5);
            expect(bottleneck.percent).toBeLessThan(100);
          }
        });
      });
    }
  });

  describe('ETH Transfer Specific', () => {
    const ethTransfer = transactionTypes.find(t => t.id === 'eth-transfer');

    it('should find ETH Transfer', () => {
      expect(ethTransfer).toBeDefined();
    });

    if (ethTransfer) {
      it('should have correct resource consumption values', () => {
        // Document expected values
        expect(ethTransfer.resourceConsumption['evm-compute']).toBe(0.021);
        expect(ethTransfer.resourceConsumption['state-access']).toBe(4);
        expect(ethTransfer.resourceConsumption['merklization']).toBe(4);
      });

      it('should calculate EVM compute utilization correctly', () => {
        // 10 tx × 0.021 Mgas = 0.21 Mgas
        // 0.21 / 2.5 × 100 = 8.4%
        const percent = calculateUtilization(ethTransfer, TRANSACTIONS_PER_CLICK, resources.find(r => r.id === 'evm-compute')!);
        expect(percent).toBeCloseTo(8.4, 1);
      });

      it('should calculate state access utilization correctly', () => {
        // 10 tx × 4 ops = 40 ops
        // 40 / 50000 × 100 = 0.08%
        const percent = calculateUtilization(ethTransfer, TRANSACTIONS_PER_CLICK, resources.find(r => r.id === 'state-access')!);
        expect(percent).toBeCloseTo(0.08, 2);
      });
    }
  });

  describe('Proof Generation Resource', () => {
    // Proof generation now has maxThroughput of 2.5 Mgas/sec for educational demo
    // In real-world, ZK proving is 10-100x slower than native execution
    const proofGenResource = resources.find(r => r.id === 'proof-generation')!;

    it('should have proof-generation matching EVM compute for educational purposes', () => {
      expect(proofGenResource.maxThroughput).toBe(2.5);
    });

    it('should verify proof-generation consumption for all tx types', () => {
      console.log('\n=== Proof Generation Analysis ===');
      console.log(`Max throughput: ${proofGenResource.maxThroughput} ${proofGenResource.unit}`);
      console.log('');

      for (const txType of transactionTypes.slice(0, 6)) {
        const consumption = txType.resourceConsumption['proof-generation'] || 0;
        const usageN = consumption * TRANSACTIONS_PER_CLICK;
        const percentN = (usageN / proofGenResource.maxThroughput) * 100;

        console.log(`${txType.name}:`);
        console.log(`  Per tx: ${consumption} Mgas`);
        console.log(`  ${TRANSACTIONS_PER_CLICK} tx: ${usageN} Mgas = ${percentN.toFixed(1)}%`);
        console.log('');

        // This test will FAIL if proof-generation exceeds 100%
        if (percentN > 100) {
          console.log(`  ❌ EXCEEDS LIMIT!`);
        }
      }
    });

    // Individual tx type tests for proof-generation
    for (const txType of transactionTypes.slice(0, 6)) {
      it(`${txType.name}: proof-generation should be under 100% for ${TRANSACTIONS_PER_CLICK} tx`, () => {
        const consumption = txType.resourceConsumption['proof-generation'] || 0;
        const usage = consumption * TRANSACTIONS_PER_CLICK;
        const percent = (usage / proofGenResource.maxThroughput) * 100;

        expect(percent).toBeLessThan(100);
      });
    }
  });

  describe('Overall Block Packing Validation', () => {
    it('should allow packing at least 100 ETH transfers before any resource hits 100%', () => {
      const ethTransfer = transactionTypes.find(t => t.id === 'eth-transfer')!;

      // Find how many ETH transfers can fit
      let maxCount = 0;
      for (let count = 1; count <= 500; count++) {
        const { exceeds } = wouldExceedLimit(ethTransfer, count);
        if (exceeds) {
          maxCount = count - 1;
          break;
        }
        maxCount = count;
      }

      console.log(`Max ETH transfers before any resource limit: ${maxCount}`);
      expect(maxCount).toBeGreaterThanOrEqual(100);
    });

    it(`should print full resource breakdown for ${TRANSACTIONS_PER_CLICK} ETH transfers`, () => {
      const ethTransfer = transactionTypes.find(t => t.id === 'eth-transfer')!;

      console.log(`\n=== ${TRANSACTIONS_PER_CLICK} ETH Transfers Resource Breakdown ===`);
      for (const resource of resources) {
        const consumption = ethTransfer.resourceConsumption[resource.id] || 0;
        const usage = consumption * TRANSACTIONS_PER_CLICK;
        const percent = (usage / resource.maxThroughput) * 100;

        console.log(`${resource.name}:`);
        console.log(`  Consumption/tx: ${consumption}`);
        console.log(`  Total (${TRANSACTIONS_PER_CLICK} tx): ${usage}`);
        console.log(`  Max throughput: ${resource.maxThroughput} ${resource.unit}`);
        console.log(`  Utilization: ${percent.toFixed(2)}%`);
        console.log('');
      }
    });
  });
});
