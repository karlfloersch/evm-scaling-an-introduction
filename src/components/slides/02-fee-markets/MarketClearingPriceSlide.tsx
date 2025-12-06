'use client';

import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

export function MarketClearingPriceSlide() {
  return (
    <SlideContainer id="market-clearing-price" variant="default">
      <SlideHeader
        section="Fee Markets"
        title="The Market Clearing Price"
        subtitle="The ideal state: 100% utilization with zero backpressure"
      />

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        {/* Left side: The concept */}
        <div className="space-y-6">
          <AnimatedText delay={0.1}>
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">What is Market Clearing?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The <span className="text-primary-400 font-medium">market clearing price</span> is the fee level where:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>All block resources are fully utilized (100%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>No transactions are waiting (zero backpressure)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Supply exactly matches demand</span>
                </li>
              </ul>
            </div>
          </AnimatedText>

          <AnimatedText delay={0.2}>
            <div className="interactive-panel bg-red-500/5 border-red-500/20">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Price Too Low</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <div className="text-xs text-gray-500">Utilization: 100%</div>
                </div>
                <div className="text-center px-4 py-2 bg-orange-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">+50</div>
                  <div className="text-xs text-gray-500">Backpressure</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Block is full but transactions are waiting. Fee should rise to reduce demand.
              </p>
            </div>
          </AnimatedText>

          <AnimatedText delay={0.3}>
            <div className="interactive-panel bg-yellow-500/5 border-yellow-500/20">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Price Too High</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <div className="text-xs text-gray-500">Utilization: 40%</div>
                </div>
                <div className="text-center px-4 py-2 bg-gray-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-gray-400">0</div>
                  <div className="text-xs text-gray-500">Backpressure</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                No backpressure but block space is wasted. Fee should fall to attract more demand.
              </p>
            </div>
          </AnimatedText>
        </div>

        {/* Right side: The ideal state */}
        <div className="space-y-6">
          <AnimatedText delay={0.4}>
            <div className="interactive-panel bg-green-500/10 border-green-500/30">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Market Clearing Price</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-green-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">Utilization: 100%</div>
                </div>
                <div className="text-center px-4 py-2 bg-green-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <div className="text-xs text-gray-400">Backpressure</div>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-4">
                Perfect equilibrium: every transaction that wants to pay the fee gets included,
                and no block space goes unused.
              </p>
            </div>
          </AnimatedText>

          <AnimatedText delay={0.5}>
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">Why This Matters</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="font-medium text-white">Maximum Revenue</div>
                    <div className="text-gray-400">
                      Validators/sequencers collect the most fees when blocks are full
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="font-medium text-white">Best UX</div>
                    <div className="text-gray-400">
                      Users who pay the fee get included immediately - no waiting
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-medium text-white">Efficient Allocation</div>
                    <div className="text-gray-400">
                      Resources go to transactions that value them most
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedText>

          <AnimatedText delay={0.6}>
            <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="text-sm">
                  <div className="font-medium text-white mb-1">EIP-1559&apos;s Goal</div>
                  <p className="text-gray-400">
                    Automatically adjust the base fee to find this market clearing price.
                    When blocks are full, fee rises. When empty, fee falls.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedText>
        </div>
      </div>
    </SlideContainer>
  );
}
