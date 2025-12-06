'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

// Multi-resource supply/demand chart
function MultiResourceChart({
  txMix,
  demandLevel,
}: {
  txMix: number; // 0 = all CPU-heavy, 1 = all IO-heavy
  demandLevel: number;
}) {
  const width = 400;
  const height = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Resource supply capacities (in "effective TPS" for the current tx mix)
  // These shift based on the tx mix
  const cpuSupply = useMemo(() => {
    // CPU-heavy txs (low mix) hit CPU limit sooner
    // IO-heavy txs (high mix) have more room for CPU
    const baseCapacity = 100; // TPS when all txs are CPU-heavy
    // As mix goes up (more IO-heavy), CPU capacity increases
    return baseCapacity + txMix * 60;
  }, [txMix]);

  const ioSupply = useMemo(() => {
    // IO-heavy txs (high mix) hit IO limit sooner
    // CPU-heavy txs (low mix) have more room for IO
    const baseCapacity = 150; // TPS when all txs are IO-heavy
    // As mix goes up (more IO-heavy), IO capacity decreases
    return baseCapacity - txMix * 80;
  }, [txMix]);

  // Determine which resource is the bottleneck
  const bottleneck = cpuSupply < ioSupply ? 'cpu' : 'io';
  const effectiveCapacity = Math.min(cpuSupply, ioSupply);

  // Max scale values
  const maxQuantity = 180;
  const maxPrice = 150;

  // Generate demand curve
  const demandCurve = useMemo(() => {
    const points: { quantity: number; price: number }[] = [];
    const basePrice = 30 + demandLevel * 100;
    const referencePrice = 50;

    for (let price = 10; price <= maxPrice; price += 5) {
      const quantity = basePrice * Math.pow(referencePrice / price, 0.8);
      points.push({ quantity: Math.min(quantity, maxQuantity), price });
    }
    return points;
  }, [demandLevel]);

  // Find intersection points
  const findIntersection = (supplyQuantity: number) => {
    for (const point of demandCurve) {
      if (point.quantity <= supplyQuantity) {
        return point;
      }
    }
    return demandCurve[demandCurve.length - 1];
  };

  const cpuIntersection = findIntersection(cpuSupply);
  const ioIntersection = findIntersection(ioSupply);

  // Scale functions
  const toSvgX = (q: number) => padding.left + (q / maxQuantity) * chartWidth;
  const toSvgY = (p: number) => padding.top + chartHeight - (p / maxPrice) * chartHeight;

  // Build demand curve path
  const demandPath = demandCurve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.quantity)} ${toSvgY(pt.price)}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="w-full h-auto">
      {/* Grid */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={`grid-h-${f}`}
          x1={padding.left}
          y1={toSvgY(f * maxPrice)}
          x2={padding.left + chartWidth}
          y2={toSvgY(f * maxPrice)}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="2,2"
        />
      ))}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={`grid-v-${f}`}
          x1={toSvgX(f * maxQuantity)}
          y1={padding.top}
          x2={toSvgX(f * maxQuantity)}
          y2={padding.top + chartHeight}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="2,2"
        />
      ))}

      {/* Axes */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={padding.left + chartWidth}
        y2={padding.top + chartHeight}
        stroke="rgba(255,255,255,0.3)"
      />
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + chartHeight}
        stroke="rgba(255,255,255,0.3)"
      />

      {/* CPU Supply Line */}
      <motion.line
        x1={toSvgX(cpuSupply)}
        y1={padding.top}
        x2={toSvgX(cpuSupply)}
        y2={padding.top + chartHeight}
        stroke="#22c55e"
        strokeWidth={bottleneck === 'cpu' ? 3 : 2}
        strokeDasharray={bottleneck === 'cpu' ? '0' : '6,4'}
        initial={{ x1: toSvgX(100), x2: toSvgX(100) }}
        animate={{ x1: toSvgX(cpuSupply), x2: toSvgX(cpuSupply) }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />
      <motion.text
        x={toSvgX(cpuSupply)}
        y={padding.top - 8}
        fill="#22c55e"
        fontSize={10}
        textAnchor="middle"
        fontWeight={bottleneck === 'cpu' ? 'bold' : 'normal'}
        initial={{ x: toSvgX(100) }}
        animate={{ x: toSvgX(cpuSupply) }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        CPU
      </motion.text>

      {/* IO Supply Line */}
      <motion.line
        x1={toSvgX(ioSupply)}
        y1={padding.top}
        x2={toSvgX(ioSupply)}
        y2={padding.top + chartHeight}
        stroke="#f59e0b"
        strokeWidth={bottleneck === 'io' ? 3 : 2}
        strokeDasharray={bottleneck === 'io' ? '0' : '6,4'}
        initial={{ x1: toSvgX(150), x2: toSvgX(150) }}
        animate={{ x1: toSvgX(ioSupply), x2: toSvgX(ioSupply) }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />
      <motion.text
        x={toSvgX(ioSupply)}
        y={padding.top - 8}
        fill="#f59e0b"
        fontSize={10}
        textAnchor="middle"
        fontWeight={bottleneck === 'io' ? 'bold' : 'normal'}
        initial={{ x: toSvgX(150) }}
        animate={{ x: toSvgX(ioSupply) }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        IO
      </motion.text>

      {/* Demand curve */}
      <motion.path
        d={demandPath}
        fill="none"
        stroke="#60a5fa"
        strokeWidth={2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <text
        x={toSvgX(demandCurve[3]?.quantity || 50) + 5}
        y={toSvgY(demandCurve[3]?.price || 50) - 5}
        fill="#60a5fa"
        fontSize={10}
      >
        Demand
      </text>

      {/* Bottleneck intersection point */}
      <motion.circle
        r={8}
        fill="#ef4444"
        stroke="white"
        strokeWidth={2}
        initial={{
          cx: toSvgX(effectiveCapacity),
          cy: toSvgY(bottleneck === 'cpu' ? cpuIntersection.price : ioIntersection.price),
        }}
        animate={{
          cx: toSvgX(effectiveCapacity),
          cy: toSvgY(bottleneck === 'cpu' ? cpuIntersection.price : ioIntersection.price),
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />

      {/* Bottleneck indicator lines */}
      <motion.line
        x1={padding.left}
        x2={toSvgX(effectiveCapacity)}
        stroke="#ef4444"
        strokeWidth={1}
        strokeDasharray="3,3"
        initial={{
          y1: toSvgY(bottleneck === 'cpu' ? cpuIntersection.price : ioIntersection.price),
          y2: toSvgY(bottleneck === 'cpu' ? cpuIntersection.price : ioIntersection.price),
        }}
        animate={{
          y1: toSvgY(bottleneck === 'cpu' ? cpuIntersection.price : ioIntersection.price),
          y2: toSvgY(bottleneck === 'cpu' ? cpuIntersection.price : ioIntersection.price),
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />

      {/* Price label at intersection */}
      <motion.text
        x={padding.left + 5}
        fill="#ef4444"
        fontSize={10}
        fontWeight="bold"
        initial={{ y: toSvgY(cpuIntersection.price) - 5 }}
        animate={{
          y: toSvgY(bottleneck === 'cpu' ? cpuIntersection.price : ioIntersection.price) - 5,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {Math.round(bottleneck === 'cpu' ? cpuIntersection.price : ioIntersection.price)} gwei
      </motion.text>

      {/* Axis labels */}
      <text
        x={padding.left + chartWidth / 2}
        y={height - 8}
        fill="rgba(255,255,255,0.5)"
        fontSize={11}
        textAnchor="middle"
      >
        Quantity (TPS)
      </text>
      <text
        x={15}
        y={padding.top + chartHeight / 2}
        fill="rgba(255,255,255,0.5)"
        fontSize={11}
        textAnchor="middle"
        transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
      >
        Price (gwei)
      </text>

      {/* Effective capacity label */}
      <motion.text
        x={toSvgX(effectiveCapacity)}
        y={padding.top + chartHeight + 15}
        fill="#ef4444"
        fontSize={9}
        textAnchor="middle"
        fontWeight="bold"
        initial={{ x: toSvgX(100) }}
        animate={{ x: toSvgX(effectiveCapacity) }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {Math.round(effectiveCapacity)} TPS
      </motion.text>
    </svg>
  );
}

export function BottleneckSlide() {
  const [txMix, setTxMix] = useState(0.5);
  const [demandLevel, setDemandLevel] = useState(0.5);

  const bottleneck = useMemo(() => {
    const cpuSupply = 100 + txMix * 60;
    const ioSupply = 150 - txMix * 80;
    return cpuSupply < ioSupply ? 'CPU' : 'IO';
  }, [txMix]);

  const effectiveCapacity = useMemo(() => {
    const cpuSupply = 100 + txMix * 60;
    const ioSupply = 150 - txMix * 80;
    return Math.round(Math.min(cpuSupply, ioSupply));
  }, [txMix]);

  return (
    <SlideContainer id="bottleneck-problem" variant="default">
      <SlideHeader
        section="Fee Markets"
        title="The Bottleneck Problem"
        subtitle="When mixing transaction types, one resource becomes the limiting factor"
      />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Controls */}
        <AnimatedText delay={0.2}>
          <div className="space-y-4">
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">Transaction Mix</h3>
              <p className="text-sm text-gray-400 mb-4">
                Adjust the mix of transaction types in the mempool:
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-400">CPU-heavy</span>
                    <span className="text-amber-400">IO-heavy</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={txMix}
                    onChange={(e) => setTxMix(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>DEX swaps, transfers</span>
                    <span>Rollup batches</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Demand Level</span>
                    <span className="text-white">
                      {demandLevel < 0.4 ? 'Low' : demandLevel < 0.7 ? 'Medium' : 'High'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.05"
                    value={demandLevel}
                    onChange={(e) => setDemandLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">Current Bottleneck</h3>
              <div className="flex items-center gap-4">
                <div
                  className={`px-4 py-2 rounded-lg border-2 ${
                    bottleneck === 'CPU'
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                >
                  CPU
                </div>
                <div
                  className={`px-4 py-2 rounded-lg border-2 ${
                    bottleneck === 'IO'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                >
                  IO
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Effective throughput: <span className="text-white font-bold">{effectiveCapacity} TPS</span>
              </p>
            </div>

            <div className="interactive-panel bg-red-500/5 border-red-500/20">
              <p className="text-sm text-gray-300">
                <span className="text-red-400 font-semibold">The Problem:</span> Whichever resource fills up first
                limits the entire block, even if other resources have capacity remaining.
              </p>
            </div>
          </div>
        </AnimatedText>

        {/* Right: Chart */}
        <AnimatedText delay={0.4}>
          <div className="interactive-panel">
            <h3 className="text-lg font-semibold text-white mb-4">
              Multiple Supply Curves
            </h3>
            <div className="bg-black/20 rounded-lg p-2">
              <MultiResourceChart txMix={txMix} demandLevel={demandLevel} />
            </div>
            <div className="mt-3 flex justify-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-green-500" />
                <span className="text-gray-400">CPU limit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-amber-500" />
                <span className="text-gray-400">IO limit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-400">Bottleneck</span>
              </div>
            </div>
          </div>
        </AnimatedText>
      </div>

      <AnimatedText delay={0.6} className="mt-8">
        <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">The Solution: Multidimensional Fee Markets</p>
              <p>
                Instead of one gas price, have separate prices for each resource. This way,
                IO-heavy transactions pay more for IO but less for CPU, and vice versa.
                The result: better resource utilization and more efficient block packing.
              </p>
            </div>
          </div>
        </div>
      </AnimatedText>
    </SlideContainer>
  );
}
