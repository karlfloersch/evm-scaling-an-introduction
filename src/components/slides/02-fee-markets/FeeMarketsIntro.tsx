'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideContainer, SlideHeader } from '@/components/ui/SlideContainer';
import { transactionTypes, type TransactionType } from '@/data/transactions';
import { resources, type Resource, type ResourceId } from '@/data/resources';

interface AddedTransaction {
  id: string;
  type: TransactionType;
  count: number;
}

export function FeeMarketsIntroSlide() {
  const [addedTransactions, setAddedTransactions] = useState<AddedTransaction[]>([]);
  const [selectedTxType, setSelectedTxType] = useState<TransactionType | null>(null);

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

  // Calculate how many txs fit in the block vs total requested (for backpressure)
  // When oversubscribed, we need to figure out how many txs actually fit at 100% capacity
  const { includedCount, pendingCount, pendingFees, includedFees } = useMemo(() => {
    if (!bottleneck.resource || bottleneck.percent <= 100) {
      // All txs fit
      const allCount = addedTransactions.reduce((sum, t) => sum + t.count, 0);
      const allFees = addedTransactions.reduce((sum, t) => sum + t.count * (t.type.feeGwei || 0), 0);
      return { includedCount: allCount, pendingCount: 0, pendingFees: 0, includedFees: allFees };
    }

    // Block is oversubscribed - calculate how many fit based on the bottleneck resource
    const bottleneckId = bottleneck.resource.id;
    const maxCapacity = bottleneck.resource.maxThroughput;

    let included = 0;
    let pending = 0;
    let pendingFeesTotal = 0;
    let includedFeesTotal = 0;
    let remainingCapacity = maxCapacity;

    // Process transactions and fit as many as possible
    for (const tx of addedTransactions) {
      const resourcePerTx = tx.type.resourceConsumption[bottleneckId] || 0;
      if (resourcePerTx === 0) {
        // This tx doesn't consume the bottleneck resource, all fit
        included += tx.count;
        includedFeesTotal += tx.count * (tx.type.feeGwei || 0);
        continue;
      }

      // How many of this tx type can fit in remaining capacity?
      const canFit = Math.floor(remainingCapacity / resourcePerTx);
      const actualFit = Math.min(canFit, tx.count);
      const actualPending = tx.count - actualFit;

      included += actualFit;
      pending += actualPending;
      includedFeesTotal += actualFit * (tx.type.feeGwei || 0);
      pendingFeesTotal += actualPending * (tx.type.feeGwei || 0);
      remainingCapacity -= actualFit * resourcePerTx;
    }

    return { includedCount: included, pendingCount: pending, pendingFees: pendingFeesTotal, includedFees: includedFeesTotal };
  }, [addedTransactions, bottleneck.resource, bottleneck.percent]);

  const addTransaction = (txType: TransactionType, count: number = 1) => {
    // Always allow adding - we track backpressure instead of blocking
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

  // Total fees collected is now calculated in the includedCount memo
  const totalFees = includedFees;

  // Get transaction types including XEN for this demo
  const demoTxTypes = useMemo(() => {
    const xenMint = transactionTypes.find(t => t.id === 'xen-mint');
    const ethTransfer = transactionTypes.find(t => t.id === 'eth-transfer');
    const erc20Transfer = transactionTypes.find(t => t.id === 'erc20-transfer');
    const uniswapSwap = transactionTypes.find(t => t.id === 'uniswap-swap-eth-usdc');
    const nftMint = transactionTypes.find(t => t.id === 'nft-mint');

    return [xenMint, ethTransfer, erc20Transfer, uniswapSwap, nftMint].filter(Boolean) as TransactionType[];
  }, []);

  const hasBackpressure = bottleneck.percent > 100;

  return (
    <SlideContainer id="fee-markets-intro" variant="default">
      <SlideHeader
        section="Fee Markets"
        title="Scaling Up Resources Is Not Enough"
        subtitle="Low-value transactions can consume all resources, blocking higher-value activity"
      />

      <div className="grid lg:grid-cols-2 gap-8 mt-6">
        {/* Left side: Transaction selector with fees */}
        <div className="space-y-4">
          <div className="text-sm text-gray-400 mb-2">
            Click transactions to add them. Notice the fee each pays:
          </div>

          <div className="grid grid-cols-1 gap-3">
            {demoTxTypes.map((txType) => {
              const txCount = addedTransactions.find((t) => t.type.id === txType.id)?.count || 0;
              const isXen = txType.id === 'xen-mint';
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
                    ${isXen ? 'border-red-500/30' : ''}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => setSelectedTxType(txType)}
                  onMouseLeave={() => setSelectedTxType(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: txType.color }}
                      />
                      <span className="font-medium text-white">{txType.name}</span>
                      {isXen && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                          STATE HOG
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-sm font-bold ${isXen ? 'text-red-400' : 'text-green-400'}`}>
                          {txType.feeGwei || 0} gwei
                        </div>
                        <div className="text-xs text-gray-500">fee per tx</div>
                      </div>
                      {txCount > 0 && (
                        <span
                          className="text-sm px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: txType.color + '30', color: txType.color }}
                        >
                          {txCount}x
                        </span>
                      )}
                    </div>
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
              Clear all
            </motion.button>
          )}

          {/* Transaction details on hover */}
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
                    const isHighState = resourceId === 'state-access' && value > 100;
                    return (
                      <div key={resourceId} className={`flex items-center gap-2 ${isHighState ? 'text-red-400' : ''}`}>
                        <span className="text-gray-500">{resource.icon}</span>
                        <span className={isHighState ? 'text-red-400 font-medium' : 'text-gray-400'}>
                          {typeof value === 'number' ? value.toFixed(value < 1 ? 3 : 0) : value} {resource.unit.split('/')[0]}
                          {isHighState && ' (!!)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side: Resource bars + stats */}
        <div className="space-y-4">
          {/* Summary stats - TX count and Fees */}
          <div className="grid grid-cols-3 gap-3">
            <div className="interactive-panel text-center">
              <div className="text-2xl font-bold text-white">{includedCount}</div>
              <div className="text-xs text-gray-500">In Block</div>
            </div>
            <div className={`interactive-panel text-center ${hasBackpressure ? 'border-orange-500/50 bg-orange-500/10' : ''}`}>
              <div className={`text-2xl font-bold ${hasBackpressure ? 'text-orange-400' : 'text-gray-600'}`}>
                {pendingCount}
              </div>
              <div className="text-xs text-gray-500">Waiting</div>
            </div>
            <div className="interactive-panel text-center">
              <div className="text-2xl font-bold text-green-400">{totalFees.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Gwei Collected</div>
            </div>
          </div>

          {/* Resource bars */}
          <div className="interactive-panel">
            <div className="text-sm text-gray-400 mb-3">Resource Usage:</div>
            <div className="space-y-2">
              {resources.map((resource) => {
                const usage = resourceUsage[resource.id];
                const percent = (usage / resource.maxThroughput) * 100;
                const isBottleneck = bottleneck.resource?.id === resource.id && percent > 0;
                const isOverflow = percent > 100;

                return (
                  <div key={resource.id} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{resource.icon}</span>
                        <span className={isBottleneck ? 'text-white font-medium' : 'text-gray-500'}>
                          {resource.name}
                        </span>
                        {isBottleneck && !isOverflow && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-red-500/20 text-red-400">
                            BOTTLENECK
                          </span>
                        )}
                        {isOverflow && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-orange-500/20 text-orange-400">
                            OVERSUBSCRIBED
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] ${isOverflow ? 'text-orange-400 font-bold' : 'text-gray-600'}`}>
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
                      <motion.div
                        className="h-full rounded-full absolute left-0"
                        style={{
                          backgroundColor: isOverflow ? '#F97316' : resource.color,
                          width: `${Math.min(percent, 100)}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percent, 100)}%` }}
                        transition={{ type: 'spring', damping: 15 }}
                      />
                      {/* Overflow indicator */}
                      {isOverflow && (
                        <motion.div
                          className="h-full absolute right-0 bg-orange-500/30"
                          style={{ width: `${Math.min((percent - 100) / percent * 100, 50)}%` }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result feedback */}
          <AnimatePresence mode="wait">
            {hasBackpressure ? (
              <motion.div
                key="backpressure"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="interactive-panel border-orange-500/50 bg-orange-500/10"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">📈</span>
                  <div className="text-sm">
                    <span className="font-bold text-orange-400">BACKPRESSURE!</span>
                    <p className="text-gray-400 mt-1">
                      {pendingCount} transactions waiting ({pendingFees.toLocaleString()} gwei in unmet demand).
                      The block is full but demand exceeds supply!
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : bottleneck.percent >= 100 ? (
              <motion.div
                key="full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="interactive-panel border-red-500/50 bg-red-500/10"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">🚫</span>
                  <div className="text-sm">
                    <span className="font-bold text-red-400">BLOCK FULL!</span>
                    <p className="text-gray-400 mt-1">
                      {bottleneck.resource?.name} is at capacity. Keep clicking to see backpressure build up!
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : bottleneck.percent > 50 && bottleneck.resource?.id === 'state-access' ? (
              <motion.div
                key="state-problem"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="interactive-panel bg-yellow-500/10 border-yellow-500/30"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="text-sm">
                    <span className="font-bold text-yellow-400">The Problem:</span>
                    <p className="text-gray-400 mt-1">
                      XEN mints pay only <span className="text-red-400">5 gwei</span> but consume massive state resources.
                      High-value transactions (80-100 gwei) are blocked!
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : totalTxCount === 0 ? (
              <motion.div
                key="hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="interactive-panel bg-primary-500/5 border-primary-500/20"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div className="text-sm">
                    <p className="text-gray-300 font-medium">Try this:</p>
                    <p className="text-gray-400 mt-1">
                      Add XEN mints until state-access fills up. Then keep clicking to see backpressure!
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="efficiency"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="interactive-panel"
              >
                <div className="text-sm text-gray-400">
                  <span className="text-gray-300 font-medium">Fee efficiency: </span>
                  {(totalFees / Math.max(includedCount, 1)).toFixed(1)} gwei/tx average
                  {totalFees / Math.max(includedCount, 1) < 20 && (
                    <span className="text-red-400 ml-2">(very low!)</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SlideContainer>
  );
}
