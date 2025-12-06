'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader } from '@/components/ui/SlideContainer';
import { resources, type Resource } from '@/data/resources';

const MULTIPLIER_STEPS = [1, 1.5, 2, 3, 5, 10];

export function ResourceGrowthSlide() {
  const [multipliers, setMultipliers] = useState<Record<string, number>>(
    Object.fromEntries(resources.map((r) => [r.id, 1]))
  );

  const cycleMultiplier = (resourceId: string) => {
    setMultipliers((prev) => {
      const currentIndex = MULTIPLIER_STEPS.indexOf(prev[resourceId]);
      const nextIndex = (currentIndex + 1) % MULTIPLIER_STEPS.length;
      return { ...prev, [resourceId]: MULTIPLIER_STEPS[nextIndex] };
    });
  };

  const resetAll = () => {
    setMultipliers(Object.fromEntries(resources.map((r) => [r.id, 1])));
  };

  // Calculate total multiplier effect
  const avgMultiplier =
    Object.values(multipliers).reduce((sum, m) => sum + m, 0) / Object.values(multipliers).length;

  return (
    <SlideContainer id="resource-growth" variant="default">
      <SlideHeader
        section="Scaling Solutions"
        title="Growing the Bars"
        subtitle="Click any resource to increase its capacity. This is what scaling means."
      />

      <div className="mt-8">
        {/* Resources grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {resources.map((resource) => {
            const multiplier = multipliers[resource.id];
            const isScaled = multiplier > 1;
            const barWidth = Math.min((multiplier / 10) * 100, 100);

            return (
              <motion.button
                key={resource.id}
                onClick={() => cycleMultiplier(resource.id)}
                className={`interactive-panel text-left transition-all cursor-pointer ${
                  isScaled ? 'border-primary-500/40' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{resource.icon}</span>
                    <span className="text-sm font-medium text-white">{resource.name.split(' ')[0]}</span>
                  </div>
                  <span
                    className={`text-lg font-bold ${isScaled ? 'text-primary-400' : 'text-gray-500'}`}
                  >
                    {multiplier}x
                  </span>
                </div>

                {/* Bar visualization */}
                <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                  {/* Original capacity marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
                    style={{ left: `${(1 / 10) * 100}%` }}
                  />

                  {/* Current capacity bar */}
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: resource.color }}
                    initial={{ width: '10%' }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ type: 'spring', damping: 15 }}
                  />
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {isScaled ? (
                    <span className="text-primary-400">
                      {resource.maxThroughput.toFixed(1)} → {(resource.maxThroughput * multiplier).toFixed(1)} {resource.unit}
                    </span>
                  ) : (
                    <span>Click to scale</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Summary section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="interactive-panel">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Average Improvement</span>
              <span className={`text-2xl font-bold ${avgMultiplier > 1 ? 'text-primary-400' : 'text-gray-500'}`}>
                {avgMultiplier.toFixed(1)}x
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {resources.map((resource) => {
                const multiplier = multipliers[resource.id];
                if (multiplier <= 1) return null;
                return (
                  <span
                    key={resource.id}
                    className="text-xs px-2 py-1 rounded flex items-center gap-1"
                    style={{ backgroundColor: resource.color + '20', color: resource.color }}
                  >
                    {resource.icon} {multiplier}x
                  </span>
                );
              })}
              {avgMultiplier === 1 && (
                <span className="text-xs text-gray-500">No resources scaled yet</span>
              )}
            </div>

            {avgMultiplier > 1 && (
              <button
                onClick={resetAll}
                className="mt-3 text-xs text-gray-500 hover:text-white transition-colors"
              >
                Reset all
              </button>
            )}
          </div>

          <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-white mb-1">This is Scaling</p>
                <p>
                  Each scaling technique targets specific resources. Parallel execution improves EVM compute.
                  Better databases improve state access. ZK proofs help verification.
                </p>
                <p className="mt-2 text-primary-400">
                  → Check the Scaling Matrix to see which techniques improve which resources!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
}
