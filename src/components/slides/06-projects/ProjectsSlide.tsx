'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

interface Project {
  id: string;
  name: string;
  category: 'L1' | 'L2' | 'Alt-L1';
  vm: string;
  scalingTech: string[];
  claimedTps: string;
  realisticTps: string;
  parallelism: string;
  tradeoffs: string[];
  color: string;
}

const projects: Project[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    category: 'L1',
    vm: 'EVM',
    scalingTech: ['Sequential execution', 'EIP-1559 fee market'],
    claimedTps: '~15-30',
    realisticTps: '~15-30',
    parallelism: 'None (sequential)',
    tradeoffs: ['Maximum decentralization', 'Battle-tested security', 'Limited throughput'],
    color: '#627EEA',
  },
  {
    id: 'solana',
    name: 'Solana',
    category: 'Alt-L1',
    vm: 'SVM (Sealevel)',
    scalingTech: ['Parallel execution', 'Proof of History', 'Gulf Stream'],
    claimedTps: '65,000',
    realisticTps: '~400-700',
    parallelism: 'Declared access lists',
    tradeoffs: ['High hardware requirements', 'Newer security model', 'Occasional outages'],
    color: '#14F195',
  },
  {
    id: 'sui',
    name: 'Sui',
    category: 'Alt-L1',
    vm: 'Move VM',
    scalingTech: ['Object-centric model', 'Parallel execution', 'Narwhal/Bullshark'],
    claimedTps: '297,000',
    realisticTps: '~800-5,000',
    parallelism: 'Object ownership model',
    tradeoffs: ['New language (Move)', 'Less battle-tested', 'Different programming model'],
    color: '#6FBCF0',
  },
  {
    id: 'aptos',
    name: 'Aptos',
    category: 'Alt-L1',
    vm: 'Move VM',
    scalingTech: ['Block-STM parallel execution', 'Optimistic concurrency'],
    claimedTps: '160,000',
    realisticTps: '~900-4,000',
    parallelism: 'Optimistic + re-execution',
    tradeoffs: ['New language (Move)', 'Optimistic overhead on conflicts', 'Newer ecosystem'],
    color: '#2DD8A7',
  },
  {
    id: 'monad',
    name: 'Monad',
    category: 'L1',
    vm: 'EVM (compatible)',
    scalingTech: ['Optimistic parallel execution', 'MonadBFT', 'Async execution'],
    claimedTps: '10,000',
    realisticTps: 'TBD (not live)',
    parallelism: 'Optimistic + speculation',
    tradeoffs: ['EVM compatible', 'New consensus', 'Not yet battle-tested'],
    color: '#836EF9',
  },
  {
    id: 'megaeth',
    name: 'MegaETH',
    category: 'L2',
    vm: 'EVM (compatible)',
    scalingTech: ['Parallel execution', 'Real-time proving', 'Sequencer specialization'],
    claimedTps: '100,000+',
    realisticTps: 'TBD (not live)',
    parallelism: 'Specialized sequencer',
    tradeoffs: ['L2 security model', 'Centralized sequencer', 'EVM compatible'],
    color: '#FF6B6B',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    category: 'L2',
    vm: 'EVM (compatible)',
    scalingTech: ['Optimistic rollup', 'Nitro compression', 'Stylus (WASM)'],
    claimedTps: '~4,000',
    realisticTps: '~40-250',
    parallelism: 'Sequential (like Ethereum)',
    tradeoffs: ['Inherits ETH security', '7-day withdrawal', 'Sequencer centralization'],
    color: '#28A0F0',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    category: 'L2',
    vm: 'EVM (compatible)',
    scalingTech: ['Optimistic rollup', 'Bedrock', 'Superchain'],
    claimedTps: '~2,000',
    realisticTps: '~20-200',
    parallelism: 'Sequential (like Ethereum)',
    tradeoffs: ['Inherits ETH security', '7-day withdrawal', 'Simple & battle-tested'],
    color: '#FF0420',
  },
];

export function ProjectsSlide() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'L1' | 'L2' | 'Alt-L1'>('all');

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter);

  return (
    <SlideContainer id="projects-comparison" variant="default">
      <SlideHeader
        section="Project Comparison"
        title="How Do They Compare?"
        subtitle="Different approaches to the same problem"
      />

      {/* Filter Tabs */}
      <AnimatedText delay={0.1}>
        <div className="flex gap-2 mb-6">
          {(['all', 'L1', 'L2', 'Alt-L1'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </AnimatedText>

      {/* Project Grid */}
      <AnimatedText delay={0.2}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {filteredProjects.map(project => (
            <motion.button
              key={project.id}
              onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedProject?.id === project.id
                  ? 'bg-white/10 border-white/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="font-semibold text-white">{project.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">
                  {project.category}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">VM</span>
                  <span className="text-gray-300">{project.vm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Claimed</span>
                  <span className="text-gray-300">{project.claimedTps} TPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Realistic</span>
                  <span className="text-green-400">{project.realisticTps} TPS</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </AnimatedText>

      {/* Selected Project Details */}
      {selectedProject && (
        <AnimatedText delay={0}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="interactive-panel"
            style={{ borderColor: `${selectedProject.color}50` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedProject.color }}
              />
              <h3 className="text-xl font-bold text-white">{selectedProject.name}</h3>
              <span className="text-sm px-2 py-1 rounded bg-white/10 text-gray-400">
                {selectedProject.category}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Scaling Tech */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Scaling Technology</h4>
                <ul className="space-y-1">
                  {selectedProject.scalingTech.map((tech, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-primary-400">•</span> {tech}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Parallelism Approach */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Parallelism</h4>
                <p className="text-sm text-white">{selectedProject.parallelism}</p>

                <h4 className="text-sm font-medium text-gray-400 mt-4 mb-2">VM</h4>
                <p className="text-sm text-white">{selectedProject.vm}</p>
              </div>

              {/* Trade-offs */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Trade-offs</h4>
                <ul className="space-y-1">
                  {selectedProject.tradeoffs.map((tradeoff, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-yellow-400">•</span> {tradeoff}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* TPS Comparison Bar */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Claimed TPS</span>
                    <span className="text-gray-300">{selectedProject.claimedTps}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full opacity-50"
                      style={{
                        backgroundColor: selectedProject.color,
                        width: '100%'
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Realistic TPS</span>
                    <span className="text-green-400">{selectedProject.realisticTps}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: selectedProject.realisticTps.includes('TBD') ? '10%' : '30%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatedText>
      )}

      {/* Key Insight */}
      <AnimatedText delay={0.4}>
        <div className="mt-6 interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">The Pattern</p>
              <p>
                Notice how claimed TPS is often 10-100x higher than realistic TPS? That&apos;s the &quot;Pump Your Numbers&quot; effect.
                Claimed numbers usually come from simple transfers on optimized hardware. Real-world performance with
                DeFi transactions, state contention, and decentralization requirements is always lower.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
