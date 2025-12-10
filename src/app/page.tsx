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
  BlockPackingSlide,
} from '@/components/slides/01-the-model';
import {
  FeeMarketsIntroSlide,
  MarketClearingPriceSlide,
  DemandCurvesIntroSlide,
  EIP1559ExplainedSlide,
  BottleneckSlide,
  MultidimensionalFeesSlide,
} from '@/components/slides/02-fee-markets';
import { ScalingMatrixSlide, ResourceGrowthSlide } from '@/components/slides/03-scaling-solutions';
import { SimulationSlide } from '@/components/slides/04-simulation';
import { PumpYourNumbersSlide } from '@/components/slides/05-pump-your-numbers';
import { ProjectsSlide } from '@/components/slides/06-projects';

// Slide definitions for navigation
// Order: Introduction -> The Model -> Scaling Solutions -> Fee Markets -> Simulation
const slideDefinitions = [
  { id: 'the-problem', title: 'The Problem', section: 'Introduction', sectionIndex: 0, slideIndex: 0 },
  { id: 'what-we-will-build', title: 'What We\'ll Build', section: 'Introduction', sectionIndex: 0, slideIndex: 1 },
  // The Model: resources, transactions, block packing
  { id: 'resources-intro', title: 'Resources', section: 'The Model', sectionIndex: 1, slideIndex: 0 },
  { id: 'transactions-intro', title: 'Transactions', section: 'The Model', sectionIndex: 1, slideIndex: 1 },
  { id: 'block-packing', title: 'Block Packing', section: 'The Model', sectionIndex: 1, slideIndex: 2 },
  // Scaling Solutions
  { id: 'resource-growth', title: 'Growing the Bars', section: 'Scaling Solutions', sectionIndex: 2, slideIndex: 0 },
  { id: 'scaling-matrix', title: 'Scaling Matrix', section: 'Scaling Solutions', sectionIndex: 2, slideIndex: 1 },
  // Fee Markets
  { id: 'fee-markets-intro', title: 'Scaling Isn\'t Enough', section: 'Fee Markets', sectionIndex: 3, slideIndex: 0 },
  { id: 'market-clearing-price', title: 'Market Clearing Price', section: 'Fee Markets', sectionIndex: 3, slideIndex: 1 },
  { id: 'demand-curves-intro', title: 'Demand Curves', section: 'Fee Markets', sectionIndex: 3, slideIndex: 2 },
  { id: 'eip1559-explained', title: 'EIP-1559', section: 'Fee Markets', sectionIndex: 3, slideIndex: 3 },
  { id: 'bottleneck-problem', title: 'The Bottleneck', section: 'Fee Markets', sectionIndex: 3, slideIndex: 4 },
  { id: 'multidimensional-fees', title: 'Multi-Dimensional Fees', section: 'Fee Markets', sectionIndex: 3, slideIndex: 5 },
  // Interactive sections
  { id: 'simulation-dashboard', title: 'TPS Simulator', section: 'Interactive Simulation', sectionIndex: 4, slideIndex: 0 },
  { id: 'pump-your-numbers', title: 'Pump Your Numbers', section: 'The Game', sectionIndex: 5, slideIndex: 0 },
  { id: 'projects-comparison', title: 'Build Together', section: 'What\'s Next', sectionIndex: 6, slideIndex: 0 },
];

export default function Home() {
  const { setSlides, currentSlideId } = usePresentationStore();

  // Initialize slides
  useEffect(() => {
    setSlides(slideDefinitions);
  }, [setSlides]);

  return (
    <main className="relative">
      {/* Top header with feedback */}
      <header className="fixed top-0 right-0 z-50 p-4">
        <FeedbackButton context={currentSlideId || 'general'} />
      </header>

      {/* Navigation and controls */}
      <ScrollProgress />
      <SlideNav />
      <KeyboardControls />
      <KeyboardHints />

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
      <BlockPackingSlide />

      {/* Scaling Solutions Slides */}
      <ResourceGrowthSlide />
      <ScalingMatrixSlide />

      {/* Fee Markets Slides */}
      <FeeMarketsIntroSlide />
      <MarketClearingPriceSlide />
      <DemandCurvesIntroSlide />
      <EIP1559ExplainedSlide />
      <BottleneckSlide />
      <MultidimensionalFeesSlide />

      {/* Interactive Simulation */}
      <SimulationSlide />

      {/* Pump Your Numbers Game */}
      <PumpYourNumbersSlide />

      {/* Project Comparison */}
      <ProjectsSlide />

      {/* Coming Soon placeholder */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Make This Better!
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-4">
            Contribute on GitHub to add features, better metrics, improve the models,
            or add scaling tech.
          </p>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-4">
            For the latest benchmarks, check out{' '}
            <a
              href="https://github.com/ethereum/execution-specs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 underline"
            >
              ethereum/execution-specs
            </a>
            . Special thanks to{' '}
            <a
              href="https://thesecretlivesofdata.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 underline"
            >
              The Secret Lives of Data
            </a>
            {' '}for inspiring the explanation of complex topics with live visualizations.
          </p>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            Help bring the world onchain at{' '}
            <a
              href="https://optimism.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              optimism.io
            </a>
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
          </div>
        </motion.div>
      </section>
    </main>
  );
}
