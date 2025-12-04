'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import {
  createInitialState,
  processBlock,
  calculateDemandResponse,
  generateUtilization,
  calculateStats,
  type SimulationState,
  type Block,
  DEFAULT_CONFIG,
} from '@/lib/simulation/eip1559';

export function EIP1559ExplainedSlide() {
  const [state, setState] = useState<SimulationState>(() => createInitialState());
  const [isRunning, setIsRunning] = useState(false);
  const [demandLevel, setDemandLevel] = useState(0.5);

  // Get recent blocks for display (last 20)
  const displayBlocks = state.blocks.slice(-20);

  const simulateBlock = useCallback(() => {
    setState(currentState => {
      // Calculate demand response based on current base fee
      const baseDemand = calculateDemandResponse(
        demandLevel,
        currentState.currentBaseFee,
        DEFAULT_CONFIG.initialBaseFee
      );

      // Add noise to simulate real-world variability
      const utilization = generateUtilization(baseDemand, 0.1);

      // Process the block
      return processBlock(currentState, utilization);
    });
  }, [demandLevel]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(simulateBlock, 800);
    return () => clearInterval(interval);
  }, [isRunning, simulateBlock]);

  const reset = () => {
    setState(createInitialState());
    setIsRunning(false);
  };

  const stats = calculateStats(state);

  return (
    <SlideContainer id="eip1559-explained" variant="default">
      <SlideHeader
        section="Fee Markets"
        title="EIP-1559: How It Works"
        subtitle="A mechanism that adjusts prices based on network congestion"
      />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Explanation */}
        <AnimatedText delay={0.2}>
          <div className="space-y-4">
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">The Mechanism</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  <span className="text-white font-medium">Target:</span> Blocks should be 50% full on average.
                </p>
                <p>
                  <span className="text-white font-medium">If block &gt; 50% full:</span> Base fee increases (up to 12.5%)
                </p>
                <p>
                  <span className="text-white font-medium">If block &lt; 50% full:</span> Base fee decreases (up to 12.5%)
                </p>
                <p>
                  <span className="text-white font-medium">Base fee is burned:</span> Not paid to validators
                </p>
              </div>
            </div>

            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">Why This Works</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Users know roughly what to pay (just check current base fee)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Fee responds to demand automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Burning base fee prevents validator manipulation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Can still spike during sudden demand surges</span>
                </li>
              </ul>
            </div>

            <div className="interactive-panel">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">Demand Level</span>
                <span className="text-sm text-white font-mono">
                  {demandLevel < 0.4 ? 'Low' : demandLevel < 0.7 ? 'Medium' : 'High'}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={demandLevel}
                onChange={(e) => setDemandLevel(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Adjust to simulate different network conditions
              </p>
            </div>
          </div>
        </AnimatedText>

        {/* Simulation */}
        <AnimatedText delay={0.4}>
          <div className="interactive-panel h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Live Simulation</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    isRunning ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-1 rounded text-sm font-medium bg-white/10 text-gray-400"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Current stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-xs text-gray-500">Current Base Fee</div>
                <div className="text-2xl font-bold text-white">
                  {state.currentBaseFee.toFixed(1)} <span className="text-sm text-gray-400">gwei</span>
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-xs text-gray-500">Blocks Simulated</div>
                <div className="text-2xl font-bold text-white">{state.blockNumber}</div>
              </div>
            </div>

            {/* Block visualization */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Block Utilization (last 20 blocks)</span>
                <span>Target: 50%</span>
              </div>
              <div className="h-32 flex items-end gap-1 relative">
                {/* Target line at 50% */}
                <div
                  className="absolute w-full border-t border-dashed border-yellow-500/50 pointer-events-none"
                  style={{ bottom: '50%' }}
                />
                {displayBlocks.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    Click &quot;Start&quot; to begin simulation
                  </div>
                ) : (
                  displayBlocks.map((block, i) => (
                    <motion.div
                      key={block.number}
                      initial={{ height: 0 }}
                      animate={{ height: `${block.utilization * 100}%` }}
                      className="flex-1 rounded-t relative"
                      style={{
                        backgroundColor: block.utilization > 0.5
                          ? `rgba(239, 68, 68, ${0.3 + block.utilization * 0.5})`
                          : `rgba(34, 197, 94, ${0.3 + (1 - block.utilization) * 0.3})`,
                      }}
                    >
                      {i === displayBlocks.length - 1 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap">
                          {(block.utilization * 100).toFixed(0)}%
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Base fee history */}
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Base Fee History</div>
              <div className="h-16 flex items-end gap-1">
                {displayBlocks.map((block) => {
                  const maxFee = Math.max(...displayBlocks.map(b => b.baseFee), 50);
                  const height = (block.baseFee / maxFee) * 100;
                  return (
                    <motion.div
                      key={block.number}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      className="flex-1 bg-primary-500/50 rounded-t"
                    />
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            {state.blockNumber > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-black/20 rounded p-2">
                  <div className="text-gray-500">Avg Util</div>
                  <div className="text-white font-mono">{(stats.averageUtilization * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-black/20 rounded p-2">
                  <div className="text-gray-500">Min Fee</div>
                  <div className="text-white font-mono">{stats.minBaseFee.toFixed(1)}</div>
                </div>
                <div className="bg-black/20 rounded p-2">
                  <div className="text-gray-500">Max Fee</div>
                  <div className="text-white font-mono">{stats.maxBaseFee.toFixed(1)}</div>
                </div>
              </div>
            )}
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="interactive-panel bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">&#x26A0;&#xFE0F;</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Limitation</p>
              <p>
                EIP-1559 treats all gas as equal. But a block full of simple transfers
                vs. a block full of complex DeFi calls stress different resources.
                This is why multidimensional fee markets are being researched.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
