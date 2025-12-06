'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

// Simple demand curve visualization
function DemandCurveVisual({
  demandLevel,
  priceLevel,
}: {
  demandLevel: number;
  priceLevel: number;
}) {
  const width = 350;
  const height = 250;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate demand curve points
  const demandCurve = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const basePrice = 10 + demandLevel * 90; // Higher demand = higher prices
    const steepness = 1.5 + demandLevel;

    for (let q = 0; q <= 1; q += 0.02) {
      const price = basePrice * Math.exp(-steepness * q);
      points.push({ x: q, y: price });
    }
    return points;
  }, [demandLevel]);

  const maxPrice = 120;

  // Convert data coordinates to SVG coordinates
  const toSvgX = (q: number) => padding.left + q * chartWidth;
  const toSvgY = (p: number) => padding.top + chartHeight - (Math.min(p, maxPrice) / maxPrice) * chartHeight;

  // Build demand curve path
  const demandPath = demandCurve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x)} ${toSvgY(pt.y)}`)
    .join(' ');

  // Calculate quantity at given price
  const quantityAtPrice = useMemo(() => {
    const basePrice = 10 + demandLevel * 90;
    const steepness = 1.5 + demandLevel;
    // price = basePrice * e^(-steepness * q)
    // q = -ln(price / basePrice) / steepness
    const actualPrice = priceLevel;
    if (actualPrice >= basePrice) return 0;
    const q = -Math.log(actualPrice / basePrice) / steepness;
    return Math.max(0, Math.min(1, q));
  }, [demandLevel, priceLevel]);

  return (
    <svg width={width} height={height} className="w-full h-auto">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((q) => (
        <line
          key={`grid-v-${q}`}
          x1={toSvgX(q)}
          y1={padding.top}
          x2={toSvgX(q)}
          y2={padding.top + chartHeight}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="2,2"
        />
      ))}
      {[30, 60, 90].map((p) => (
        <line
          key={`grid-h-${p}`}
          x1={padding.left}
          y1={toSvgY(p)}
          x2={padding.left + chartWidth}
          y2={toSvgY(p)}
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
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={2}
      />
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + chartHeight}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={2}
      />

      {/* Demand curve */}
      <motion.path
        d={demandPath}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Area under curve up to quantity */}
      <motion.path
        d={`${demandPath.split(' ').slice(0, Math.floor(quantityAtPrice * 50) * 3 + 3).join(' ')} L ${toSvgX(quantityAtPrice)} ${toSvgY(0)} L ${toSvgX(0)} ${toSvgY(0)} Z`}
        fill="rgba(245, 158, 11, 0.15)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Horizontal price line */}
      <motion.line
        x1={padding.left}
        x2={toSvgX(quantityAtPrice)}
        y1={toSvgY(priceLevel)}
        y2={toSvgY(priceLevel)}
        stroke="#ef4444"
        strokeWidth={2}
        strokeDasharray="6,3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Vertical quantity line */}
      <motion.line
        x1={toSvgX(quantityAtPrice)}
        y1={toSvgY(priceLevel)}
        x2={toSvgX(quantityAtPrice)}
        y2={toSvgY(0)}
        stroke="#22c55e"
        strokeWidth={2}
        strokeDasharray="6,3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Intersection point */}
      <motion.circle
        cx={toSvgX(quantityAtPrice)}
        cy={toSvgY(priceLevel)}
        r={8}
        fill="#ef4444"
        stroke="white"
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
      />

      {/* Labels */}
      <text
        x={padding.left + chartWidth / 2}
        y={height - 10}
        fill="rgba(255,255,255,0.7)"
        fontSize={12}
        textAnchor="middle"
      >
        Quantity (Block Space Used)
      </text>
      <text
        x={15}
        y={padding.top + chartHeight / 2}
        fill="rgba(255,255,255,0.7)"
        fontSize={12}
        textAnchor="middle"
        transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
      >
        Price (gwei)
      </text>

      {/* Value labels */}
      <text x={padding.left - 8} y={toSvgY(30) + 4} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="end">30</text>
      <text x={padding.left - 8} y={toSvgY(60) + 4} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="end">60</text>
      <text x={padding.left - 8} y={toSvgY(90) + 4} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="end">90</text>

      <text x={toSvgX(0.25)} y={padding.top + chartHeight + 15} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="middle">25%</text>
      <text x={toSvgX(0.5)} y={padding.top + chartHeight + 15} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="middle">50%</text>
      <text x={toSvgX(0.75)} y={padding.top + chartHeight + 15} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="middle">75%</text>
      <text x={toSvgX(1)} y={padding.top + chartHeight + 15} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="middle">100%</text>

      {/* Demand curve label */}
      <text x={toSvgX(0.15)} y={toSvgY(demandCurve[7]?.y || 50) - 10} fill="#f59e0b" fontSize={11} fontWeight="bold">
        Demand
      </text>

      {/* Current price label */}
      <text x={padding.left + 5} y={toSvgY(priceLevel) - 5} fill="#ef4444" fontSize={10} fontWeight="bold">
        Price: {priceLevel} gwei
      </text>

      {/* Quantity label */}
      <text x={toSvgX(quantityAtPrice) + 5} y={toSvgY(0) - 5} fill="#22c55e" fontSize={10} fontWeight="bold">
        {(quantityAtPrice * 100).toFixed(0)}% filled
      </text>
    </svg>
  );
}

export function DemandCurvesIntroSlide() {
  const [demandLevel, setDemandLevel] = useState(0.5);
  const [priceLevel, setPriceLevel] = useState(40);

  return (
    <SlideContainer id="demand-curves-intro" variant="default">
      <SlideHeader
        section="Fee Markets"
        title="Understanding Demand Curves"
        subtitle="How price affects the quantity of transactions that want block space"
      />

      <div className="grid lg:grid-cols-2 gap-8 mt-6">
        {/* Left side: Explanation */}
        <div className="space-y-5">
          <AnimatedText delay={0.1}>
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">The Core Insight</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                When block space prices are <span className="text-green-400 font-medium">low</span>,
                many transactions want to be included. When prices are <span className="text-red-400 font-medium">high</span>,
                only the most valuable transactions will pay.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mt-3">
                This creates a <span className="text-amber-400 font-medium">downward-sloping demand curve</span>:
                as price increases, quantity demanded decreases.
              </p>
            </div>
          </AnimatedText>

          <AnimatedText delay={0.2}>
            <div className="interactive-panel">
              <h3 className="text-lg font-semibold text-white mb-3">Why Demand Fluctuates</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><span className="text-white">NFT drops</span> create sudden spikes in demand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><span className="text-white">Market volatility</span> drives DeFi arbitrage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><span className="text-white">Time of day</span> affects user activity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><span className="text-white">Network events</span> (airdrops, launches) spike demand</span>
                </li>
              </ul>
            </div>
          </AnimatedText>

          <AnimatedText delay={0.3}>
            <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="text-sm">
                  <p className="text-gray-300 font-medium mb-1">The Challenge</p>
                  <p className="text-gray-400">
                    The blockchain needs to find the <span className="text-white font-medium">right price</span> that
                    fills blocks efficiently without creating long queues. Too low = congestion.
                    Too high = wasted capacity.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedText>
        </div>

        {/* Right side: Interactive chart */}
        <AnimatedText delay={0.2}>
          <div className="interactive-panel h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Interactive Demand Curve</h3>

            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <DemandCurveVisual demandLevel={demandLevel} priceLevel={priceLevel} />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Demand Level</span>
                  <span className="text-amber-400 font-medium">
                    {demandLevel < 0.4 ? 'Low' : demandLevel < 0.7 ? 'Medium' : 'High'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={demandLevel}
                  onChange={(e) => setDemandLevel(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Shift the entire demand curve up or down
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Current Price</span>
                  <span className="text-red-400 font-medium">{priceLevel} gwei</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={priceLevel}
                  onChange={(e) => setPriceLevel(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  See how price affects block utilization
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-black/20 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-gray-400">Demand Curve</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-red-500" style={{ width: 12 }} />
                  <span className="text-gray-400">Price Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                  <span className="text-gray-400">Equilibrium</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedText>
      </div>
    </SlideContainer>
  );
}
