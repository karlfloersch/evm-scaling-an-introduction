'use client';

import { useState, Fragment, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideContainer, SlideHeader } from '@/components/ui/SlideContainer';
import {
  scalingSolutions,
  solutionsByCategory,
  categoryNames,
  type ScalingSolution,
  type ScalingSolutionCategory,
} from '@/data/scaling-solutions';
import { resources, type ResourceId } from '@/data/resources';

// Parallel Execution Demo types and presets
interface DemoTransaction {
  id: string;
  name: string;
  slot: string;
  color: string;
}

interface Lane {
  id: number;
  transactions: DemoTransaction[];
}

const DEMO_PRESETS = {
  transfers: [
    { id: 't1', name: 'Transfer', slot: 'random-1', color: '#4DABF7' },
    { id: 't2', name: 'Transfer', slot: 'random-2', color: '#4DABF7' },
    { id: 't3', name: 'Transfer', slot: 'random-3', color: '#4DABF7' },
    { id: 't4', name: 'Transfer', slot: 'random-4', color: '#4DABF7' },
    { id: 't5', name: 'Transfer', slot: 'random-5', color: '#4DABF7' },
    { id: 't6', name: 'Transfer', slot: 'random-6', color: '#4DABF7' },
  ],
  swaps: [
    { id: 's1', name: 'Swap', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's2', name: 'Swap', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's3', name: 'Swap', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's4', name: 'Swap', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's5', name: 'Swap', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 's6', name: 'Swap', slot: 'pool-eth-usdc', color: '#FF6B6B' },
  ],
  mixed: [
    { id: 'm1', name: 'Transfer', slot: 'random-1', color: '#4DABF7' },
    { id: 'm2', name: 'Swap', slot: 'pool-eth-usdc', color: '#FF6B6B' },
    { id: 'm3', name: 'Transfer', slot: 'random-2', color: '#4DABF7' },
    { id: 'm4', name: 'Swap', slot: 'pool-eth-dai', color: '#69DB7C' },
    { id: 'm5', name: 'Transfer', slot: 'random-3', color: '#4DABF7' },
    { id: 'm6', name: 'Swap', slot: 'pool-eth-usdc', color: '#FF6B6B' },
  ],
};

type PresetKey = keyof typeof DEMO_PRESETS;

// Ordered resources for the matrix display
const orderedResources: ResourceId[] = [
  'evm-compute',
  'state-access',
  'merklization',
  'block-verification',
  'block-distribution',
  'state-growth',
  'history-growth',
  'proof-generation',
];

