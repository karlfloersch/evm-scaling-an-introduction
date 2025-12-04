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
} from '@/lib/simulation/core';
import { scenarios, defaultScenario } from '@/lib/simulation/scenarios';
import { transactionTypes, defaultTransactionTypes } from '@/data/transactions';

export function SimulationSlide() {
  // Config state
  const [scenarioId, setScenarioId] = useState(defaultScenario.id);
  const [techMultiplier, setTechMultiplier] = useState(1);
  const [gasPerSecond, setGasPerSecond] = useState(2.5);

  // Simulation state
  const [state, setState] = useState<SimulationState | null>(null);
  const [history, setHistory] = useState<SimulationState[]>([]);
  const [fullHistory, setFullHistory] = useState<SimulationState[]>([]); // For final stats
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

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

  const config: SimulationConfig = useMemo(() => ({
    gasPerSecond,
    techMultiplier,
    transactionMix,
    scenario,
    simulationSpeed: 1,
  }), [gasPerSecond, techMultiplier, transactionMix, scenario]);

  // Initialize/reset
  const reset = useCallback(() => {
    const initialState = createInitialState(config);
    setState(initialState);
    setHistory([initialState]);
    setFullHistory([initialState]);
    setIsRunning(false);
    setShowResults(false);
  }, [config]);

  // Initialize on mount and config change
  useEffect(() => {
    reset();
  }, [reset]);

  // Simulation loop
  useEffect(() => {
    if (!isRunning || !state || state.isComplete) return;

    const interval = setInterval(() => {
      setState(prevState => {
        if (!prevState || prevState.isComplete) return prevState;

        const nextState = simulateStep(prevState, config, 1);
        setHistory(prev => [...prev.slice(-50), nextState]); // Keep last 50 for chart
        setFullHistory(prev => [...prev, nextState]); // Keep all for final stats

        // Show results when complete
        if (nextState.isComplete) {
          setIsRunning(false);
          setShowResults(true);
        }

        return nextState;
      });
    }, 50); // 20 FPS

    return () => clearInterval(interval);
  }, [isRunning, config, state]);

  // Calculate stats for live display
  const stats = useMemo(() =>
    calculateSimulationStats({ states: history, config }),
    [history, config]
  );

  // Calculate final stats from full history
  const finalStats = useMemo(() =>
    calculateSimulationStats({ states: fullHistory, config }),
    [fullHistory, config]
  );

  // Progress
  const progress = state ? (state.timestamp / scenario.duration) * 100 : 0;

  return (
    <SlideContainer id="simulation-dashboard" variant="default">
      <SlideHeader
        section="Interactive Simulation"
        title="TPS Simulator"
        subtitle="See how demand, capacity, and fees interact in real-time"
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <AnimatedText delay={0.2}>
          <div className="space-y-4">
            {/* Scenario Selection */}
            <div className="interactive-panel">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Demand Scenario</h3>
              <div className="grid grid-cols-2 gap-2">
                {scenarios.slice(0, 4).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setScenarioId(s.id)}
                    className={`px-3 py-2 rounded text-xs font-medium transition-all text-left ${
                      scenarioId === s.id
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{scenario.description}</p>
            </div>

            {/* Tech Multiplier */}
            <div className="interactive-panel">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Scaling Tech</span>
                <span className="text-sm text-white font-mono">{techMultiplier}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={techMultiplier}
                onChange={(e) => setTechMultiplier(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {techMultiplier === 1 ? 'Baseline EVM' : `${techMultiplier}-lane parallel execution`}
              </p>
            </div>

            {/* Gas Capacity */}
            <div className="interactive-panel">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Base Gas Rate</span>
                <span className="text-sm text-white font-mono">{gasPerSecond} Mgas/s</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={gasPerSecond}
                onChange={(e) => setGasPerSecond(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                disabled={state?.isComplete}
                className={`flex-1 px-4 py-2 rounded font-medium transition-all ${
                  isRunning
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                } ${state?.isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRunning ? 'Pause' : state?.isComplete ? 'Complete' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded font-medium bg-white/10 text-gray-400 border border-white/10 hover:bg-white/15"
              >
                Reset
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </AnimatedText>

        {/* Main Dashboard */}
        <AnimatedText delay={0.4} className="md:col-span-2">
          <div className="interactive-panel h-full">
            {/* Current Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="TPS"
                value={state?.tps.toFixed(0) || '0'}
                sublabel="tx/sec"
                color={state && state.tps > stats.avgTPS ? 'text-green-400' : 'text-white'}
              />
              <MetricCard
                label="Utilization"
                value={`${((state?.utilization || 0) * 100).toFixed(0)}%`}
                sublabel={state && state.utilization > 0.9 ? 'congested' : 'normal'}
                color={state && state.utilization > 0.9 ? 'text-red-400' : 'text-white'}
              />
              <MetricCard
                label="Base Fee"
                value={state?.baseFee.toFixed(1) || '20'}
                sublabel="gwei"
                color={state && state.baseFee > 50 ? 'text-yellow-400' : 'text-white'}
              />
              <MetricCard
                label="Pending"
                value={state?.pendingTxs.toFixed(0) || '0'}
                sublabel="txs"
                color={state && state.pendingTxs > 100 ? 'text-orange-400' : 'text-white'}
              />
            </div>

            {/* TPS Chart */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>TPS Over Time</span>
                <span>Peak: {stats.peakTPS.toFixed(0)} TPS</span>
              </div>
              <div className="h-24 flex items-end gap-0.5">
                {history.slice(-50).map((s, i) => {
                  const maxTPS = Math.max(stats.peakTPS, 1);
                  const height = (s.tps / maxTPS) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-primary-500/60 rounded-t transition-all"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
                {history.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    Start simulation to see TPS
                  </div>
                )}
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Gas Utilization</span>
                <span>{((state?.utilization || 0) * 100).toFixed(0)}% of {(gasPerSecond * techMultiplier).toFixed(1)} Mgas/s</span>
              </div>
              <div className="h-6 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  className={`h-full rounded-full ${
                    (state?.utilization || 0) > 0.9 ? 'bg-red-500' :
                    (state?.utilization || 0) > 0.5 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  animate={{ width: `${(state?.utilization || 0) * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
                {/* Target line at 50% */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/30" />
              </div>
            </div>

            {/* Stats Summary */}
            {history.length > 10 && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <div className="text-gray-500">Avg TPS</div>
                  <div className="text-white font-mono">{stats.avgTPS.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Avg Fee</div>
                  <div className="text-white font-mono">{stats.avgBaseFee.toFixed(1)} gwei</div>
                </div>
                <div>
                  <div className="text-gray-500">Peak Pending</div>
                  <div className="text-white font-mono">{stats.peakPendingTxs.toFixed(0)} txs</div>
                </div>
              </div>
            )}
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-6">
        <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">&#x1F4A1;</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Try This</p>
              <p>
                Run &quot;NFT Drop&quot; with 1x scaling, then again with 4x. Notice how parallel
                execution handles the spike better, but can&apos;t fully eliminate congestion
                because many transactions still conflict on hot state.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>

      {/* Results Modal */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowResults(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Simulation Complete</h3>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-1">Scenario</div>
              <div className="text-lg text-white font-medium">{scenario.name}</div>
              <div className="text-sm text-gray-500">{scenario.description}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <ResultStat label="Peak TPS" value={finalStats.peakTPS.toFixed(0)} unit="tx/sec" highlight />
              <ResultStat label="Average TPS" value={finalStats.avgTPS.toFixed(1)} unit="tx/sec" />
              <ResultStat label="Min TPS" value={finalStats.minTPS.toFixed(0)} unit="tx/sec" />
              <ResultStat label="Total Processed" value={Math.round(finalStats.totalTxProcessed).toLocaleString()} unit="txs" highlight />
              <ResultStat label="Avg Utilization" value={`${(finalStats.avgUtilization * 100).toFixed(0)}%`} />
              <ResultStat label="Peak Utilization" value={`${(finalStats.peakUtilization * 100).toFixed(0)}%`} />
              <ResultStat label="Peak Fee" value={finalStats.peakBaseFee.toFixed(1)} unit="gwei" />
              <ResultStat label="Average Fee" value={finalStats.avgBaseFee.toFixed(1)} unit="gwei" />
              <ResultStat label="Min Fee" value={finalStats.minBaseFee.toFixed(1)} unit="gwei" />
            </div>

            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-400 mb-2">Configuration</div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Base Gas: </span>
                  <span className="text-white font-mono">{gasPerSecond} Mgas/s</span>
                </div>
                <div>
                  <span className="text-gray-500">Scaling: </span>
                  <span className="text-white font-mono">{techMultiplier}x</span>
                </div>
                <div>
                  <span className="text-gray-500">Effective: </span>
                  <span className="text-white font-mono">{(gasPerSecond * techMultiplier).toFixed(1)} Mgas/s</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResults(false);
                  reset();
                }}
                className="flex-1 px-4 py-3 rounded-lg font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30 transition-all"
              >
                Run Again
              </button>
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-3 rounded-lg font-medium bg-white/10 text-gray-400 border border-white/10 hover:bg-white/15 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </SlideContainer>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
  color = 'text-white',
}: {
  label: string;
  value: string;
  sublabel: string;
  color?: string;
}) {
  return (
    <div className="bg-black/30 rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{sublabel}</div>
    </div>
  );
}

function ResultStat({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-white/5'}`}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-primary-400' : 'text-white'}`}>
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
}
