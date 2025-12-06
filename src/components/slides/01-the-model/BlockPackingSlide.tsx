'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideContainer, SlideHeader } from '@/components/ui/SlideContainer';
import { transactionTypes, type TransactionType } from '@/data/transactions';
import { resources, type Resource, type ResourceId } from '@/data/resources';

interface AddedTransaction {
  id: string;
  type: TransactionType;
  count: number;
}

export function BlockPackingSlide() {
  const [addedTransactions, setAddedTransactions] = useState<AddedTransaction[]>([]);
  const [selectedTxType, setSelectedTxType] = useState<TransactionType | null>(null);
  const [blockFull, setBlockFull] = useState(false);

  // Calculate resource usage from all added transactions
  const resourceUsage = useMemo(() => {
    const usage: Record<ResourceId, number> = {
      'evm-compute': 0,
      'state-access': 0,
      'merklization': 0,
      'block-verification': 0,
      'block-distribution': 0,
      'state-growth': 0,
      'history-growth': 0,
      'proof-generation': 0,
    };

    for (const tx of addedTransactions) {
      for (const [resourceId, consumption] of Object.entries(tx.type.resourceConsumption)) {
        if (resourceId in usage) {
          usage[resourceId as ResourceId] += consumption * tx.count;
        }
      }
    }

    return usage;
  }, [addedTransactions]);

  // Find the bottleneck resource (highest percentage of max)
  const bottleneck = useMemo(() => {
    let maxPercent = 0;
    let bottleneckResource: Resource | null = null;

    for (const resource of resources) {
      const percent = (resourceUsage[resource.id] / resource.maxThroughput) * 100;
      if (percent > maxPercent) {
        maxPercent = percent;
        bottleneckResource = resource;
      }
    }

    return { resource: bottleneckResource, percent: maxPercent };
  }, [resourceUsage]);

  // Check if adding a transaction would exceed any resource limit
  const wouldExceedLimit = useCallback(
    (txType: TransactionType, count: number): { exceeds: boolean; resource: Resource | null } => {
      for (const resource of resources) {
        const currentUsage = resourceUsage[resource.id];
        const additionalUsage = (txType.resourceConsumption[resource.id] || 0) * count;
        const newUsage = currentUsage + additionalUsage;
        const newPercent = (newUsage / resource.maxThroughput) * 100;
        if (newPercent > 100) {
          return { exceeds: true, resource };
        }
      }
      return { exceeds: false, resource: null };
    },
    [resourceUsage]
  );

  const addTransaction = (txType: TransactionType, count: number = 1) => {
    console.log('Adding', count, txType.name);
    // Check if adding this would exceed any resource limit
    const { exceeds, resource } = wouldExceedLimit(txType, count);
    console.log('Exceeds?', exceeds, resource?.name);
    if (exceeds) {
      setBlockFull(true);
      // Flash the block full state briefly then clear it
      setTimeout(() => setBlockFull(false), 1500);
      return; // Don't add the transaction
    }

    const existingIndex = addedTransactions.findIndex((t) => t.type.id === txType.id);
    if (existingIndex >= 0) {
      const updated = [...addedTransactions];
      updated[existingIndex].count += count;
      setAddedTransactions(updated);
    } else {
      setAddedTransactions([
        ...addedTransactions,
        { id: `${txType.id}-${Date.now()}`, type: txType, count },
      ]);
    }
  };

  const removeTransaction = (txType: TransactionType, count: number = 1) => {
    const existingIndex = addedTransactions.findIndex((t) => t.type.id === txType.id);
    if (existingIndex >= 0) {
      const updated = [...addedTransactions];
      updated[existingIndex].count -= count;
      if (updated[existingIndex].count <= 0) {
        updated.splice(existingIndex, 1);
      }
      setAddedTransactions(updated);
    }
  };

  const clearAll = () => {
    setAddedTransactions([]);
  };

  const totalTxCount = addedTransactions.reduce((sum, t) => sum + t.count, 0);

  return (
    <SlideContainer id="block-packing" variant="default">
      <SlideHeader
        section="The Model"
        title="Pack a Block"
        subtitle="Add transactions and watch which resources hit their limits first"
      />

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        {/* Left side: Transaction selector */}
        <div className="space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            Click transactions to add them to the block:
          </div>

          <div className="grid grid-cols-2 gap-3">
            {transactionTypes.slice(0, 6).map((txType) => {
              const txCount = addedTransactions.find((t) => t.type.id === txType.id)?.count || 0;
              return (
                <motion.button
                  key={txType.id}
                  onClick={() => addTransaction(txType, 10)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    removeTransaction(txType, 10);
                  }}
                  className={`
                    interactive-panel text-left p-4 transition-all
                    hover:border-white/30
                    ${selectedTxType?.id === txType.id ? 'border-white/40' : ''}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => setSelectedTxType(txType)}
                  onMouseLeave={() => setSelectedTxType(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{txType.name}</span>
                    {txCount > 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: txType.color + '30', color: txType.color }}
                      >
                        {txCount}x
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(txType.averageGas / 1000).toFixed(0)}k gas
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Left-click: +10 transactions | Right-click: -10 transactions
          </div>

          {totalTxCount > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={clearAll}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear all ({totalTxCount} transactions)
            </motion.button>
          )}

          {/* Transaction details tooltip */}
          <AnimatePresence>
            {selectedTxType && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="interactive-panel mt-4"
              >
                <div className="text-sm font-medium text-white mb-2">
                  {selectedTxType.name}
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {selectedTxType.description}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedTxType.resourceConsumption).map(([resourceId, value]) => {
                    const resource = resources.find((r) => r.id === resourceId);
                    if (!resource || value === 0) return null;
                    return (
                      <div key={resourceId} className="flex items-center gap-2">
                        <span className="text-gray-500">{resource.icon}</span>
                        <span className="text-gray-400">
                          {typeof value === 'number' ? value.toFixed(3) : value} {resource.unit.split('/')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side: Resource bars */}
        <div className="space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            Resource consumption (per second):
          </div>

          <div className="space-y-3">
            {resources.map((resource) => {
              const usage = resourceUsage[resource.id];
              const percent = Math.min((usage / resource.maxThroughput) * 100, 100);
              const isBottleneck = bottleneck.resource?.id === resource.id && percent > 0;
              const isOverflow = percent >= 100;

              return (
                <div key={resource.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{resource.icon}</span>
                      <span className={isBottleneck ? 'text-white font-medium' : 'text-gray-400'}>
                        {resource.name}
                      </span>
                      {isBottleneck && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                          BOTTLENECK
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {usage.toFixed(2)} / {resource.maxThroughput} {resource.unit}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: isOverflow ? '#EF4444' : resource.color,
                        width: `${Math.min(percent, 100)}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percent, 100)}%` }}
                      transition={{ type: 'spring', damping: 15 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary panel */}
          {totalTxCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`interactive-panel mt-6 transition-colors ${
                blockFull ? 'border-red-500/50 bg-red-500/10' : ''
              }`}
            >
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transactions:</span>
                  <span className="text-white font-medium">{totalTxCount}</span>
                </div>
                {bottleneck.resource && bottleneck.percent > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bottleneck:</span>
                    <span style={{ color: bottleneck.resource.color }}>
                      {bottleneck.resource.name} ({bottleneck.percent.toFixed(0)}%)
                    </span>
                  </div>
                )}
                {blockFull && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-red-400 text-xs mt-2 p-2 bg-red-500/20 rounded border border-red-500/30"
                  >
                    <span className="font-bold">BLOCK FULL!</span> Adding more would exceed a resource limit.
                    <br />
                    Notice how other resources still have capacity - this is inefficient packing.
                  </motion.div>
                )}
                {!blockFull && bottleneck.percent >= 90 && (
                  <div className="text-yellow-400 text-xs mt-2 p-2 bg-yellow-500/10 rounded">
                    Almost full! {bottleneck.resource?.name} is at {bottleneck.percent.toFixed(0)}%.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Educational insight */}
          {totalTxCount === 0 && (
            <div className="interactive-panel bg-primary-500/5 border-primary-500/20 mt-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-white mb-1">Try different transaction mixes!</p>
                  <p className="text-gray-400">
                    Adding ETH transfers mostly stresses state access. Uniswap swaps are heavy on
                    EVM compute. Rollup batches hit block distribution limits.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SlideContainer>
  );
}
