'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import { resourcesByCategory, categoryNames, type ResourceCategory, type Resource } from '@/data/resources';

// Flatten resources for the reveal animation
const allResources: Resource[] = Object.values(resourcesByCategory).flat();

export function ResourcesIntroSlide() {
  const [step, setStep] = useState<'teragas' | 'reveal' | 'resources'>('teragas');
  const [gasMultiplier, setGasMultiplier] = useState(1);
  const [isMultiplying, setIsMultiplying] = useState(false);

  const handleMultiply = () => {
    setIsMultiplying(true);
    // Animate the multiplier up
    let current = 1;
    const interval = setInterval(() => {
      current *= 10;
      setGasMultiplier(current);
      if (current >= 100000) {
        clearInterval(interval);
        setTimeout(() => {
          setStep('reveal');
        }, 800);
      }
    }, 200);
  };

  const currentGasLimit = 30_000_000;
  const displayGasLimit = currentGasLimit * gasMultiplier;

  const formatGas = (gas: number) => {
    if (gas >= 1_000_000_000_000) return `${(gas / 1_000_000_000_000).toFixed(0)} Tgas`;
    if (gas >= 1_000_000_000) return `${(gas / 1_000_000_000).toFixed(0)} Ggas`;
    if (gas >= 1_000_000) return `${(gas / 1_000_000).toFixed(0)} Mgas`;
    return `${gas.toLocaleString()} gas`;
  };

  return (
    <SlideContainer id="resources-intro" variant="default">
      <AnimatePresence mode="wait">
        {step === 'teragas' && (
          <motion.div
            key="teragas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <SlideHeader
              section="The Model"
              title="The Path to Teragas"
              subtitle="What if we could just... increase the gas limit?"
            />

            <div className="max-w-2xl mx-auto mt-12 space-y-8">
              <div className="interactive-panel">
                <div className="text-sm text-gray-400 mb-2">Current Ethereum Gas Limit</div>
                <motion.div
                  className="text-5xl font-bold text-white"
                  key={gasMultiplier}
                  initial={{ scale: 1.2, color: '#22c55e' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                >
                  {formatGas(displayGasLimit)}
                </motion.div>
                {gasMultiplier > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400 text-sm mt-2"
                  >
                    {gasMultiplier.toLocaleString()}x multiplier applied!
                  </motion.div>
                )}
              </div>

              <div className="text-gray-400 text-lg">
                The scaling roadmap is simple:
              </div>

              <motion.button
                onClick={handleMultiply}
                disabled={isMultiplying}
                className={`
                  px-8 py-4 rounded-xl text-xl font-bold
                  transition-all
                  ${isMultiplying
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 shadow-lg shadow-green-500/25'
                  }
                `}
                whileHover={!isMultiplying ? { scale: 1.05 } : {}}
                whileTap={!isMultiplying ? { scale: 0.95 } : {}}
              >
                {isMultiplying ? 'Multiplying...' : 'Multiply All Opcodes by 100,000x'}
              </motion.button>

              <div className="text-gray-500 text-sm">
                (Click the button. It&apos;s that easy, right?)
              </div>
            </div>
          </motion.div>
        )}

        {step === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <SlideHeader
              section="The Model"
              title="Congratulations!"
              subtitle="You've achieved Teragas. But wait..."
            />

            <div className="max-w-3xl mx-auto mt-8 space-y-8">
              <div className="interactive-panel border-red-500/30 bg-red-500/5">
                <div className="text-6xl mb-4">🤔</div>
                <div className="text-2xl text-white font-bold mb-4">
                  Nothing changed.
                </div>
                <div className="text-gray-400">
                  The chain still processes the same number of transactions per second.
                  The execution engine isn&apos;t any faster.
                </div>
              </div>

              <div className="text-xl text-gray-300">
                That&apos;s because <span className="text-white font-bold">gas isn&apos;t real</span>.
              </div>

              <div className="interactive-panel">
                <div className="text-left text-gray-300 space-y-4">
                  <p>
                    Gas is an <span className="text-primary-400 font-semibold">approximate metric</span> that
                    correlates with the resources users care about (like TPS). But it&apos;s not what
                    actually limits throughput.
                  </p>
                  <p>
                    Throughput is bottlenecked by <span className="text-white font-semibold">fundamental resources</span> —
                    things that can&apos;t be increased by changing a number in the protocol.
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => setStep('resources')}
                className="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Show me the real bottlenecks →
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'resources' && (
          <motion.div
            key="resources"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SlideHeader
              section="The Model"
              title="The Real Bottlenecks"
              subtitle="These fundamental resources actually limit blockchain throughput"
            />

            <div className="space-y-6 mt-8">
              {(Object.keys(resourcesByCategory) as ResourceCategory[]).map((category, catIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.15 }}
                >
                  <div className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                    {categoryNames[category]}
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {resourcesByCategory[category].map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIndex * 0.15 + index * 0.05 }}
                        className="interactive-panel hover:border-white/20 transition-all cursor-default"
                        style={{ borderColor: resource.color + '30' }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{resource.icon}</span>
                          <div>
                            <div className="font-semibold text-white" style={{ color: resource.color }}>
                              {resource.name}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {resource.description}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatedText delay={0.6} className="mt-8">
              <div className="interactive-panel bg-primary-500/5 border-primary-500/20 max-w-3xl mx-auto">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">💡</span>
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-white mb-2">The Key Insight</p>
                    <p>
                      Different transactions stress different resources. An ETH transfer is
                      CPU-light but touches storage. A ZK proof verification is CPU-heavy but
                      barely touches storage. A rollup batch posts lots of data but minimal computation.
                    </p>
                    <p className="mt-2">
                      The <span className="text-white font-semibold">bottleneck resource</span> —
                      whichever hits capacity first — determines maximum throughput for that workload.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedText>

            <div className="text-center mt-6">
              <button
                onClick={() => { setStep('teragas'); setGasMultiplier(1); setIsMultiplying(false); }}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                ← Replay the Teragas reveal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
}
