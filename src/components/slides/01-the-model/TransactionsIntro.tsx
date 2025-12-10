'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import { transactionTypes, type TransactionType, isFullyParallelizable, getHotSlots } from '@/data/transactions';
import { resources } from '@/data/resources';

export function TransactionsIntroSlide() {
  const [selectedTx, setSelectedTx] = useState<TransactionType>(transactionTypes[0]);

  return (
    <SlideContainer id="transactions-intro" variant="default">
      <SlideHeader
        section="The Model"
        title="Transactions"
        subtitle="Different transaction types consume different amounts of each resource."
      />

      <p className="text-sm text-gray-500 -mt-8 mb-6 text-center">
        Resource categories are real, but consumption numbers are directional — actual values vary by client implementation.
        See <a href="https://github.com/ethereum/execution-specs" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">ethereum/execution-specs</a> for benchmarks.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Transaction selector */}
        <AnimatedText delay={0.2}>
          <div className="interactive-panel">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Select Transaction Type
            </h3>
            <div className="space-y-2">
              {transactionTypes.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg
                    transition-all border
                    ${
                      selectedTx.id === tx.id
                        ? 'bg-white/10 border-white/20'
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tx.color }}
                    />
                    <div>
                      <div className="font-medium text-white">{tx.name}</div>
                      <div className="text-xs text-gray-500">
                        ~{(tx.averageGas / 1000).toFixed(0)}k gas
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </AnimatedText>

        {/* Resource consumption */}
        <AnimatedText delay={0.4} className="md:col-span-2">
          <div className="interactive-panel h-full">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Resource Consumption per TX
            </h3>

            <motion.div
              key={selectedTx.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Transaction details */}
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: selectedTx.color + '20' }}
                >
                  {selectedTx.category === 'transfer' && '💸'}
                  {selectedTx.category === 'defi' && '🔄'}
                  {selectedTx.category === 'nft' && '🖼️'}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white">
                    {selectedTx.name}
                  </h4>
                  <p className="text-sm text-gray-400">{selectedTx.description}</p>
                </div>
              </div>

              {/* Resource bars */}
              <div className="space-y-4">
                {resources.map((resource) => {
                  const consumption = selectedTx.resourceConsumption[resource.id] || 0;
                  const maxConsumption = Math.max(
                    ...transactionTypes.map((t) => t.resourceConsumption[resource.id] || 0)
                  );
                  const percentage = maxConsumption > 0 ? consumption / maxConsumption : 0;

                  return (
                    <div key={resource.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{resource.name}</span>
                        <span className="text-white font-mono">
                          {consumption.toLocaleString()} {resource.unit.split('/')[0]}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: resource.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Properties */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-xs text-gray-500">Parallelizable</div>
                  <div className={`font-semibold ${isFullyParallelizable(selectedTx) ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isFullyParallelizable(selectedTx) ? 'Yes (no hot slots)' : `No (${getHotSlots(selectedTx).length} hot slots)`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">% of Mainnet TXs</div>
                  <div className="text-white font-semibold">
                    {selectedTx.percentOfMainnetTxs}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Demand Volatility</div>
                  <div className="text-white font-semibold">
                    {(selectedTx.demandVolatility * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Price Elasticity</div>
                  <div className="text-white font-semibold">
                    {(selectedTx.priceElasticity * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="text-center text-gray-400">
          <p>
            Notice how <span className="text-white font-semibold">swaps</span> consume much more
            CPU gas but similar state access as <span className="text-white font-semibold">transfers</span>.
          </p>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
