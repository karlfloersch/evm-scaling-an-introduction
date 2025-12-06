'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import {
  createInitialState,
  processBlock,
  calculateDemandResponse,
  generateUtilization,
  calculateStats,
  type SimulationState,
  DEFAULT_CONFIG,
} from '@/lib/simulation/eip1559';

// Supply/Demand chart component
function SupplyDemandChart({
  demandLevel,
  currentBaseFee,
  currentUtilization,
}: {
  demandLevel: number;
  currentBaseFee: number;
  currentUtilization: number;
}) {
  const width = 300;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale parameters
  const maxPrice = Math.max(100, currentBaseFee * 1.5);
  const targetSupply = 0.5; // 50% target

  // Generate demand curve points - shifts based on demandLevel
  const demandCurve = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    // Demand curve: P = basePrice * e^(-k*Q) shifted by demand level
    // Higher demand = curve shifts right (higher prices at same quantity)
    const basePrice = 20 + demandLevel * 120; // Base intercept price
    const steepness = 2 + demandLevel * 2; // How steep the curve is

    for (let q = 0; q <= 1; q += 0.02) {
      // Exponential decay demand curve
      const price = basePrice * Math.exp(-steepness * q);
      points.push({ x: q, y: price });
    }
    return points;
  }, [demandLevel]);

  // Find intersection with supply (at target = 0.5)
  const intersectionPrice = useMemo(() => {
    const basePrice = 20 + demandLevel * 120;
    const steepness = 2 + demandLevel * 2;
    return basePrice * Math.exp(-steepness * targetSupply);
  }, [demandLevel]);

  // Convert data coordinates to SVG coordinates
  const toSvgX = (q: number) => padding.left + q * chartWidth;
  const toSvgY = (p: number) => padding.top + chartHeight - (p / maxPrice) * chartHeight;

  // Build demand curve path
  const demandPath = demandCurve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x)} ${toSvgY(Math.min(pt.y, maxPrice))}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="w-full h-auto">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((q) => (
        <line
          key={`grid-v-${q}`}
          x1={toSvgX(q)}
          y1={padding.top}
          x2={toSvgX(q)}
          y2={padding.top + chartHeight}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="2,2"
        />
      ))}
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={`grid-h-${p}`}
          x1={padding.left}
          y1={toSvgY(p * maxPrice)}
          x2={padding.left + chartWidth}
          y2={toSvgY(p * maxPrice)}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="2,2"
        />
      ))}

      {/* Axes */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={padding.left + chartWidth}
        y2={padding.top + chartHeight}
        stroke="rgba(255,255,255,0.3)"
      />
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + chartHeight}
        stroke="rgba(255,255,255,0.3)"
      />

      {/* Supply line (horizontal at target capacity) */}
      <line
        x1={padding.left}
        y1={toSvgY(0)}
        x2={toSvgX(targetSupply)}
        y2={toSvgY(0)}
        stroke="#22c55e"
        strokeWidth={2}
      />
      <line
        x1={toSvgX(targetSupply)}
        y1={padding.top}
        x2={toSvgX(targetSupply)}
        y2={padding.top + chartHeight}
        stroke="#22c55e"
        strokeWidth={2}
        strokeDasharray="4,4"
      />

      {/* Demand curve */}
      <motion.path
        d={demandPath}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Intersection point - animates position */}
      <motion.circle
        r={6}
        fill="#ef4444"
        stroke="white"
        strokeWidth={2}
        initial={{ cx: toSvgX(targetSupply), cy: toSvgY(intersectionPrice) }}
        animate={{
          cx: toSvgX(targetSupply),
          cy: toSvgY(Math.min(intersectionPrice, maxPrice))
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      />

      {/* Dotted line from intersection to Y-axis (showing price) */}
      <motion.line
        x1={padding.left}
        x2={toSvgX(targetSupply)}
        stroke="#ef4444"
        strokeWidth={1}
        strokeDasharray="3,3"
        initial={{ y1: toSvgY(intersectionPrice), y2: toSvgY(intersectionPrice) }}
        animate={{
          y1: toSvgY(Math.min(intersectionPrice, maxPrice)),
          y2: toSvgY(Math.min(intersectionPrice, maxPrice))
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      />

      {/* Surplus/Deficit shaded area */}
      {currentUtilization !== targetSupply && (
        <motion.rect
          x={Math.min(toSvgX(currentUtilization), toSvgX(targetSupply))}
          y={padding.top}
          width={Math.abs(toSvgX(currentUtilization) - toSvgX(targetSupply))}
          height={chartHeight}
          fill={currentUtilization < targetSupply ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Surplus/Deficit label */}
      {currentUtilization !== targetSupply && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <text
            x={(toSvgX(currentUtilization) + toSvgX(targetSupply)) / 2}
            y={padding.top + chartHeight / 2 - 8}
            fill={currentUtilization < targetSupply ? '#22c55e' : '#ef4444'}
            fontSize={10}
            fontWeight="bold"
            textAnchor="middle"
          >
            {currentUtilization < targetSupply ? 'SURPLUS' : 'DEFICIT'}
          </text>
          <text
            x={(toSvgX(currentUtilization) + toSvgX(targetSupply)) / 2}
            y={padding.top + chartHeight / 2 + 5}
            fill={currentUtilization < targetSupply ? '#22c55e' : '#ef4444'}
            fontSize={8}
            textAnchor="middle"
          >
            {currentUtilization < targetSupply ? '(price will drop)' : '(price will rise)'}
          </text>
        </motion.g>
      )}

      {/* Current utilization line (vertical) */}
      <motion.line
        x1={toSvgX(currentUtilization)}
        y1={padding.top}
        x2={toSvgX(currentUtilization)}
        y2={padding.top + chartHeight}
        stroke="#60a5fa"
        strokeWidth={2}
        strokeDasharray="3,3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Current utilization marker on x-axis */}
      <motion.line
        x1={toSvgX(currentUtilization)}
        y1={padding.top + chartHeight - 8}
        x2={toSvgX(currentUtilization)}
        y2={padding.top + chartHeight}
        stroke="#60a5fa"
        strokeWidth={4}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Actual utilization label */}
      <text
        x={toSvgX(currentUtilization)}
        y={padding.top + chartHeight + 22}
        fill="#60a5fa"
        fontSize={8}
        textAnchor="middle"
      >
        Actual: {(currentUtilization * 100).toFixed(0)}%
      </text>

      {/* Labels */}
      <text x={padding.left + chartWidth / 2} y={height - 5} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="middle">
        Gas Usage
      </text>
      <text x={12} y={padding.top + chartHeight / 2} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="middle" transform={`rotate(-90, 12, ${padding.top + chartHeight / 2})`}>
        Price (gwei)
      </text>

      {/* Supply label */}
      <text x={toSvgX(targetSupply) + 5} y={padding.top + 15} fill="#22c55e" fontSize={9}>
        Supply
      </text>
      <text x={toSvgX(targetSupply) + 5} y={padding.top + 25} fill="#22c55e" fontSize={8}>
        (target)
      </text>

      {/* Demand label */}
      <text x={toSvgX(0.05)} y={toSvgY(demandCurve[2]?.y || 50) - 5} fill="#f59e0b" fontSize={9}>
        Demand
      </text>

      {/* Equilibrium price label */}
      <motion.text
        x={padding.left + 3}
        fill="#ef4444"
        fontSize={9}
        fontWeight="bold"
        initial={{ y: toSvgY(intersectionPrice) - 5 }}
        animate={{ y: toSvgY(Math.min(intersectionPrice, maxPrice)) - 5 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        {intersectionPrice.toFixed(0)}
      </motion.text>

      {/* Axis tick labels */}
      <text x={toSvgX(0)} y={padding.top + chartHeight + 12} fill="rgba(255,255,255,0.4)" fontSize={8} textAnchor="middle">0%</text>
      <text x={toSvgX(0.5)} y={padding.top + chartHeight + 12} fill="rgba(255,255,255,0.4)" fontSize={8} textAnchor="middle">50%</text>
      <text x={toSvgX(1)} y={padding.top + chartHeight + 12} fill="rgba(255,255,255,0.4)" fontSize={8} textAnchor="middle">100%</text>
    </svg>
  );
}

export function EIP1559ExplainedSlide() {
  const [state, setState] = useState<SimulationState>(() => createInitialState());
  const [isRunning, setIsRunning] = useState(false);
  const [demandLevel, setDemandLevel] = useState(0.5);

  // Get recent blocks for display (last 20)
  const displayBlocks = state.blocks.slice(-20);

  // Current utilization for the chart
  const currentUtilization = displayBlocks.length > 0
    ? displayBlocks[displayBlocks.length - 1].utilization
    : 0.5;

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

            {/* Supply/Demand Chart */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Supply &amp; Demand</span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full" /> Supply
                  <span className="inline-block w-2 h-2 bg-amber-500 rounded-full" /> Demand
                </span>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <SupplyDemandChart
                  demandLevel={demandLevel}
                  currentBaseFee={state.currentBaseFee}
                  currentUtilization={currentUtilization}
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                The red dot shows the equilibrium price where supply meets demand
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
