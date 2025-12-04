'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import { DemandCurveChart } from '@/components/visualizations/DemandCurveChart';
import { transactionTypes, type TransactionType } from '@/data/transactions';

export function DemandCurvesIntroSlide() {
  const [selectedTx, setSelectedTx] = useState<TransactionType>(transactionTypes[0]);
  const [currentPrice, setCurrentPrice] = useState(50);
  const [timestamp, setTimestamp] = useState(0);

  // Animate timestamp for volatility demonstration
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <SlideContainer id="demand-curves-intro" variant="default">
      <SlideHeader
        section="The Model"
        title="Demand Curves"
        subtitle="At any given price, how much demand exists for each transaction type?"
      />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <AnimatedText delay={0.2}>
          <div className="space-y-6">
            <div className="interactive-panel">
              <h3 className="text-sm font-medium text-gray-400 mb-4">
                Transaction Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {transactionTypes.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium
                      transition-all border
                      ${
                        selectedTx.id === tx.id
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-white/10 bg-transparent text-gray-500 hover:text-gray-300'
                      }
                    `}
                    style={{
                      borderColor: selectedTx.id === tx.id ? selectedTx.color + '50' : undefined,
                    }}
                  >
                    {tx.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="interactive-panel">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Current Price</span>
                <span className="text-sm text-white font-mono">{currentPrice} gwei</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Drag to see how demand changes with price
              </p>
            </div>

            <div className="interactive-panel">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Time Volatility</span>
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  className={`
                    px-3 py-1 rounded text-xs font-medium
                    ${isAnimating ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}
                  `}
                >
                  {isAnimating ? 'Stop' : 'Animate'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={timestamp}
                onChange={(e) => setTimestamp(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Demand fluctuates over time based on volatility
              </p>
            </div>

            <div className="text-sm text-gray-400 space-y-2">
              <p>
                <span className="text-white font-semibold">Price Elasticity</span>: How much
                demand drops as price increases
              </p>
              <p>
                <span className="text-white font-semibold">Volatility</span>: How much demand
                fluctuates over time (market events, NFT drops, etc.)
              </p>
            </div>
          </div>
        </AnimatedText>

        {/* Chart */}
        <AnimatedText delay={0.4}>
          <div className="interactive-panel h-[400px]">
            <DemandCurveChart
              transactionType={selectedTx}
              timestamp={timestamp}
              currentPrice={currentPrice}
            />
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Key Insight</p>
              <p>
                The optimal fee market finds the price where total demand equals
                total capacity. EIP-1559 attempts to discover this dynamically.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
