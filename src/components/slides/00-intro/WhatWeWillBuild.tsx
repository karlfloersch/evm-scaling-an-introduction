'use client';

import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

export function WhatWeWillBuildSlide() {
  const sections = [
    {
      number: '1',
      title: 'The Model',
      description: 'Resources, transactions, and block packing',
      color: '#4DABF7',
    },
    {
      number: '2',
      title: 'Scaling Solutions',
      description: 'Different ways to grow the bars',
      color: '#FFA94D',
    },
    {
      number: '3',
      title: 'Fee Markets',
      description: 'Why scaling alone isn\'t enough',
      color: '#69DB7C',
    },
    {
      number: '4',
      title: 'Build Together',
      description: 'How you can contribute',
      color: '#9775FA',
    },
  ];

  return (
    <SlideContainer id="what-we-will-build" variant="default">
      <SlideHeader
        section="Introduction"
        title="What We&apos;ll Build Together"
        subtitle="A framework for understanding and comparing EVM scaling approaches"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section, i) => (
          <AnimatedText key={section.number} delay={0.1 * (i + 1)}>
            <motion.div
              className="interactive-panel h-full"
              style={{ borderColor: `${section.color}30` }}
              whileHover={{ scale: 1.02, borderColor: `${section.color}60` }}
            >
              <div
                className="text-4xl font-bold mb-3"
                style={{ color: section.color }}
              >
                {section.number}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {section.title}
              </h3>
              <p className="text-sm text-gray-400">{section.description}</p>
            </motion.div>
          </AnimatedText>
        ))}
      </div>

      <AnimatedText delay={0.6} className="mt-12">
        <div className="interactive-panel bg-accent-purple/5 border-accent-purple/20">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎯</span>
            <div>
              <h3 className="text-lg font-semibold text-white">Our Goal</h3>
              <p className="text-gray-400">
                Build intuition for what scaling means, so you can evaluate claims
                and understand tradeoffs — not just accept benchmark numbers at face value.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>

      <AnimatedText delay={0.8} className="mt-8">
        <div className="interactive-panel bg-red-500/5 border-red-500/20">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎪</span>
            <div>
              <h3 className="text-lg font-semibold text-white">Bonus: Pump Your Numbers</h3>
              <p className="text-gray-400">
                Learn how to game benchmarks for your marketing team. (For educational purposes only!)
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
