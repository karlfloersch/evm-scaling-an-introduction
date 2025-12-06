'use client';

import { useState, useMemo, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// Transaction types with their resource consumption
const transactionTypes = [
  {
    id: 'eth-transfer',
    name: 'ETH Transfer',
    cpu: 0.9,
    io: 0.1,
    color: '#627EEA',
    baseTps: 45,
    maxPrice: 80,
  },
  {
    id: 'dex-swap',
    name: 'DEX Swap',
    cpu: 0.65,
    io: 0.35,
    color: '#FF007A',
    baseTps: 35,
    maxPrice: 100,
  },
  {
    id: 'rollup-batch',
    name: 'Rollup Batch',
    cpu: 0.15,
    io: 0.85,
    color: '#28A0F0',
    baseTps: 15,
    maxPrice: 120,
  },
  {
    id: 'nft-mint',
    name: 'NFT Mint',
    cpu: 0.50,
    io: 0.50,
    color: '#9945FF',
    baseTps: 20,
    maxPrice: 70,
  },
];

// Price surface mesh component
function PriceSurface({
  mode,
  cpuPrice,
  ioPrice,
  unifiedPrice,
  maxPrice,
}: {
  mode: 'single' | 'multi';
  cpuPrice: number;
  ioPrice: number;
  unifiedPrice: number;
  maxPrice: number;
}) {
  const geometry = useMemo(() => {
    const resolution = 20;
    const geo = new THREE.PlaneGeometry(2, 2, resolution, resolution);
    const positions = geo.attributes.position;
    const colors: number[] = [];

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      // Map from -1,1 to 0,1 for cpu/io
      const cpu = (x + 1) / 2;
      const io = (y + 1) / 2;

      // Calculate price (z height)
      let price: number;
      if (mode === 'single') {
        price = unifiedPrice;
      } else {
        price = cpu * cpuPrice + io * ioPrice;
      }

      // Normalize price to height (0-1.5 range)
      const normalizedPrice = (price / maxPrice) * 1.5;
      positions.setZ(i, normalizedPrice);

      // Color based on price
      if (mode === 'single') {
        colors.push(0.9, 0.3, 0.3); // Red
      } else {
        // Gradient from green (low) to yellow (high)
        const t = price / maxPrice;
        colors.push(0.2 + t * 0.7, 0.8 - t * 0.3, 0.2);
      }
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [mode, cpuPrice, ioPrice, unifiedPrice, maxPrice]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Transaction marker sphere
function TransactionMarker({
  tx,
  cpuPrice,
  ioPrice,
  unifiedPrice,
  maxPrice,
  mode,
}: {
  tx: typeof transactionTypes[0];
  cpuPrice: number;
  ioPrice: number;
  unifiedPrice: number;
  maxPrice: number;
  mode: 'single' | 'multi';
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate position
  const x = tx.cpu * 2 - 1;
  const z = tx.io * 2 - 1;
  const price = mode === 'single' ? unifiedPrice : tx.cpu * cpuPrice + tx.io * ioPrice;
  const y = (price / maxPrice) * 1.5;

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = y + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <group>
      {/* Vertical line from base to marker */}
      <Line
        points={[[x, 0, z], [x, y, z]]}
        color={tx.color}
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.03}
      />
      {/* Base position marker */}
      <mesh position={[x, 0.01, z]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color={tx.color} transparent opacity={0.5} />
      </mesh>
      {/* Main marker sphere */}
      <mesh ref={meshRef} position={[x, y, z]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={tx.color} emissive={tx.color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Grid on base plane
function BaseGrid() {
  const lines = useMemo(() => {
    const result: [number, number, number][][] = [];
    for (let i = -1; i <= 1; i += 0.25) {
      result.push([[-1, 0, i], [1, 0, i]]);
      result.push([[i, 0, -1], [i, 0, 1]]);
    }
    return result;
  }, []);

  return (
    <group>
      {lines.map((points, i) => (
        <Line key={i} points={points} color="#ffffff" lineWidth={0.5} transparent opacity={0.15} />
      ))}
    </group>
  );
}

// Axes with labels
function Axes() {
  return (
    <group>
      {/* CPU axis (X) - Green */}
      <Line points={[[-1, 0, -1], [1.2, 0, -1]]} color="#22c55e" lineWidth={2} />
      <Html position={[1.3, 0, -1]} center>
        <span className="text-green-500 font-bold text-xs whitespace-nowrap">CPU</span>
      </Html>

      {/* IO axis (Z) - Amber */}
      <Line points={[[-1, 0, -1], [-1, 0, 1.2]]} color="#f59e0b" lineWidth={2} />
      <Html position={[-1, 0, 1.3]} center>
        <span className="text-amber-500 font-bold text-xs whitespace-nowrap">IO</span>
      </Html>

      {/* Price axis (Y) - Blue */}
      <Line points={[[-1, 0, -1], [-1, 1.7, -1]]} color="#60a5fa" lineWidth={2} />
      <Html position={[-1, 1.8, -1]} center>
        <span className="text-blue-400 font-bold text-xs whitespace-nowrap">Price</span>
      </Html>
    </group>
  );
}

// Main 3D scene component
function FeeMarket3DScene({
  mode,
  cpuPrice,
  ioPrice,
  unifiedPrice,
}: {
  mode: 'single' | 'multi';
  cpuPrice: number;
  ioPrice: number;
  unifiedPrice: number;
}) {
  const maxPrice = 150;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 3, -5]} intensity={0.5} />

      <BaseGrid />
      <Axes />

      <PriceSurface
        mode={mode}
        cpuPrice={cpuPrice}
        ioPrice={ioPrice}
        unifiedPrice={unifiedPrice}
        maxPrice={maxPrice}
      />

      {transactionTypes.map((tx) => (
        <TransactionMarker
          key={tx.id}
          tx={tx}
          cpuPrice={cpuPrice}
          ioPrice={ioPrice}
          unifiedPrice={unifiedPrice}
          maxPrice={maxPrice}
          mode={mode}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Wrapper component with Canvas
function FeeMarket3D({
  mode,
  cpuPrice,
  ioPrice,
  unifiedPrice,
}: {
  mode: 'single' | 'multi';
  cpuPrice: number;
  ioPrice: number;
  unifiedPrice: number;
}) {
  return (
    <div className="w-full h-[300px] relative">
      <Canvas
        camera={{ position: [2.5, 2, 2.5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <FeeMarket3DScene
            mode={mode}
            cpuPrice={cpuPrice}
            ioPrice={ioPrice}
            unifiedPrice={unifiedPrice}
          />
        </Suspense>
      </Canvas>
      {/* Overlay labels */}
      <div className="absolute top-2 left-0 right-0 text-center pointer-events-none">
        <div className="text-white font-bold text-sm">
          {mode === 'single' ? 'Single EIP-1559' : 'Multi-Dimensional Pricing'}
        </div>
        <div className="text-gray-400 text-xs">
          {mode === 'single' ? 'Flat price plane' : 'Tilted price plane'}
        </div>
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none">
        Drag to rotate
      </div>
    </div>
  );
}

// Price comparison bar chart
function PriceComparison({
  cpuPrice,
  ioPrice,
  unifiedPrice,
}: {
  cpuPrice: number;
  ioPrice: number;
  unifiedPrice: number;
}) {
  const maxPrice = 150;

  return (
    <div className="space-y-3">
      {transactionTypes.map((tx) => {
        const singlePrice = unifiedPrice;
        const multiPrice = tx.cpu * cpuPrice + tx.io * ioPrice;
        const savings = singlePrice - multiPrice;
        const savingsPercent = ((savings / singlePrice) * 100).toFixed(0);

        return (
          <div key={tx.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.color }} />
                <span className="text-white">{tx.name}</span>
              </div>
              <span className={savings > 0 ? 'text-green-400' : 'text-red-400'}>
                {savings > 0 ? `−${savingsPercent}%` : `+${Math.abs(Number(savingsPercent))}%`}
              </span>
            </div>
            <div className="flex gap-1 h-4">
              {/* Single price bar */}
              <div className="flex-1 bg-white/10 rounded overflow-hidden relative">
                <motion.div
                  className="h-full bg-red-500/60"
                  initial={{ width: 0 }}
                  animate={{ width: `${(singlePrice / maxPrice) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
                <span className="absolute right-1 top-0 text-[9px] text-white/70">
                  {Math.round(singlePrice)}g
                </span>
              </div>
              {/* Multi price bar */}
              <div className="flex-1 bg-white/10 rounded overflow-hidden relative">
                <motion.div
                  className="h-full rounded"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${tx.cpu * 100}%, #f59e0b ${tx.cpu * 100}%)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(multiPrice / maxPrice) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                <span className="absolute right-1 top-0 text-[9px] text-white/70">
                  {Math.round(multiPrice)}g
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex gap-4 text-[10px] text-gray-400 mt-2 justify-center">
        <span className="flex items-center gap-1">
          <div className="w-3 h-2 bg-red-500/60 rounded" /> Single
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-2 bg-gradient-to-r from-green-500 to-amber-500 rounded" /> Multi
        </span>
      </div>
    </div>
  );
}

export function MultidimensionalFeesSlide() {
  const [ioScarcity, setIoScarcity] = useState(0.6);

  // Calculate prices based on scarcity
  const { cpuPrice, ioPrice, unifiedPrice } = useMemo(() => {
    const baseCpuPrice = 30;
    const baseIoPrice = 30;

    // IO price rises with scarcity, CPU price stays stable or drops
    const ioPrice = baseIoPrice + ioScarcity * 90;
    const cpuPrice = baseCpuPrice + (1 - ioScarcity) * 15;

    // Unified price is a weighted blend
    const unifiedPrice = 0.35 * cpuPrice + 0.65 * ioPrice;

    return { cpuPrice, ioPrice, unifiedPrice };
  }, [ioScarcity]);

  // Calculate TPS for both pricing modes using demand curves
  const { singleTps, multiTps, tpsGain, txBreakdown } = useMemo(() => {
    // Demand curve: at price p, demand = baseTps * max(0, 1 - p/maxPrice)
    const calculateDemand = (baseTps: number, maxPrice: number, price: number) => {
      return baseTps * Math.max(0, 1 - price / maxPrice);
    };

    const breakdown = transactionTypes.map((tx) => {
      const singlePrice = unifiedPrice;
      const multiPrice = tx.cpu * cpuPrice + tx.io * ioPrice;

      const singleDemand = calculateDemand(tx.baseTps, tx.maxPrice, singlePrice);
      const multiDemand = calculateDemand(tx.baseTps, tx.maxPrice, multiPrice);

      return {
        ...tx,
        singleTps: singleDemand,
        multiTps: multiDemand,
        singlePrice,
        multiPrice,
      };
    });

    const singleTotal = breakdown.reduce((sum, tx) => sum + tx.singleTps, 0);
    const multiTotal = breakdown.reduce((sum, tx) => sum + tx.multiTps, 0);
    const gain = singleTotal > 0 ? ((multiTotal - singleTotal) / singleTotal) * 100 : 0;

    return { singleTps: singleTotal, multiTps: multiTotal, tpsGain: gain, txBreakdown: breakdown };
  }, [cpuPrice, ioPrice, unifiedPrice]);

  return (
    <SlideContainer id="multidimensional-fees" variant="default">
      <SlideHeader
        section="Fee Markets"
        title="3D View: Multi-Dimensional Pricing"
        subtitle="Visualize how separate prices for CPU and IO create a tilted price surface"
      />

      <div className="space-y-6">
        {/* Scenario control */}
        <AnimatedText delay={0.2}>
          <div className="interactive-panel">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">IO Scarcity</h3>
              <span className="text-sm px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                {ioScarcity < 0.3 ? 'Balanced' : ioScarcity < 0.6 ? 'IO Scarce' : 'IO Crisis'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={ioScarcity}
              onChange={(e) => setIoScarcity(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Resources balanced</span>
              <span>IO extremely scarce (rollup surge)</span>
            </div>
          </div>
        </AnimatedText>

        {/* 3D Visualizations side by side */}
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatedText delay={0.3}>
            <div className="interactive-panel border-red-500/20 bg-red-500/5 p-2">
              <FeeMarket3D
                mode="single"
                cpuPrice={cpuPrice}
                ioPrice={ioPrice}
                unifiedPrice={unifiedPrice}
              />
              <div className="text-center mt-3 space-y-2">
                <div>
                  <span className="text-red-400 font-bold text-lg">{Math.round(unifiedPrice)} gwei</span>
                  <span className="text-gray-500 text-sm ml-2">for everyone</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-gray-400 text-sm">Total Throughput: </span>
                  <span className="text-red-400 font-bold text-xl">{singleTps.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm ml-1">TPS</span>
                </div>
              </div>
            </div>
          </AnimatedText>

          <AnimatedText delay={0.4}>
            <div className="interactive-panel border-green-500/20 bg-green-500/5 p-2">
              <FeeMarket3D
                mode="multi"
                cpuPrice={cpuPrice}
                ioPrice={ioPrice}
                unifiedPrice={unifiedPrice}
              />
              <div className="text-center mt-3 space-y-2">
                <div className="space-x-4">
                  <span>
                    <span className="text-green-400 font-bold">{Math.round(cpuPrice)}g</span>
                    <span className="text-gray-500 text-sm ml-1">CPU</span>
                  </span>
                  <span>
                    <span className="text-amber-400 font-bold">{Math.round(ioPrice)}g</span>
                    <span className="text-gray-500 text-sm ml-1">IO</span>
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-gray-400 text-sm">Total Throughput: </span>
                  <span className="text-green-400 font-bold text-xl">{multiTps.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm ml-1">TPS</span>
                  {tpsGain > 0 && (
                    <span className="ml-2 text-green-400 text-sm font-medium">
                      (+{tpsGain.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </AnimatedText>
        </div>

        {/* Price comparison */}
        <AnimatedText delay={0.5}>
          <div className="interactive-panel">
            <h3 className="text-lg font-semibold text-white mb-3">Effective Price per Transaction Type</h3>
            <PriceComparison cpuPrice={cpuPrice} ioPrice={ioPrice} unifiedPrice={unifiedPrice} />
          </div>
        </AnimatedText>

        {/* Key insight */}
        <AnimatedText delay={0.6}>
          <div className="interactive-panel bg-primary-500/5 border-primary-500/20">
            <div className="flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-white mb-1">The 3D Insight</p>
                <p>
                  <strong>Single EIP-1559:</strong> A flat price plane. Every transaction pays the same regardless of
                  resource mix. When IO is scarce, CPU-heavy transactions overpay.
                </p>
                <p className="mt-2">
                  <strong>Multi-dimensional:</strong> A tilted price plane. Price = CPU×cpu_price + IO×io_price.
                  Transactions only pay for what they actually consume. The colored dots show where each tx type
                  lands on the price surface.
                </p>
              </div>
            </div>
          </div>
        </AnimatedText>
      </div>
    </SlideContainer>
  );
}
