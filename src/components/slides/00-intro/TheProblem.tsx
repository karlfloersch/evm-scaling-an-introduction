'use client';

import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

export function TheProblemSlide() {
  return (
    <SlideContainer id="the-problem" variant="gradient">
      <SlideHeader
        section="Introduction"
        title="The Execution Bottleneck"
        subtitle="With PeerDAS, data availability is no longer the limit. Now what?"
      />

      <div className="grid md:grid-cols-2 gap-8">
        <AnimatedText delay={0.2}>
          <div className="interactive-panel">
            <h3 className="text-xl font-semibold text-white mb-4">The Promise</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span>Projects claim &quot;10,000+ TPS&quot;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span>Impressive benchmark numbers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span>&quot;Blazing fast&quot; execution</span>
              </li>
            </ul>
          </div>
        </AnimatedText>

        <AnimatedText delay={0.4}>
          <div className="interactive-panel border-red-500/30">
            <h3 className="text-xl font-semibold text-white mb-4">The Reality</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>Slow in production with real workloads</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>Benchmarks use unrealistic tx mixes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400">✗</span>
                <span>No shared model to compare solutions</span>
              </li>
            </ul>
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-12 text-center">
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          We need a <span className="text-white font-semibold">shared mental model</span> for
          understanding EVM scaling — one that makes it easy to reason about tradeoffs
          and compare solutions honestly.
        </p>
      </AnimatedText>
    </SlideContainer>
  );
}
