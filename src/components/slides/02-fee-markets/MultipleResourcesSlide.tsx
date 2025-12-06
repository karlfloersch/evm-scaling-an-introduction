'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

// Resource profiles for different transaction types
// Shows what % of each resource a transaction consumes
const transactionProfiles = [
  {
    id: 'eth-transfer',
    name: 'ETH Transfer',
    description: 'Simple value transfer between accounts',
    resources: { cpu: 0.95, io: 0.05 },
    color: '#627EEA',
  },
  {
    id: 'dex-swap',
    name: 'DEX Swap',
    description: 'Uniswap/DEX token exchange',
    resources: { cpu: 0.65, io: 0.35 },
    color: '#FF007A',
  },
  {
    id: 'rollup-batch',
    name: 'Rollup Batch',
    description: 'L2 data posted to L1',
    resources: { cpu: 0.15, io: 0.85 },
    color: '#28A0F0',
  },
  {
    id: 'nft-mint',
    name: 'NFT Mint',
    description: 'Creating a new NFT with metadata',
    resources: { cpu: 0.50, io: 0.50 },
    color: '#9945FF',
  },
];

// Resource definitions
const resources = [
  {
    id: 'cpu',
    name: 'CPU (Compute)',
    description: 'Processing power, computation',
    color: '#22c55e',
    examples: ['Math operations', 'Signature verification', 'Contract logic'],
  },
  {
    id: 'io',
    name: 'IO (Storage/Data)',
    description: 'State access, calldata, storage',
    color: '#f59e0b',
    examples: ['State reads/writes', 'Calldata bytes', 'Storage slots'],
  },
];

export function MultipleResourcesSlide() {
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [showFourResources, setShowFourResources] = useState(false);

  // Extended resource profiles for 4-resource view
  const fourResourceProfiles = [
    {
      id: 'eth-transfer',
      name: 'ETH Transfer',
      resources: { compute: 0.60, calldata: 0.05, stateReads: 0.15, stateWrites: 0.20 },
      color: '#627EEA',
    },
    {
      id: 'dex-swap',
      name: 'DEX Swap',
      resources: { compute: 0.35, calldata: 0.10, stateReads: 0.30, stateWrites: 0.25 },
      color: '#FF007A',
    },
    {
      id: 'rollup-batch',
      name: 'Rollup Batch',
      resources: { compute: 0.05, calldata: 0.85, stateReads: 0.05, stateWrites: 0.05 },
      color: '#28A0F0',
    },
    {
      id: 'nft-mint',
      name: 'NFT Mint',
      resources: { compute: 0.25, calldata: 0.30, stateReads: 0.10, stateWrites: 0.35 },
      color: '#9945FF',
    },
  ];

  const fourResources = [
    { id: 'compute', name: 'CPU', color: '#22c55e' },
    { id: 'calldata', name: 'Calldata', color: '#f59e0b' },
    { id: 'stateReads', name: 'State Reads', color: '#3b82f6' },
    { id: 'stateWrites', name: 'State Writes', color: '#ef4444' },
  ];

  return (
    <SlideContainer id="multiple-resources" variant="default">
      <SlideHeader
        section="Fee Markets"
        title="Beyond Gas: Multiple Resources"
        subtitle="Transactions are either CPU-bound or IO-bound"
      />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Explanation */}
        <AnimatedText delay={0.2}>
          <div className="space-y-4">
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">The Reality</h3>
              <p className="text-sm text-gray-300 mb-4">
                When we say &quot;gas,&quot; we&apos;re bundling two fundamentally different bottlenecks:
              </p>

              <div className="space-y-3">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: resource.color }}
                      />
                      <span className="font-medium text-white">{resource.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{resource.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {resource.examples.map((ex) => (
                        <span
                          key={ex}
                          className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-500"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="interactive-panel">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Resource Granularity</span>
                <button
                  onClick={() => setShowFourResources(!showFourResources)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    showFourResources
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {showFourResources ? '4 Resources' : '2 Resources'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {showFourResources
                  ? 'More granular view: CPU, Calldata, State Reads, State Writes'
                  : 'Simplified view: CPU-bound vs IO-bound'}
              </p>
            </div>
          </div>
        </AnimatedText>

        {/* Right: Transaction Profiles */}
        <AnimatedText delay={0.4}>
          <div className="interactive-panel">
            <h3 className="text-lg font-semibold text-white mb-4">
              Transaction Resource Profiles
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Different transactions consume resources in different proportions:
            </p>

            <div className="space-y-4">
              {(showFourResources ? fourResourceProfiles : transactionProfiles).map((tx) => (
                <motion.div
                  key={tx.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTx === tx.id
                      ? 'bg-white/10 border-white/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/8'
                  }`}
                  onClick={() => setSelectedTx(selectedTx === tx.id ? null : tx.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tx.color }}
                    />
                    <span className="font-medium text-white text-sm">{tx.name}</span>
                  </div>

                  {/* Resource bar */}
                  <div className="h-6 rounded-full overflow-hidden flex bg-black/30">
                    {showFourResources ? (
                      // 4 resource view
                      fourResources.map((resource) => {
                        const profile = tx as typeof fourResourceProfiles[0];
                        const value = profile.resources[resource.id as keyof typeof profile.resources];
                        return (
                          <motion.div
                            key={resource.id}
                            className="h-full flex items-center justify-center text-xs font-medium"
                            style={{ backgroundColor: resource.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${value * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          >
                            {value >= 0.15 && (
                              <span className="text-white/90 text-[10px]">
                                {Math.round(value * 100)}%
                              </span>
                            )}
                          </motion.div>
                        );
                      })
                    ) : (
                      // 2 resource view
                      <>
                        <motion.div
                          className="h-full flex items-center justify-center"
                          style={{ backgroundColor: '#22c55e' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(tx as typeof transactionProfiles[0]).resources.cpu * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <span className="text-white/90 text-xs font-medium">
                            {Math.round((tx as typeof transactionProfiles[0]).resources.cpu * 100)}%
                          </span>
                        </motion.div>
                        <motion.div
                          className="h-full flex items-center justify-center"
                          style={{ backgroundColor: '#f59e0b' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(tx as typeof transactionProfiles[0]).resources.io * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <span className="text-white/90 text-xs font-medium">
                            {Math.round((tx as typeof transactionProfiles[0]).resources.io * 100)}%
                          </span>
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* Description when selected */}
                  {selectedTx === tx.id && !showFourResources && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-gray-400 mt-2"
                    >
                      {(tx as typeof transactionProfiles[0]).description}
                    </motion.p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-3">
                {(showFourResources ? fourResources : resources).map((r) => (
                  <div key={r.id} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="text-xs text-gray-400">{r.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Why This Matters</p>
              <p>
                If we price all resources the same, a block full of rollup batches
                (IO-heavy) leaves CPU capacity unused. A block full of DEX swaps
                (CPU-heavy) leaves IO capacity unused. This inefficiency is why
                multi-dimensional fee markets are being developed.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