export function ScalingMatrixSlide() {
  const [selectedSolution, setSelectedSolution] = useState<ScalingSolution | null>(null);
  const [hoveredResource, setHoveredResource] = useState<ResourceId | null>(null);
  const [parallelPreset, setParallelPreset] = useState<PresetKey>('mixed');

  // Calculate lanes for parallel execution demo
  const parallelLanes = useMemo(() => {
    const numLanes = 3;
    const transactions = DEMO_PRESETS[parallelPreset];
    const result: Lane[] = Array.from({ length: numLanes }, (_, i) => ({
      id: i,
      transactions: [],
    }));

    const slotToLane: Record<string, number> = {};

    for (const tx of transactions) {
      const isHotSlot = !tx.slot.startsWith('random');

      if (isHotSlot) {
        if (slotToLane[tx.slot] !== undefined) {
          result[slotToLane[tx.slot]].transactions.push(tx);
        } else {
          const minLane = result.reduce((min, lane, idx) =>
            lane.transactions.length < result[min].transactions.length ? idx : min
          , 0);
          result[minLane].transactions.push(tx);
          slotToLane[tx.slot] = minLane;
        }
      } else {
        const minLane = result.reduce((min, lane, idx) =>
          lane.transactions.length < result[min].transactions.length ? idx : min
        , 0);
        result[minLane].transactions.push(tx);
      }
    }

    return result;
  }, [parallelPreset]);

  const maxLaneLength = Math.max(...parallelLanes.map((l) => l.transactions.length));
  const sequentialTime = DEMO_PRESETS[parallelPreset].length;
  const parallelTime = maxLaneLength;
  const speedup = sequentialTime / parallelTime;

  return (
    <SlideContainer id="scaling-matrix" variant="default">
      <SlideHeader
        section="Scaling Solutions"
        title="The Scaling Matrix"
        subtitle="How each technology improves different resources"
      />

      {/* Resource impact matrix */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-2 text-gray-400 font-medium w-40">Solution</th>
              {orderedResources.map((resourceId) => {
                const resource = resources.find((r) => r.id === resourceId);
                if (!resource) return null;
                return (
                  <th
                    key={resourceId}
                    className={`py-3 px-1 text-center font-medium transition-colors cursor-help ${
                      hoveredResource === resourceId ? 'text-white' : 'text-gray-500'
                    }`}
                    onMouseEnter={() => setHoveredResource(resourceId)}
                    onMouseLeave={() => setHoveredResource(null)}
                    title={resource.description}
                  >
                    <div className="text-lg">{resource.icon}</div>
                    <div className="text-xs mt-1 whitespace-nowrap">
                      {resource.name.split(' ')[0]}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {(Object.keys(solutionsByCategory) as ScalingSolutionCategory[]).map((category) => (
              <Fragment key={category}>
                <tr className="border-t border-gray-800">
                  <td
                    colSpan={orderedResources.length + 1}
                    className="py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-900/30"
                  >
                    {categoryNames[category]}
                  </td>
                </tr>
                {solutionsByCategory[category].map((solution) => (
                  <motion.tr
                    key={solution.id}
                    className={`
                      border-b border-gray-800/50 cursor-pointer transition-colors
                      ${selectedSolution?.id === solution.id ? 'bg-white/5' : 'hover:bg-white/5'}
                    `}
                    onClick={() =>
                      setSelectedSolution(selectedSolution?.id === solution.id ? null : solution)
                    }
                    whileHover={{ x: 2 }}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span>{solution.icon}</span>
                        <span
                          className={`font-medium ${
                            selectedSolution?.id === solution.id ? 'text-white' : 'text-gray-300'
                          }`}
                        >
                          {solution.name}
                        </span>
                        {solution.isDeployed && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                            LIVE
                          </span>
                        )}
                      </div>
                    </td>
                    {orderedResources.map((resourceId) => {
                      const impact = solution.resourceImpacts[resourceId];
                      const resource = resources.find((r) => r.id === resourceId);
                      return (
                        <td
                          key={resourceId}
                          className="py-3 px-1 text-center"
                          onMouseEnter={() => setHoveredResource(resourceId)}
                          onMouseLeave={() => setHoveredResource(null)}
                        >
                          {impact ? (
                            <motion.span
                              className="inline-block font-bold"
                              style={{
                                color: resource?.color || '#888',
                                opacity: hoveredResource === resourceId ? 1 : 0.8,
                              }}
                              whileHover={{ scale: 1.2 }}
                            >
                              {impact}
                            </motion.span>
                          ) : (
                            <span className="text-gray-700">-</span>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
        <span className="text-gray-400">Impact levels:</span>
        <span>
          <span className="text-primary-400 font-bold">+</span> Minor (~50% boost)
        </span>
        <span>
          <span className="text-primary-400 font-bold">++</span> Significant (~3x boost)
        </span>
        <span>
          <span className="text-primary-400 font-bold">+++</span> Major (10x+ boost)
        </span>
      </div>

      {/* Hint when no selection */}
      {!selectedSolution && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Click on any solution to see details
        </div>
      )}

      {/* Solution details modal overlay */}
      <AnimatePresence>
        {selectedSolution && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setSelectedSolution(null)}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[20%] z-50 max-w-2xl mx-auto"
            >
              <div className="bg-gray-900 border border-white/10 rounded-xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedSolution.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedSolution.name}</h3>
                      <p className="text-sm text-gray-400">{selectedSolution.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSolution(null)}
                    className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Details</div>
                    <p className="text-sm text-gray-300">{selectedSolution.details}</p>

                    {selectedSolution.examples && selectedSolution.examples.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Examples</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSolution.examples.map((example) => (
                            <span
                              key={example}
                              className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resource Impacts */}
                    <div className="mt-4">
                      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Resource Impacts</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedSolution.resourceImpacts).map(([resourceId, impact]) => {
                          const resource = resources.find((r) => r.id === resourceId);
                          if (!resource || !impact) return null;
                          return (
                            <span
                              key={resourceId}
                              className="text-xs px-2 py-1 rounded flex items-center gap-1"
                              style={{ backgroundColor: resource.color + '20', color: resource.color }}
                            >
                              {resource.icon} {resource.name.split(' ')[0]}: <span className="font-bold">{impact}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    {selectedSolution.tradeoffs && selectedSolution.tradeoffs.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Tradeoffs</div>
                        <ul className="text-sm text-gray-400 space-y-2">
                          {selectedSolution.tradeoffs.map((tradeoff) => (
                            <li key={tradeoff} className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-0.5">⚠</span>
                              <span>{tradeoff}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm mt-4 pt-4 border-t border-white/10">
                      <div>
                        <span className="text-gray-500">Status: </span>
                        {selectedSolution.isDeployed ? (
                          <span className="text-green-400 font-medium">Deployed</span>
                        ) : (
                          <span className="text-yellow-400 font-medium">In development</span>
                        )}
                      </div>
                      {!selectedSolution.isDeployed && selectedSolution.timeline && (
                        <div>
                          <span className="text-gray-500">Timeline: </span>
                          <span className="text-gray-300">{selectedSolution.timeline}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special interactive demo for Parallel Execution */}
                {selectedSolution.id === 'parallel-execution' && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Interactive Demo</div>

                    {/* Preset selector */}
                    <div className="flex gap-2 mb-4">
                      {(['transfers', 'swaps', 'mixed'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setParallelPreset(p)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                            parallelPreset === p
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

                    {/* Lane visualization */}
                    <div className="space-y-2 mb-4">
                      {parallelLanes.map((lane) => (
                        <div key={lane.id} className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 w-14">Lane {lane.id + 1}</div>
                          <div className="flex-1 flex gap-1 h-7">
                            {lane.transactions.map((tx, i) => (
                              <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex-1 rounded flex items-center justify-center text-xs text-white font-medium"
                                style={{ backgroundColor: tx.color + '80' }}
                                title={tx.slot}
                              >
                                {tx.name}
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

                    {/* Speedup indicator */}
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="text-sm text-gray-400">
                        {parallelPreset === 'transfers' && 'Random slots = perfect parallelism'}
                        {parallelPreset === 'swaps' && 'Same pool = no parallelism benefit'}
                        {parallelPreset === 'mixed' && 'Real workloads are somewhere in between'}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Speedup</div>
                        <div className={`text-lg font-bold ${
                          speedup >= 2 ? 'text-green-400' : speedup >= 1.5 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {speedup.toFixed(1)}x
                        </div>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                      <span className="text-yellow-500">⚠</span>
                      <p className="text-xs text-gray-400">
                        <span className="text-yellow-400 font-medium">The Benchmark Trap:</span> Benchmarks with 100% transfers show amazing speedups.
                        Real workloads with popular contracts (DEXes, NFT mints) conflict on the same state.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
}
