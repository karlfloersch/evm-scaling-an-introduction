'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

// Fee market improvement technologies
interface FeeImprovement {
  id: string;
  name: string;
  description: string;
  details: string;
  examples: string[];
  impact: string;
}

const feeImprovements: FeeImprovement[] = [
  {
    id: 'storage-repricing',
    name: 'Storage Repricing',
    description: 'Adjust storage operation costs to better reflect actual resource consumption',
    details: 'Storage operations have historically been mispriced relative to their true cost. Repricing aligns gas costs with actual resource usage, preventing underpriced operations from creating bottlenecks.',
    examples: ['EIP-8032'],
    impact: 'Makes storage-heavy transactions pay their fair share',
  },
  {
    id: 'precompile-repricing',
    name: 'Precompile Repricing',
    description: 'Update costs for precompiled contracts based on modern hardware',
    details: 'Precompile gas costs were set years ago. Hardware improvements mean some precompiles are now overpriced while others may be underpriced relative to their actual execution cost.',
    examples: ['Various EIPs adjusting ecrecover, sha256, etc.'],
    impact: 'More accurate pricing for cryptographic operations',
  },
  {
    id: 'temporal-repricing',
    name: 'Temporal State Access Repricing',
    description: 'Price state access differently based on when it was last accessed',
    details: 'Recently accessed state is "hot" (cached), while cold state requires disk reads. Pricing should reflect this difference to incentivize efficient access patterns.',
    examples: ['EIP-2929 (cold/warm access)', 'Further temporal pricing research'],
    impact: 'Rewards efficient state access patterns',
  },
  {
    id: 'block-warming',
    name: 'Block Level Warming',
    description: 'Warm up state at the block level rather than per-transaction',
    details: 'When multiple transactions in a block access the same state, only the first should pay the "cold" cost. Others benefit from the state already being loaded into cache.',
    examples: ['Block-level access list proposals'],
    impact: 'Reduces redundant cold access charges within blocks',
  },
  {
    id: 'multidimensional-1559',
    name: 'Multi-Dimensional EIP-1559',
    description: 'Separate base fees for different resource types',
    details: 'Instead of one unified gas price, have separate dynamically-adjusting prices for compute, storage/IO, and other resources. This prevents one resource bottleneck from affecting all transaction types.',
    examples: ['EIP-4844 blob gas (first step)', 'Research on full multi-dimensional fees'],
    impact: 'Efficient pricing when resources have different scarcity',
  },
];

export function MultidimensionalFeesSlide() {
  const [selectedImprovement, setSelectedImprovement] = useState<FeeImprovement | null>(null);

  return (
    <SlideContainer id="multidimensional-fees" variant="default">
      <SlideHeader
        section="Fee Markets"
        title="Fee Market Improvements"
        subtitle="Technologies to price transactions more accurately"
      />

      <div className="mt-6 space-y-6">
        {/* Intro text */}
        <AnimatedText delay={0.1}>
          <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
            <div className="flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-gray-300">
                <p>
                  Beyond scaling resources, we need to <span className="text-white font-medium">price them correctly</span>.
                  Mispriced operations lead to inefficient block packing and unfair fee distribution.
                </p>
              </div>
            </div>
          </div>
        </AnimatedText>

        {/* Improvements list */}
        <AnimatedText delay={0.2}>
          <div className="space-y-3">
            {feeImprovements.map((improvement, index) => (
              <motion.button
                key={improvement.id}
                onClick={() => setSelectedImprovement(
                  selectedImprovement?.id === improvement.id ? null : improvement
                )}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedImprovement?.id === improvement.id
                    ? 'bg-white/10 border-white/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-white">{improvement.name}</span>
                      <p className="text-sm text-gray-400 mt-0.5">{improvement.description}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: selectedImprovement?.id === improvement.id ? 180 : 0 }}
                    className="text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatedText>

        {/* Selected improvement details */}
        <AnimatePresence>
          {selectedImprovement && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="interactive-panel border-primary-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-lg">
                    {feeImprovements.findIndex(i => i.id === selectedImprovement.id) + 1}
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedImprovement.name}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">How It Works</h4>
                    <p className="text-sm text-gray-300">{selectedImprovement.details}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Examples</h4>
                      <ul className="space-y-1">
                        {selectedImprovement.examples.map((example, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                            <span className="text-primary-400">•</span> {example}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Impact</h4>
                      <p className="text-sm text-green-400">{selectedImprovement.impact}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SlideContainer>
  );
}
