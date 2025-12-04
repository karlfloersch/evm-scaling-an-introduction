'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import { techList, type Tech } from '@/data/tech';

const CATEGORY_COLORS: Record<string, string> = {
  execution: '#FF6B6B',
  storage: '#4DABF7',
  networking: '#69DB7C',
  cryptography: '#9775FA',
  consensus: '#FFA94D',
  hardware: '#FF8787',
};

const COMPLEXITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-green-400' },
  medium: { label: 'Medium', color: 'text-yellow-400' },
  high: { label: 'High', color: 'text-orange-400' },
  'very-high': { label: 'Very High', color: 'text-red-400' },
};

export function TechComparisonSlide() {
  const [selectedTech, setSelectedTech] = useState<Tech | null>(null);

  // Filter out baseline-evm for the comparison (it's the reference point)
  const comparableTech = techList.filter((t) => t.id !== 'baseline-evm');

  return (
    <SlideContainer id="tech-comparison" variant="default">
      <SlideHeader
        section="Scaling Solutions"
        title="Technique Comparison"
        subtitle="Click on a technique to see details and tradeoffs"
      />

      <div className="grid md:grid-cols-2 gap-8">
        <AnimatedText delay={0.2}>
          <div className="space-y-3">
            {comparableTech.map((tech, i) => (
              <motion.button
                key={tech.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedTech(tech)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedTech?.id === tech.id
                    ? 'bg-white/10 border-white/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[tech.category] || '#888' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-white font-medium">{tech.name}</h3>
                      <span
                        className={`text-xs ${
                          COMPLEXITY_LABELS[tech.implementationComplexity]?.color || 'text-gray-400'
                        }`}
                      >
                        {COMPLEXITY_LABELS[tech.implementationComplexity]?.label || tech.implementationComplexity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{tech.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatedText>

        <AnimatedText delay={0.4}>
          {selectedTech ? (
            <div className="interactive-panel h-full">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: CATEGORY_COLORS[selectedTech.category] || '#888' }}
                />
                <h3 className="text-xl font-semibold text-white">{selectedTech.name}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</div>
                  <div className="text-sm text-gray-300 capitalize">{selectedTech.category}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</div>
                  <div className="text-sm text-gray-300">{selectedTech.description}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tradeoffs</div>
                  <ul className="space-y-1">
                    {selectedTech.tradeoffs.map((tradeoff, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-400 mt-0.5">-</span>
                        <span className="text-gray-400">{tradeoff}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Security Considerations</div>
                  <ul className="space-y-1">
                    {selectedTech.securityConsiderations.map((consideration, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-red-400 mt-0.5">!</span>
                        <span className="text-gray-400">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedTech.references && selectedTech.references.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">References</div>
                    <div className="space-y-1">
                      {selectedTech.references.map((ref, i) => (
                        <a
                          key={i}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {ref.title} &#x2192;
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="interactive-panel h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">&#x1F447;</div>
                <p>Select a technique to see details</p>
              </div>
            </div>
          )}
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">&#x1F4DA;</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Composability Matters</p>
              <p>
                Most of these techniques can be combined. A modern high-performance EVM might use
                parallel execution + JIT compilation + Verkle trees together. The key is understanding
                which bottleneck each one addresses.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
