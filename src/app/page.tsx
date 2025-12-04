'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePresentationStore } from '@/stores/presentation';
import { ScrollProgress, SlideNav } from '@/components/presentation/ScrollProgress';
import { KeyboardControls, KeyboardHints } from '@/components/presentation/KeyboardControls';
import { FeedbackButton } from '@/components/ui/FeedbackButton';

// Slides
import { TheProblemSlide, WhatWeWillBuildSlide } from '@/components/slides/00-intro';
import {
  ResourcesIntroSlide,
  TransactionsIntroSlide,
  DemandCurvesIntroSlide,
} from '@/components/slides/01-the-model';

// Slide definitions for navigation
const slideDefinitions = [
  { id: 'the-problem', title: 'The Problem', section: 'Introduction', sectionIndex: 0, slideIndex: 0 },
  { id: 'what-we-will-build', title: 'What We\'ll Build', section: 'Introduction', sectionIndex: 0, slideIndex: 1 },
  { id: 'resources-intro', title: 'Resources', section: 'The Model', sectionIndex: 1, slideIndex: 0 },
  { id: 'transactions-intro', title: 'Transactions', section: 'The Model', sectionIndex: 1, slideIndex: 1 },
  { id: 'demand-curves-intro', title: 'Demand Curves', section: 'The Model', sectionIndex: 1, slideIndex: 2 },
];

export default function Home() {
  const { setSlides, currentSlideId } = usePresentationStore();

  // Initialize slides
  useEffect(() => {
    setSlides(slideDefinitions);
  }, [setSlides]);

  return (
    <main className="relative">
      {/* Navigation and controls */}
      <ScrollProgress />
      <SlideNav />
      <KeyboardControls />
      <KeyboardHints />
      <FeedbackButton context={currentSlideId || 'general'} />

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            EVM Scaling
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400 mb-8">
            An Interactive Introduction
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
            Build intuition for what EVM scaling actually means, how different
            solutions work, and how to evaluate performance claims.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <a
              href="#the-problem"
              className="
                px-8 py-4 rounded-full
                bg-primary-500 hover:bg-primary-400
                text-white font-semibold
                transition-all
                shadow-lg shadow-primary-500/25
              "
            >
              Start Learning
            </a>
            <span className="text-sm text-gray-500">
              or scroll down
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white/50 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Introduction Slides */}
      <TheProblemSlide />
      <WhatWeWillBuildSlide />

      {/* The Model Slides */}
      <ResourcesIntroSlide />
      <TransactionsIntroSlide />
      <DemandCurvesIntroSlide />

      {/* Coming Soon placeholder */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            More Coming Soon
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Fee markets, scaling solutions, project comparisons, and the
            infamous &quot;Pump Your Numbers&quot; section are in development.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://github.com/karlfloersch/evm-scaling-an-introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-6 py-3 rounded-lg
                bg-white/10 hover:bg-white/20
                text-white font-medium
                transition-all
              "
            >
              View on GitHub
            </a>
            <a
              href="https://github.com/karlfloersch/evm-scaling-an-introduction/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-6 py-3 rounded-lg
                border border-white/20 hover:border-white/40
                text-white font-medium
                transition-all
              "
            >
              Contribute
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
