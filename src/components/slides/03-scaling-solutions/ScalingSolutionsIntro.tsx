'use client';

import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

export function ScalingSolutionsIntroSlide() {
  return (
    <SlideContainer id="scaling-solutions-intro" variant="default">
      <SlideHeader
        section="Scaling Solutions"
        title="What Does Scaling Actually Mean?"
        subtitle="Different techniques target different bottlenecks"
      />

      <div className="grid md:grid-cols-2 gap-8">
        <AnimatedText delay={0.2}>
          <div className="space-y-6">
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">The Fundamental Question</h3>
              <p className="text-gray-300 mb-4">
                When someone claims &quot;10x faster&quot; or &quot;100k TPS&quot;, ask:
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">1.</span>
                  <span><span className="text-white">What resource</span> is being improved?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">2.</span>
                  <span><span className="text-white">Which transactions</span> benefit?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">3.</span>
                  <span><span className="text-white">What tradeoffs</span> are made?</span>
                </li>
              </ul>
            </div>

            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">Two Approaches</h3>
              <div className="space-y-4">
                <div className="border-l-2 border-green-500 pl-4">
                  <div className="text-white font-medium">Increase Capacity</div>
                  <p className="text-sm text-gray-400 mt-1">
                    Add more execution threads, faster hardware, better algorithms
                  </p>
                </div>
                <div className="border-l-2 border-blue-500 pl-4">
                  <div className="text-white font-medium">Reduce Consumption</div>
                  <p className="text-sm text-gray-400 mt-1">
                    Optimize storage access, compress data, batch operations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedText>

        <AnimatedText delay={0.4}>
          <div className="space-y-6">
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">Categories of Scaling Tech</h3>
              <div className="space-y-3">
                <TechCategory
                  name="Execution"
                  color="#FF6B6B"
                  examples="Parallel execution, JIT compilation"
                  description="Make the CPU do more work per second"
                />
                <TechCategory
                  name="Storage"
                  color="#4DABF7"
                  examples="Verkle trees, state expiry"
                  description="Make state access faster and cheaper"
                />
                <TechCategory
                  name="Networking"
                  color="#69DB7C"
                  examples="Data availability sampling, blob space"
                  description="Get more data on/off chain efficiently"
                />
                <TechCategory
                  name="Cryptography"
                  color="#9775FA"
                  examples="Signature aggregation, ZK proofs"
                  description="Verify more with less work"
                />
              </div>
            </div>
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">&#x1F4A1;</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Key Insight</p>
              <p>
                No single technique solves everything. Real scaling comes from understanding
                which bottleneck matters most for your workload, then applying the right combination of techniques.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}

function TechCategory({
  name,
  color,
  examples,
  description,
}: {
  name: string;
  color: string;
  examples: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="text-white font-medium">{name}</div>
        <div className="text-xs text-gray-500">{examples}</div>
        <div className="text-sm text-gray-400 mt-0.5">{description}</div>
      </div>
    </div>
  );
}
