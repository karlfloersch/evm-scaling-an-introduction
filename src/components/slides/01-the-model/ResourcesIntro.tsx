'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import { ResourceBar } from '@/components/visualizations/ResourceBar';
import { resources as allResources } from '@/data/resources';

export function ResourcesIntroSlide() {
  const [activeResources, setActiveResources] = useState(allResources.slice(0, 3));

  const toggleResource = (resourceId: string) => {
    const resource = allResources.find((r) => r.id === resourceId);
    if (!resource) return;

    setActiveResources((prev) => {
      const exists = prev.find((r) => r.id === resourceId);
      if (exists) {
        return prev.filter((r) => r.id !== resourceId);
      }
      return [...prev, resource];
    });
  };

  return (
    <SlideContainer id="resources-intro" variant="default">
      <SlideHeader
        section="The Model"
        title="Resources"
        subtitle="A blockchain has finite computational resources. Each limits throughput."
      />

      <div className="grid md:grid-cols-2 gap-8">
        <AnimatedText delay={0.2}>
          <div className="space-y-4">
            <p className="text-gray-300">
              Think of resources like lanes on a highway. Each has a maximum throughput,
              and transactions consume different amounts of each resource.
            </p>

            <div className="interactive-panel">
              <h3 className="text-sm font-medium text-gray-400 mb-4">
                Toggle Resources
              </h3>
              <div className="flex flex-wrap gap-2">
                {allResources.map((resource) => {
                  const isActive = activeResources.some((r) => r.id === resource.id);
                  return (
                    <button
                      key={resource.id}
                      onClick={() => toggleResource(resource.id)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium
                        transition-all border
                        ${
                          isActive
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/10 bg-transparent text-gray-500 hover:text-gray-300'
                        }
                      `}
                      style={{
                        borderColor: isActive ? resource.color + '50' : undefined,
                      }}
                    >
                      {resource.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </AnimatedText>

        <AnimatedText delay={0.4}>
          <div className="interactive-panel">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Current Ethereum Baselines
            </h3>
            <div className="space-y-4">
              {activeResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ResourceBar
                    resource={resource}
                    state={{
                      resourceId: resource.id,
                      currentThroughput: resource.currentBaseline * 0.6,
                      utilization: 0.6,
                      backpressure: 0,
                      effectiveMaxThroughput: resource.currentBaseline,
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    {resource.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="text-center text-gray-400">
          <p>
            The <span className="text-white font-semibold">bottleneck resource</span> —
            whichever hits capacity first — determines maximum throughput.
          </p>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
