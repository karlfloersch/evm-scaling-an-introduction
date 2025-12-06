'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import { transactionTypes } from '@/data/transactions';

interface TxSelection {
  id: string;
  name: string;
  gas: number;
  enabled: boolean;
  weight: number;
  parallelism: number; // 0-1, how much this tx type benefits from more threads
}

const BASELINE_GAS_PER_SEC = 2.5; // Mgas/sec baseline

export function PumpYourNumbersSlide() {
  // Parallelism factors - how much each tx type benefits from more threads
  // ETH transfers touch random slots = fully parallel
  // Swaps all hit same pool = sequential (no benefit from threads)
  // NFT mints all hit same supply counter = sequential
  const parallelismByType: Record<string, number> = {
    'eth-transfer': 1.0,      // Random slots, fully parallelizable
    'erc20-transfer': 0.9,    // Mostly random, some hot contracts
    'uniswap-swap-eth-usdc': 0.0,  // All hit same pool slot - sequential!
    'uniswap-swap-eth-dai': 0.0,   // All hit same pool slot - sequential!
    'nft-mint': 0.05,         // All hit same supply counter - basically sequential
    'nft-transfer': 0.7,      // Random token IDs, decent parallelism
  };

  // Transaction selection state
  const [txSelections, setTxSelections] = useState<TxSelection[]>(() =>
    transactionTypes.map(tx => ({
      id: tx.id,
      name: tx.name,
      gas: tx.averageGas,
      enabled: tx.id === 'eth-transfer', // Start with just ETH transfers
      weight: 1,
      parallelism: parallelismByType[tx.id] ?? 0.5,
    }))
  );

  // Thread count
  const [threads, setThreads] = useState(1);

  // Show result
  const [showResult, setShowResult] = useState(false);

  // Editable "reported" TPS - for the marketing department
  const [reportedTps, setReportedTps] = useState<number | null>(null);
  const [isEditingTps, setIsEditingTps] = useState(false);

  // Calculate weighted average gas and parallelism
  const { avgGas, avgParallelism } = useMemo(() => {
    const enabled = txSelections.filter(t => t.enabled);
    if (enabled.length === 0) return { avgGas: 21000, avgParallelism: 1 };

    const totalWeight = enabled.reduce((sum, t) => sum + t.weight, 0);
    const weightedGas = enabled.reduce((sum, t) => sum + (t.gas * t.weight), 0);
    const weightedParallelism = enabled.reduce((sum, t) => sum + (t.parallelism * t.weight), 0);

    return {
      avgGas: weightedGas / totalWeight,
      avgParallelism: weightedParallelism / totalWeight,
    };
  }, [txSelections]);

  // Calculate effective threads (only parallelizable work benefits from more threads)
  // effectiveThreads = 1 + (threads - 1) * parallelism
  const effectiveThreads = useMemo(() => {
    return 1 + (threads - 1) * avgParallelism;
  }, [threads, avgParallelism]);

  // Calculate TPS using effective threads
  const tps = useMemo(() => {
    const gasPerSec = BASELINE_GAS_PER_SEC * effectiveThreads * 1_000_000;
    return gasPerSec / avgGas;
  }, [avgGas, effectiveThreads]);

  // Determine pump level and result
  const pumpAnalysis = useMemo(() => {
    const enabledTxs = txSelections.filter(t => t.enabled);
    const onlyTransfers = enabledTxs.length === 1 && enabledTxs[0].id === 'eth-transfer';
    const hasDefi = enabledTxs.some(t => t.id.includes('swap'));
    const hasNft = enabledTxs.some(t => t.id.includes('nft'));

    // Calculate pump score (0-100)
    // Low gas = more pump, high threads = more pump, no complex txs = more pump
    const gasScore = Math.max(0, 100 - ((avgGas - 21000) / 1500)); // 21k gas = 100, 171k gas = 0
    // Exponential thread scoring: 1=0, 10=25, 100=50, 1000=75, 10000=100
    const threadScore = Math.min(100, (Math.log10(threads) / 4) * 100);
    const mixScore = onlyTransfers ? 100 : hasDefi ? 20 : hasNft ? 40 : 60;

    const pumpScore = Math.min(100, gasScore * 0.4 + threadScore * 0.3 + mixScore * 0.3);

    return {
      pumpScore,
      onlyTransfers,
      hasDefi,
      hasNft,
      isMaxPump: onlyTransfers && threads >= 1000,
      isRealistic: hasDefi && threads <= 16,
      isAbsurd: threads >= 1000,
    };
  }, [txSelections, avgGas, threads]);

  const getResultMessage = () => {
    const { onlyTransfers, isRealistic } = pumpAnalysis;
    const tpsNum = reportedTps ?? tps;

    // Based primarily on raw TPS numbers
    if (tpsNum >= 1_000_000) {
      return {
        title: "You've Broken the Matrix",
        emoji: "🚀",
        message: `${tps.toLocaleString(undefined, { maximumFractionDigits: 0 })} TPS! That's a lot of transactions. Mass marketable for sure.`,
        subtext: onlyTransfers
          ? "VCs hate this one weird trick. (The trick is lying.)"
          : "And you even included some real transactions! Respect.",
        color: "text-yellow-400",
        bgColor: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
      };
    }

    if (tpsNum >= 100_000) {
      return {
        title: "Marketing Gold",
        emoji: "🏆",
        message: `${tps.toLocaleString(undefined, { maximumFractionDigits: 0 })} TPS! Now that&apos;s a number you can put on a billboard.`,
        subtext: "Your Twitter engagement is about to go through the roof.",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10 border-yellow-500/30",
      };
    }

    if (tpsNum >= 10_000) {
      return {
        title: "Impressive Numbers!",
        emoji: "📈",
        message: `${tps.toLocaleString(undefined, { maximumFractionDigits: 0 })} TPS! Looking good on that slide deck.`,
        subtext: "Just enough to make competitors nervous.",
        color: "text-orange-400",
        bgColor: "bg-orange-500/10 border-orange-500/30",
      };
    }

    if (tpsNum >= 1_000) {
      return {
        title: "Decent Numbers",
        emoji: "📊",
        message: `${tps.toLocaleString(undefined, { maximumFractionDigits: 0 })} TPS. Not bad, but you're leaving pump potential on the table.`,
        subtext: "Have you tried more threads? Or fewer smart contracts?",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10 border-blue-500/30",
      };
    }

    if (isRealistic) {
      return {
        title: "Dangerously Honest",
        emoji: "🎓",
        message: `${tps.toLocaleString(undefined, { maximumFractionDigits: 0 })} TPS with realistic workloads? What are you, a scientist?`,
        subtext: "Your competitors are laughing at your honesty. But you have our respect.",
        color: "text-green-400",
        bgColor: "bg-green-500/10 border-green-500/30",
      };
    }

    return {
      title: "Room for Improvement",
      emoji: "🤔",
      message: `${tps.toLocaleString(undefined, { maximumFractionDigits: 0 })} TPS. Your marketing department wants a word.`,
      subtext: "Crank those threads! Simplify that workload! You can do it!",
      color: "text-gray-400",
      bgColor: "bg-gray-500/10 border-gray-500/30",
    };
  };

  const toggleTx = (id: string) => {
    setTxSelections(prev => prev.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ));
    setShowResult(false);
    setReportedTps(null);
  };

  const result = getResultMessage();

  // Marketing team reaction to edited TPS
  const getMarketingReaction = () => {
    if (reportedTps === null) return null;

    const ratio = reportedTps / tps;

    if (ratio >= 10) {
      return {
        emoji: "🚀🎉🏆",
        message: "MARKETING LOVES YOU!",
        subtext: `${ratio.toFixed(0)}x multiplier? You're getting a promotion! The whitepaper is already being updated.`,
        color: "text-yellow-400",
        bgColor: "bg-gradient-to-r from-yellow-500/30 to-orange-500/30",
      };
    }
    if (ratio >= 3) {
      return {
        emoji: "📈✨",
        message: "Marketing approves!",
        subtext: `A modest ${ratio.toFixed(1)}x bump. Very tasteful. The investors will love it.`,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
      };
    }
    if (ratio >= 1.5) {
      return {
        emoji: "👍",
        message: "Marketing nods approvingly",
        subtext: "A little optimism never hurt anyone, right?",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
      };
    }
    if (ratio >= 0.99) {
      return {
        emoji: "😐",
        message: "Marketing is confused",
        subtext: "You... kept it the same? Are you feeling okay?",
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
      };
    }
    if (ratio >= 0.5) {
      return {
        emoji: "😰",
        message: "Marketing is concerned",
        subtext: "Why would you make the number SMALLER? This is not how this works.",
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
      };
    }
    if (ratio >= 0.1) {
      return {
        emoji: "😱💀",
        message: "MARKETING IS FURIOUS",
        subtext: "You're fired. Security is on their way. How could you do this to the roadmap?",
        color: "text-red-400",
        bgColor: "bg-red-500/20",
      };
    }
    return {
      emoji: "🪦",
      message: "Marketing has left the building",
      subtext: "You've destroyed the company. The VCs want their money back. Are you happy now?",
      color: "text-red-500",
      bgColor: "bg-red-900/30",
    };
  };

  const marketingReaction = getMarketingReaction();

  return (
    <SlideContainer id="pump-your-numbers" variant="default">
      <SlideHeader
        section="The Game"
        title="Pump Your Numbers"
        subtitle="Get those mass-marketable TPS numbers"
      />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Configuration */}
        <div className="space-y-6">
          {/* Transaction Mix */}
          <AnimatedText delay={0.1}>
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-1">
                Step 1: Pick Your &quot;Representative&quot; Workload
              </h3>
              <p className="text-sm text-gray-500 mb-4">Pro tip: simpler = faster = bigger numbers</p>
              <div className="space-y-2">
                {txSelections.map(tx => (
                  <button
                    key={tx.id}
                    onClick={() => toggleTx(tx.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      tx.enabled
                        ? 'bg-primary-500/20 border-primary-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        tx.enabled ? 'bg-primary-500 border-primary-500' : 'border-gray-500'
                      }`}>
                        {tx.enabled && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span>{tx.name}</span>
                    </div>
                    <span className="text-sm font-mono text-gray-500">
                      {(tx.gas / 1000).toFixed(0)}k gas
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400 space-y-1">
                <div>
                  Avg gas per tx: <span className="text-white font-mono">{avgGas.toLocaleString()}</span>
                  <span className="text-gray-600 ml-2">(lower = more TPS!)</span>
                </div>
                <div>
                  Parallelism: <span className={`font-mono ${avgParallelism > 0.5 ? 'text-green-400' : avgParallelism > 0.1 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {(avgParallelism * 100).toFixed(0)}%
                  </span>
                  {avgParallelism < 0.5 && <span className="text-gray-600 ml-2">(uh oh, state contention!)</span>}
                </div>
              </div>
            </div>
          </AnimatedText>

          {/* Thread Count */}
          <AnimatedText delay={0.2}>
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-1">
                Step 2: Crank Up Those Threads
              </h3>
              <p className="text-sm text-gray-500 mb-4">More cores = more TPS. Who&apos;s counting anyway?</p>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Parallel Execution Threads</span>
                  <span className="text-2xl font-bold text-primary-400">{threads.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.log10(threads) * 25}
                  onChange={(e) => {
                    // Exponential scale: 0-100 slider maps to 1-10000 threads
                    const sliderVal = Number(e.target.value);
                    const newThreads = Math.round(Math.pow(10, sliderVal / 25));
                    setThreads(Math.max(1, Math.min(10000, newThreads)));
                    setShowResult(false);
                    setReportedTps(null);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 (realistic)</span>
                  <span>100 (optimistic)</span>
                  <span>10,000 (lol)</span>
                </div>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>
                  Raw threads: <span className="text-white font-mono">{threads.toLocaleString()}</span>
                  {threads > 100 && <span className="text-yellow-500 ml-2">(totally real hardware btw)</span>}
                </div>
                <div>
                  Effective threads: <span className={`font-mono ${effectiveThreads >= threads * 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {effectiveThreads.toFixed(1)}
                  </span>
                  {effectiveThreads < threads * 0.5 && (
                    <span className="text-gray-600 ml-2">(most threads sitting idle!)</span>
                  )}
                </div>
              </div>
            </div>
          </AnimatedText>

          {/* Calculate Button */}
          <AnimatedText delay={0.3}>
            <button
              onClick={() => setShowResult(true)}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary-500 to-purple-500 text-white hover:from-primary-400 hover:to-purple-400 transition-all shadow-lg shadow-primary-500/25"
            >
              Show Me The Numbers!
            </button>
          </AnimatedText>
        </div>

        {/* Right: Result */}
        <AnimatedText delay={0.4}>
          <div className="h-full">
            <AnimatePresence mode="wait">
              {showResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`h-full rounded-2xl border p-6 ${result.bgColor}`}
                >
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{result.emoji}</div>
                    <div className={`text-2xl font-bold mb-2 ${result.color}`}>
                      {result.title}
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-sm text-gray-500 mb-1">
                      {reportedTps !== null ? "Reported TPS (click to edit)" : "Calculated TPS (click to edit)"}
                    </div>
                    {isEditingTps ? (
                      <input
                        type="text"
                        autoFocus
                        className="text-5xl font-bold text-white bg-transparent border-b-2 border-primary-500 text-center w-full outline-none"
                        defaultValue={reportedTps ?? Math.round(tps)}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, ''));
                          if (!isNaN(val) && val > 0) {
                            setReportedTps(val);
                          }
                          setIsEditingTps(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseInt((e.target as HTMLInputElement).value.replace(/,/g, ''));
                            if (!isNaN(val) && val > 0) {
                              setReportedTps(val);
                            }
                            setIsEditingTps(false);
                          }
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setIsEditingTps(true)}
                        className="text-5xl font-bold text-white hover:text-primary-400 transition-colors cursor-pointer"
                      >
                        {(reportedTps ?? tps).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </button>
                    )}
                    <div className="text-xl text-gray-400">transactions per second</div>
                    {reportedTps !== null && (
                      <div className="text-sm text-gray-500 mt-1">
                        (actual: {tps.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                      </div>
                    )}
                  </div>

                  {/* Marketing Reaction */}
                  {marketingReaction ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl mb-4 ${marketingReaction.bgColor}`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{marketingReaction.emoji}</div>
                        <div className={`font-bold ${marketingReaction.color}`}>
                          {marketingReaction.message}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {marketingReaction.subtext}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-300 text-center">
                        {result.message}
                      </p>
                      <p className="text-sm text-gray-500 text-center italic">
                        {result.subtext}
                      </p>
                    </div>
                  )}

                  {/* Pump Meter */}
                  {(() => {
                    // Recalculate pump score with reported TPS
                    const inflationRatio = reportedTps ? (reportedTps / tps) : 1;
                    // Base pump score + bonus for manual inflation
                    const inflationBonus = Math.min(50, Math.log10(Math.max(1, inflationRatio)) * 30);
                    const adjustedPumpScore = Math.min(100, pumpAnalysis.pumpScore + inflationBonus);

                    return (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Pump-o-Meter</span>
                          <span className="text-gray-400">{adjustedPumpScore.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${adjustedPumpScore}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(to right, #22c55e, #eab308, #ef4444)`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Honest</span>
                          <span>Maximum Pump</span>
                        </div>
                        {inflationRatio > 1 && (
                          <div className="text-xs text-yellow-500 mt-2 text-center">
                            +{((inflationRatio - 1) * 100).toFixed(0)}% manual inflation applied
                          </div>
                        )}
                        {inflationRatio < 1 && (
                          <div className="text-xs text-red-400 mt-2 text-center">
                            {((inflationRatio - 1) * 100).toFixed(0)}% deflation?! Unheard of.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center justify-center text-center"
                >
                  <div className="text-4xl mb-4">🎰</div>
                  <div className="text-xl text-gray-400 mb-2">
                    Ready to cook some benchmarks?
                  </div>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Pick your workload, set your threads, and let&apos;s see how impressive we can make those numbers look.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AnimatedText>
      </div>

      {/* Educational Note */}
      <AnimatedText delay={0.5}>
        <div className="mt-8 interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🤫</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Okay but seriously</p>
              <p>
                TPS without context is like measuring a car&apos;s speed... downhill... with the engine off.
                Next time someone brags about TPS, ask:
                <strong className="text-primary-400"> What transactions? What hardware? What&apos;s the catch?</strong>
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
