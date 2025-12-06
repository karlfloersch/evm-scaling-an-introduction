'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import {
  createInitialState,
  simulateStep,
  calculateSimulationStats,
  type SimulationConfig,
  type SimulationState,
  type TransactionMixEntry,
  type SimulationStats,
} from '@/lib/simulation/core';
import { scenarios, defaultScenario } from '@/lib/simulation/scenarios';
import { defaultTransactionTypes } from '@/data/transactions';

interface SimulationRun {
  state: SimulationState | null;
  history: SimulationState[];
  fullHistory: SimulationState[];
  config: SimulationConfig;
  label: string;
  color: string;
}

export function SimulationSlide() {
  // Mode
  const [compareMode, setCompareMode] = useState(true);

  // Config state
  const [scenarioId, setScenarioId] = useState('nft-drop');
  const [gasPerSecond, setGasPerSecond] = useState(2.5);

  // For single mode
  const [techMultiplier, setTechMultiplier] = useState(1);

  // For compare mode
  const [leftMultiplier, setLeftMultiplier] = useState(1);
  const [rightMultiplier, setRightMultiplier] = useState(4);

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Left simulation (or single mode)
  const [leftState, setLeftState] = useState<SimulationState | null>(null);
  const [leftHistory, setLeftHistory] = useState<SimulationState[]>([]);
  const [leftFullHistory, setLeftFullHistory] = useState<SimulationState[]>([]);

  // Right simulation (compare mode only)
  const [rightState, setRightState] = useState<SimulationState | null>(null);
  const [rightHistory, setRightHistory] = useState<SimulationState[]>([]);
  const [rightFullHistory, setRightFullHistory] = useState<SimulationState[]>([]);

  // Build config
  const scenario = useMemo(
    () => scenarios.find(s => s.id === scenarioId) || defaultScenario,
    [scenarioId]
  );

  const transactionMix: TransactionMixEntry[] = useMemo(() =>
    defaultTransactionTypes.map(tx => ({
      txType: tx,
      weight: tx.percentOfMainnetTxs,
    })),
    []
  );

  const leftConfig: SimulationConfig = useMemo(() => ({
    gasPerSecond,
    techMultiplier: compareMode ? leftMultiplier : techMultiplier,
    transactionMix,
    scenario,
    simulationSpeed: 1,
  }), [gasPerSecond, compareMode, leftMultiplier, techMultiplier, transactionMix, scenario]);

  const rightConfig: SimulationConfig = useMemo(() => ({
    gasPerSecond,
    techMultiplier: rightMultiplier,
    transactionMix,
    scenario,
    simulationSpeed: 1,
  }), [gasPerSecond, rightMultiplier, transactionMix, scenario]);

  // Initialize/reset
  const reset = useCallback(() => {
    const leftInitial = createInitialState(leftConfig);
    setLeftState(leftInitial);
    setLeftHistory([leftInitial]);
    setLeftFullHistory([leftInitial]);

    if (compareMode) {
      const rightInitial = createInitialState(rightConfig);
      setRightState(rightInitial);
      setRightHistory([rightInitial]);
      setRightFullHistory([rightInitial]);
    }

    setIsRunning(false);
    setShowResults(false);
  }, [leftConfig, rightConfig, compareMode]);

  // Initialize on mount and config change
  useEffect(() => {
    reset();
  }, [reset]);

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const leftComplete = leftState?.isComplete ?? true;
    const rightComplete = !compareMode || (rightState?.isComplete ?? true);

    if (leftComplete && rightComplete) {
      setIsRunning(false);
      setShowResults(true);
      return;
    }

    const interval = setInterval(() => {
      // Update left simulation
      if (leftState && !leftState.isComplete) {
        setLeftState(prev => {
          if (!prev || prev.isComplete) return prev;
          const next = simulateStep(prev, leftConfig, 1);
          setLeftHistory(h => [...h.slice(-50), next]);
          setLeftFullHistory(h => [...h, next]);
          return next;
        });
      }

      // Update right simulation (compare mode)
      if (compareMode && rightState && !rightState.isComplete) {
        setRightState(prev => {
          if (!prev || prev.isComplete) return prev;
          const next = simulateStep(prev, rightConfig, 1);
          setRightHistory(h => [...h.slice(-50), next]);
          setRightFullHistory(h => [...h, next]);
          return next;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, leftState, rightState, leftConfig, rightConfig, compareMode]);

  // Calculate stats
  const leftStats = useMemo(() =>
    calculateSimulationStats({ states: leftFullHistory, config: leftConfig }),
    [leftFullHistory, leftConfig]
  );

  const rightStats = useMemo(() =>
    calculateSimulationStats({ states: rightFullHistory, config: rightConfig }),
    [rightFullHistory, rightConfig]
  );

  // Progress
  const progress = leftState ? (leftState.timestamp / scenario.duration) * 100 : 0;

  // Shared max TPS for consistent Y-axis scaling in compare mode
  const sharedMaxTPS = compareMode
    ? Math.max(leftStats.peakTPS, rightStats.peakTPS, 1)
    : undefined;

  // Check if both complete
  const isComplete = compareMode
    ? (leftState?.isComplete && rightState?.isComplete)
    : leftState?.isComplete;

  return (
    <SlideContainer id="simulation-dashboard" variant="default">
      <SlideHeader
        section="Interactive Simulation"
        title="TPS Simulator"
        subtitle="Compare how different scaling approaches handle the same demand"
      />

      {/* Mode Toggle & Scenario Selection */}
      <AnimatedText delay={0.1}>
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          {/* Compare Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Mode:</span>
            <button
              onClick={() => setCompareMode(false)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                !compareMode
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setCompareMode(true)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                compareMode
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Compare
            </button>
          </div>

          {/* Scenario Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Scenario:</span>
            {scenarios.slice(0, 4).map(s => (
              <button
                key={s.id}
                onClick={() => setScenarioId(s.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  scenarioId === s.id
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={isComplete}
              className={`px-4 py-1.5 rounded font-medium transition-all ${
                isRunning
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              } ${isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRunning ? 'Pause' : isComplete ? 'Complete' : 'Start'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-1.5 rounded font-medium bg-white/10 text-gray-400 border border-white/10 hover:bg-white/15"
            >
              Reset
            </button>
          </div>
        </div>
      </AnimatedText>

      {/* Progress bar */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Simulation Panels */}
      {compareMode ? (
        <div className="grid md:grid-cols-2 gap-6">
          <SimulationPanel
            label="Simulation A"
            state={leftState}
            history={leftHistory}
            stats={leftStats}
            multiplier={leftMultiplier}
            setMultiplier={setLeftMultiplier}
            gasPerSecond={gasPerSecond}
            color="text-blue-400"
            barColorHex="#3B82F6"
            showMultiplierSlider
            sharedMaxTPS={sharedMaxTPS}
          />
          <SimulationPanel
            label="Simulation B"
            state={rightState}
            history={rightHistory}
            stats={rightStats}
            multiplier={rightMultiplier}
            setMultiplier={setRightMultiplier}
            gasPerSecond={gasPerSecond}
            color="text-green-400"
            barColorHex="#22C55E"
            showMultiplierSlider
            sharedMaxTPS={sharedMaxTPS}
          />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <SimulationPanel
            label={`${techMultiplier}x Scaling`}
            state={leftState}
            history={leftHistory}
            stats={leftStats}
            multiplier={techMultiplier}
            setMultiplier={setTechMultiplier}
            gasPerSecond={gasPerSecond}
            color="text-primary-400"
            barColorHex="#8B5CF6"
            showMultiplierSlider
          />
        </div>
      )}

      {/* Tip */}
      <AnimatedText delay={0.6} className="mt-6">
        <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">&#x1F4A1;</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">
                {compareMode ? 'Compare Mode' : 'Try Compare Mode'}
              </p>
              <p>
                {compareMode
                  ? 'Watch both simulations run simultaneously. Notice how the scaled version handles demand spikes better with lower fees and higher throughput.'
                  : 'Switch to Compare mode to run two simulations side-by-side with different scaling factors.'}
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>

      {/* Results Modal */}
      {showResults && (
        <ComparisonResultsModal
          scenario={scenario}
          compareMode={compareMode}
          leftStats={leftStats}
          rightStats={rightStats}
          leftHistory={leftFullHistory}
          rightHistory={rightFullHistory}
          leftMultiplier={compareMode ? leftMultiplier : techMultiplier}
          rightMultiplier={rightMultiplier}
          gasPerSecond={gasPerSecond}
          onClose={() => setShowResults(false)}
          onRunAgain={() => {
            setShowResults(false);
            reset();
          }}
        />
      )}
    </SlideContainer>
  );
}

function SimulationPanel({
  label,
  state,
  history,
  stats,
  multiplier,
  setMultiplier,
  gasPerSecond,
  color,
  barColorHex,
  showMultiplierSlider = false,
  sharedMaxTPS,
}: {
  label: string;
  state: SimulationState | null;
  history: SimulationState[];
  stats: SimulationStats;
  multiplier: number;
  setMultiplier: (n: number) => void;
  gasPerSecond: number;
  color: string;
  barColorHex: string;
  showMultiplierSlider?: boolean;
  sharedMaxTPS?: number;
}) {
  // Use shared max for consistent Y-axis, or fall back to own peak
  const maxTPS = sharedMaxTPS ?? Math.max(stats.peakTPS, 1);
  return (
    <div className="interactive-panel">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-semibold ${color}`}>{label}</h3>
        <span className="text-xs text-gray-500">
          {(gasPerSecond * multiplier).toFixed(1)} Mgas/s
        </span>
      </div>

      {showMultiplierSlider && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Scaling</span>
            <span className="text-sm text-white font-mono">{multiplier}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <MiniMetric label="TPS" value={state?.tps.toFixed(0) || '0'} />
        <MiniMetric label="Util" value={`${((state?.utilization || 0) * 100).toFixed(0)}%`} />
        <MiniMetric label="Fee" value={`${state?.baseFee.toFixed(0) || '20'}g`} />
        <MiniMetric label="Pending" value={state?.pendingTxs.toFixed(0) || '0'} />
      </div>

      {/* TPS Chart */}
      <div className="h-20 flex items-end gap-0.5 mb-2">
        {history.slice(-50).map((s, i) => {
          const height = (s.tps / maxTPS) * 100;
          return (
            <div
              key={i}
              className="flex-1 rounded-t transition-all"
              style={{
                height: `${height}%`,
                backgroundColor: `${barColorHex}99` // 60% opacity
              }}
            />
          );
        })}
        {history.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
            Press Start
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Peak: {stats.peakTPS.toFixed(0)} TPS</span>
        <span>Avg: {stats.avgTPS.toFixed(1)} TPS</span>
        {sharedMaxTPS && <span className="text-gray-600">Scale: {sharedMaxTPS.toFixed(0)}</span>}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-mono text-white">{value}</div>
    </div>
  );
}

function ComparisonResultsModal({
  scenario,
  compareMode,
  leftStats,
  rightStats,
  leftHistory,
  rightHistory,
  leftMultiplier,
  rightMultiplier,
  gasPerSecond,
  onClose,
  onRunAgain,
}: {
  scenario: { name: string; description: string };
  compareMode: boolean;
  leftStats: SimulationStats;
  rightStats: SimulationStats;
  leftHistory: SimulationState[];
  rightHistory: SimulationState[];
  leftMultiplier: number;
  rightMultiplier: number;
  gasPerSecond: number;
  onClose: () => void;
  onRunAgain: () => void;
}) {
  // Downsample history for charts - limit to 60 points for visibility
  const targetPoints = 60;
  const sampleRate = Math.max(1, Math.floor(leftHistory.length / targetPoints));
  const leftSampled = leftHistory.filter((_, i) => i % sampleRate === 0);
  const rightSampled = rightHistory.filter((_, i) => i % sampleRate === 0);

  const maxTPS = Math.max(leftStats.peakTPS, rightStats.peakTPS, 1);
  const maxFee = Math.max(leftStats.peakBaseFee, rightStats.peakBaseFee, 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Simulation Complete</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="text-lg text-white font-medium">{scenario.name}</div>
          <div className="text-sm text-gray-500">{scenario.description}</div>
        </div>

        {/* TPS Time Series Charts */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">TPS Over Time (shared scale: {maxTPS.toFixed(0)} TPS)</div>
          <div className={compareMode ? "grid md:grid-cols-2 gap-4" : ""}>
            <ResultsChart
              label={`Simulation A (${leftMultiplier}x)`}
              data={leftSampled}
              getValue={(s) => s.tps}
              maxValue={maxTPS}
              color="#3B82F6"
              avgValue={leftStats.avgTPS}
              unit="TPS"
            />
            {compareMode && (
              <ResultsChart
                label={`Simulation B (${rightMultiplier}x)`}
                data={rightSampled}
                getValue={(s) => s.tps}
                maxValue={maxTPS}
                color="#22C55E"
                avgValue={rightStats.avgTPS}
                unit="TPS"
              />
            )}
          </div>
        </div>

        {/* Fee Time Series Charts */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Base Fee Over Time (shared scale: {maxFee.toFixed(0)} gwei)</div>
          <div className={compareMode ? "grid md:grid-cols-2 gap-4" : ""}>
            <ResultsChart
              label={`Simulation A (${leftMultiplier}x)`}
              data={leftSampled}
              getValue={(s) => s.baseFee}
              maxValue={maxFee}
              color="#3B82F6"
              avgValue={leftStats.avgBaseFee}
              unit="gwei"
            />
            {compareMode && (
              <ResultsChart
                label={`Simulation B (${rightMultiplier}x)`}
                data={rightSampled}
                getValue={(s) => s.baseFee}
                maxValue={maxFee}
                color="#22C55E"
                avgValue={rightStats.avgBaseFee}
                unit="gwei"
              />
            )}
          </div>
        </div>

        {/* Comparison Stats */}
        {compareMode ? (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <StatsCard
              title={`Baseline (${leftMultiplier}x)`}
              stats={leftStats}
              multiplier={leftMultiplier}
              gasPerSecond={gasPerSecond}
              color="blue"
            />
            <StatsCard
              title={`Scaled (${rightMultiplier}x)`}
              stats={rightStats}
              multiplier={rightMultiplier}
              gasPerSecond={gasPerSecond}
              color="green"
              compareStats={leftStats}
            />
          </div>
        ) : (
          <div className="mb-6">
            <StatsCard
              title={`${leftMultiplier}x Scaling`}
              stats={leftStats}
              multiplier={leftMultiplier}
              gasPerSecond={gasPerSecond}
              color="primary"
            />
          </div>
        )}

        {/* Key Insights */}
        {compareMode && (
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 mb-6">
            <div className="text-sm font-medium text-primary-400 mb-2">Key Insights</div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>
                • TPS improvement: <span className="text-green-400 font-mono">
                  +{((rightStats.avgTPS / leftStats.avgTPS - 1) * 100).toFixed(0)}%
                </span> average throughput
              </li>
              <li>
                • Fee reduction: <span className="text-green-400 font-mono">
                  -{((1 - rightStats.avgBaseFee / leftStats.avgBaseFee) * 100).toFixed(0)}%
                </span> average gas price
              </li>
              <li>
                • Peak handling: {rightStats.peakTPS.toFixed(0)} vs {leftStats.peakTPS.toFixed(0)} TPS at peak demand
              </li>
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onRunAgain}
            className="flex-1 px-4 py-3 rounded-lg font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30 transition-all"
          >
            Run Again
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-lg font-medium bg-white/10 text-gray-400 border border-white/10 hover:bg-white/15 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatsCard({
  title,
  stats,
  multiplier,
  gasPerSecond,
  color,
  compareStats,
}: {
  title: string;
  stats: SimulationStats;
  multiplier: number;
  gasPerSecond: number;
  color: 'blue' | 'green' | 'primary';
  compareStats?: SimulationStats;
}) {
  const colorClasses = {
    blue: 'border-blue-500/30 bg-blue-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    primary: 'border-primary-500/30 bg-primary-500/5',
  };

  const textColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    primary: 'text-primary-400',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className={`font-medium mb-3 ${textColors[color]}`}>{title}</div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-gray-500">Peak TPS</div>
          <div className="text-white font-mono">{stats.peakTPS.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-gray-500">Avg TPS</div>
          <div className="text-white font-mono">{stats.avgTPS.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-gray-500">Min TPS</div>
          <div className="text-white font-mono">{stats.minTPS.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-gray-500">Peak Fee</div>
          <div className="text-white font-mono">{stats.peakBaseFee.toFixed(0)}g</div>
        </div>
        <div>
          <div className="text-gray-500">Avg Fee</div>
          <div className="text-white font-mono">{stats.avgBaseFee.toFixed(1)}g</div>
        </div>
        <div>
          <div className="text-gray-500">Total Txs</div>
          <div className="text-white font-mono">{Math.round(stats.totalTxProcessed).toLocaleString()}</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500">
        Capacity: {(gasPerSecond * multiplier).toFixed(1)} Mgas/s
      </div>
    </div>
  );
}

function ResultsChart({
  label,
  data,
  getValue,
  maxValue,
  color,
  avgValue,
  unit,
}: {
  label: string;
  data: SimulationState[];
  getValue: (s: SimulationState) => number;
  maxValue: number;
  color: string;
  avgValue: number;
  unit: string;
}) {
  if (data.length === 0) {
    return (
      <div className="bg-black/30 rounded-lg p-4">
        <div className="text-xs mb-2" style={{ color }}>{label}</div>
        <div className="h-24 flex items-center justify-center text-gray-500 text-sm">
          No data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 rounded-lg p-4">
      <div className="text-xs mb-2" style={{ color }}>{label}</div>
      <div className="h-24 flex items-end" style={{ gap: '1px' }}>
        {data.map((s, i) => {
          const value = getValue(s);
          const height = Math.max((value / maxValue) * 100, 2);
          return (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${height}%`,
                backgroundColor: color,
                opacity: 0.7,
                minWidth: '2px',
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Avg: {avgValue.toFixed(1)} {unit}</span>
        <span>Peak: {Math.max(...data.map(getValue)).toFixed(0)} {unit}</span>
      </div>
    </div>
  );
}
