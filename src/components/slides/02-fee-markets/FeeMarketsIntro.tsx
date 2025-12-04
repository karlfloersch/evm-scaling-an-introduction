'use client';

import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

export function FeeMarketsIntroSlide() {
  return (
    <SlideContainer id="fee-markets-intro" variant="default">
      <SlideHeader
        section="Fee Markets"
        title="The Allocation Problem"
        subtitle="When demand exceeds capacity, how do we decide which transactions get included?"
      />

      <div className="grid md:grid-cols-2 gap-8">
        <AnimatedText delay={0.2}>
          <div className="space-y-6">
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">The Core Problem</h3>
              <p className="text-gray-300 mb-4">
                Block space is a scarce resource. When more people want to transact
                than the network can handle, we need a mechanism to:
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">1.</span>
                  <span>Allocate limited space to transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">2.</span>
                  <span>Signal to users how congested the network is</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">3.</span>
                  <span>Prevent spam and DoS attacks</span>
                </li>
              </ul>
            </div>

            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">Why Not First-Come-First-Served?</h3>
              <p className="text-gray-400">
                Without fees, attackers could flood the network with free transactions.
                Even with fees, a simple auction creates problems: users don&apos;t know
                what to bid, and fees become unpredictable.
              </p>
            </div>
          </div>
        </AnimatedText>

        <AnimatedText delay={0.4}>
          <div className="space-y-6">
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">Historical Approaches</h3>

              <div className="space-y-4">
                <div className="border-l-2 border-gray-600 pl-4">
                  <div className="text-sm text-gray-500">Pre-EIP-1559</div>
                  <div className="text-white font-medium">First-Price Auction</div>
                  <p className="text-sm text-gray-400 mt-1">
                    Users bid whatever they think will get included. Leads to
                    overpaying, fee volatility, and poor UX.
                  </p>
                </div>

                <div className="border-l-2 border-primary-500 pl-4">
                  <div className="text-sm text-gray-500">EIP-1559 (Aug 2021)</div>
                  <div className="text-white font-medium">Base Fee + Priority Fee</div>
                  <p className="text-sm text-gray-400 mt-1">
                    A protocol-determined base fee that adjusts based on demand,
                    plus an optional tip to validators.
                  </p>
                </div>

                <div className="border-l-2 border-gray-700 pl-4">
                  <div className="text-sm text-gray-500">Future</div>
                  <div className="text-white font-medium">Multidimensional Fees?</div>
                  <p className="text-sm text-gray-400 mt-1">
                    Separate fees for different resources (compute, storage, data).
                    Still being researched.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">📚</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Key Concept</p>
              <p>
                A good fee market finds the <em>market-clearing price</em> — the price
                where quantity demanded equals available supply. This is what EIP-1559
                attempts to discover dynamically.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
