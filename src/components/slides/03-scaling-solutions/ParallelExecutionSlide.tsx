'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

interface Transaction {
  id: string;
  name: string;
  slot: string; // Which state slot this touches
  color: string;
}

interface Lane {
  id: number;
  transactions: Transaction[];
}

const TRANSACTION_PRESETS = {
  transfers: [
    { id: 't1', name: 'Transfer A→B', slot: 'random-1', color: '#4DABF7' },
    { id: 't2', name: 'Transfer C→D', slot: 'random-2', color: '#4DABF7' },
    { id: 't3', name: 'Transfer E→F', slot: 'random-3', color: '#4DABF7' },
    { id: 't4', name: 'Transfer G→H', slot: 'random-4', color: '#4DABF7' },
    { id: 't5', name: 'Transfer I→J', slot: 'random-5', color: '#4DABF7' },
    { id: 't6', name: 'Transfer K→L', slot: 'random-6', color: '#4DABF7' },
    { id: 't7', name: 'Transfer M→N', slot: 'random-7', color: '#4DABF7' },
    { id: 't8', name: 'Transfer O→P', slot: 'random-8', color: '#4DABF7' },
  ],
  swaps: [
    { id: 's1', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's2', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's3', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's4', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's5', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's6', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's7', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's8', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
  ],
  mixed: [
    { id: 'm1', name: 'Transfer', slot: 'random-1', color: '#4DABF7' },
    { id: 'm2', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 'm3', name: 'Transfer', slot: 'random-2', color: '#4DABF7' },
    { id: 'm4', name: 'Swap ETH/DAI', slot: 'pool-eth-dai', color: '#69DB7C' },
    { id: 'm5', name: 'Transfer', slot: 'random-3', color: '#4DABF7' },
    { id: 'm6', name: 'Swap ETH/USDC', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 'm7', name: 'Mint NFT', slot: 'nft-collection', color: '#9775FA' },
    { id: 'm8', name: 'Transfer', slot: 'random-4', color: '#4DABF7' },
  ],
};

type PresetKey = keyof typeof TRANSACTION_PRESETS;

export function ParallelExecutionSlide() {
  const [numLanes, setNumLanes] = useState(4);
  const [preset, setPreset] = useState<PresetKey>('mixed');

  const transactions = TRANSACTION_PRESETS[preset];

  // Assign transactions to lanes based on slot conflicts
  const lanes = useMemo(() => {
    const result: Lane[] = Array.from({ length: numLanes }, (_, i) => ({
      id: i,
      transactions: [],
    }));

    // Track which lane each "hot slot" is assigned to
    const slotToLane: Record<string, number> = {};

    for (const tx of transactions) {
      const isHotSlot = !tx.slot.startsWith('random');

      if (isHotSlot) {
        // Hot slots (swaps, mints) must go to the same lane as other txs touching that slot
        if (slotToLane[tx.slot] !== undefined) {
          // Already have a tx for this slot - add to same lane
          result[slotToLane[tx.slot]].transactions.push(tx);
        } else {
          // First tx for this slot - find the least loaded lane
          const minLane = result.reduce((min, lane, idx) =>
            lane.transactions.length < result[min].transactions.length ? idx : min
          , 0);
          result[minLane].transactions.push(tx);
          slotToLane[tx.slot] = minLane;
        }
      } else {
        // Random slots (transfers) spread across lanes for max parallelism
        const minLane = result.reduce((min, lane, idx) =>
          lane.transactions.length < result[min].transactions.length ? idx : min
        , 0);
        result[minLane].transactions.push(tx);
      }
    }

    return result;
  }, [transactions, numLanes]);

  // Calculate effective parallelism
  const maxLaneLength = Math.max(...lanes.map((l) => l.transactions.length));
  const sequentialTime = transactions.length;
  const parallelTime = maxLaneLength;
  const speedup = sequentialTime / parallelTime;

  return (
    <SlideContainer id="parallel-execution" variant="default">
      <SlideHeader
        section="Scaling Solutions"
        title="Parallel Execution"
        subtitle="Execute non-conflicting transactions simultaneously"
      />

      <div className="grid md:grid-cols-2 gap-8">
        <AnimatedText delay={0.2}>
          <div className="space-y-4">
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  <span className="text-white font-medium">1. Analyze state access:</span> Which
                  storage slots does each transaction read/write?
                </p>
                <p>
                  <span className="text-white font-medium">2. Detect conflicts:</span> Transactions
                  touching the same slot must execute sequentially.
                </p>
                <p>
                  <span className="text-white font-medium">3. Assign to lanes:</span> Non-conflicting
                  transactions can run in parallel lanes.
                </p>
              </div>
            </div>

            <div className="interactive-panel">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">Transaction Mix</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['transfers', 'swaps', 'mixed'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreset(p)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      preset === p
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {p === 'transfers' && '100% Transfers'}
                    {p === 'swaps' && '100% Same Pool'}
                    {p === 'mixed' && 'Realistic Mix'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {preset === 'transfers' && 'ETH transfers touch random addresses - perfect parallelism'}
                {preset === 'swaps' && 'All swaps touch the same pool - no parallelism benefit'}
                {preset === 'mixed' && 'A realistic mix of different transaction types'}
              </p>
            </div>

            <div className="interactive-panel">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Execution Lanes</span>
                <span className="text-sm text-white font-mono">{numLanes}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={numLanes}
                onChange={(e) => setNumLanes(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </AnimatedText>

        <AnimatedText delay={0.4}>
          <div className="interactive-panel h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Lane Assignment</h3>
              <div className="text-sm">
                <span className="text-gray-400">Speedup: </span>
                <span className={`font-mono font-bold ${
                  speedup >= 3 ? 'text-green-400' : speedup >= 1.5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {speedup.toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Lane visualization */}
            <div className="space-y-2">
              {lanes.map((lane) => (
                <div key={lane.id} className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 w-16">Lane {lane.id + 1}</div>
                  <div className="flex-1 flex gap-1 h-8">
                    {lane.transactions.map((tx, i) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex-1 rounded flex items-center justify-center text-xs text-white font-medium overflow-hidden"
                        style={{ backgroundColor: tx.color + '80' }}
                        title={`${tx.name} (${tx.slot})`}
                      >
                        {tx.name.split(' ')[0]}
                      </motion.div>
                    ))}
                    {lane.transactions.length === 0 && (
                      <div className="flex-1 border border-dashed border-white/10 rounded flex items-center justify-center text-xs text-gray-600">
                        idle
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Time comparison */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-xs text-gray-500 mb-2">Execution Time Comparison</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-20">Sequential</span>
                  <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                    <motion.div
                      className="h-full bg-gray-500"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12">{sequentialTime} units</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-20">Parallel</span>
                  <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(parallelTime / sequentialTime) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12">{parallelTime} units</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4DABF7' }} />
                <span className="text-gray-400">Transfer (random slots)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF6B6B' }} />
                <span className="text-gray-400">Swap (hot slot)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#69DB7C' }} />
                <span className="text-gray-400">Different pool</span>
              </div>
            </div>
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="interactive-panel bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">&#x26A0;&#xFE0F;</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">The Benchmark Trap</p>
              <p>
                Benchmarks using 100% transfers show amazing speedups. Real-world workloads with
                popular contracts (Uniswap, NFT mints) show much less improvement because
                they all conflict on the same state.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
