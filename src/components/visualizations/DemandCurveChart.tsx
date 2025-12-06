'use client';

import { useMemo } from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { curveMonotoneX } from 'd3-shape';
import { ParentSize } from '@visx/responsive';
import type { TransactionType, DemandPoint } from '@/data/transactions/types';
import { generateDemandCurve } from '@/data/transactions/types';

interface DemandCurveChartProps {
  transactionType: TransactionType;
  timestamp?: number;
  currentPrice?: number;
  width?: number;
  height?: number;
  showAxis?: boolean;
  showGrid?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const defaultMargin = { top: 20, right: 20, bottom: 50, left: 60 };

function DemandCurveChartInner({
  transactionType,
  timestamp = 0,
  currentPrice,
  width,
  height,
  showAxis = true,
  showGrid = true,
  margin = defaultMargin,
}: DemandCurveChartProps & { width: number; height: number }) {
  const demandCurve = useMemo(
    () => generateDemandCurve(transactionType, timestamp),
    [transactionType, timestamp]
  );

  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Calculate fixed X-axis max based on transaction type properties
  // This keeps the axis stable during volatility animations
  const maxPossibleDemand = useMemo(() => {
    // Calculate max demand at lowest price (10 gwei) with max volatility
    const minPrice = 10;
    const referencePrice = 50;
    const maxVolatilityFactor = 1 + transactionType.demandVolatility;
    const elasticityPower = 0.5 + transactionType.priceElasticity * 1.5;
    const maxDemand = transactionType.baseDemand * maxVolatilityFactor * Math.pow(referencePrice / minPrice, elasticityPower);
    return maxDemand * 1.1; // 10% padding
  }, [transactionType]);

  const maxPrice = useMemo(
    () => Math.max(...demandCurve.map((d) => d.price)),
    [demandCurve]
  );

  // Scales - Standard economics convention: X = Quantity, Y = Price
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxPossibleDemand],
        range: [0, xMax],
        nice: true,
      }),
    [maxPossibleDemand, xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxPrice],
        range: [yMax, 0],
        nice: true,
      }),
    [maxPrice, yMax]
  );

  // Current demand at current price
  const currentDemand = useMemo(() => {
    if (currentPrice === undefined) return undefined;
    // Interpolate
    for (let i = 0; i < demandCurve.length - 1; i++) {
      if (currentPrice >= demandCurve[i].price && currentPrice <= demandCurve[i + 1].price) {
        const t = (currentPrice - demandCurve[i].price) / (demandCurve[i + 1].price - demandCurve[i].price);
        return demandCurve[i].quantity * (1 - t) + demandCurve[i + 1].quantity * t;
      }
    }
    return demandCurve[demandCurve.length - 1].quantity;
  }, [demandCurve, currentPrice]);

  if (width < 100 || height < 100) return null;

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Grid */}
        {showGrid && (
          <>
            <GridRows
              scale={yScale}
              width={xMax}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="2,3"
            />
            <GridColumns
              scale={xScale}
              height={yMax}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="2,3"
            />
          </>
        )}

        {/* Area under curve - X = Quantity, Y = Price */}
        <AreaClosed<DemandPoint>
          data={demandCurve}
          x={(d) => xScale(d.quantity)}
          y={(d) => yScale(d.price)}
          yScale={yScale}
          curve={curveMonotoneX}
          fill={transactionType.color}
          fillOpacity={0.2}
        />

        {/* Demand curve line - X = Quantity, Y = Price */}
        <LinePath<DemandPoint>
          data={demandCurve}
          x={(d) => xScale(d.quantity)}
          y={(d) => yScale(d.price)}
          stroke={transactionType.color}
          strokeWidth={2}
          curve={curveMonotoneX}
        />

        {/* Current price indicator - X = Quantity, Y = Price */}
        {currentPrice !== undefined && currentDemand !== undefined && (
          <>
            {/* Horizontal line at current price (from Y-axis to intersection) */}
            <line
              x1={0}
              y1={yScale(currentPrice)}
              x2={xScale(currentDemand)}
              y2={yScale(currentPrice)}
              stroke="white"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.5}
            />
            {/* Vertical line at current demand (from X-axis to intersection) */}
            <line
              x1={xScale(currentDemand)}
              y1={yMax}
              x2={xScale(currentDemand)}
              y2={yScale(currentPrice)}
              stroke="white"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.5}
            />
            {/* Point at intersection */}
            <circle
              cx={xScale(currentDemand)}
              cy={yScale(currentPrice)}
              r={6}
              fill="white"
              stroke={transactionType.color}
              strokeWidth={2}
            />
            {/* Label */}
            <text
              x={xScale(currentDemand) + 10}
              y={yScale(currentPrice) - 10}
              fill="white"
              fontSize={12}
            >
              {currentDemand.toFixed(1)} TPS @ {currentPrice} gwei
            </text>
          </>
        )}

        {/* Axes - Standard economics convention: X = Quantity, Y = Price */}
        {showAxis && (
          <>
            <AxisBottom
              top={yMax}
              scale={xScale}
              stroke="white"
              tickStroke="white"
              tickLabelProps={() => ({
                fill: 'rgba(255,255,255,0.7)',
                fontSize: 11,
                textAnchor: 'middle',
              })}
              label="Quantity (TPS)"
              labelProps={{
                fill: 'rgba(255,255,255,0.7)',
                fontSize: 12,
                textAnchor: 'middle',
              }}
            />
            <AxisLeft
              scale={yScale}
              stroke="white"
              tickStroke="white"
              tickLabelProps={() => ({
                fill: 'rgba(255,255,255,0.7)',
                fontSize: 11,
                textAnchor: 'end',
                dx: -4,
                dy: 4,
              })}
              label="Price (gwei)"
              labelProps={{
                fill: 'rgba(255,255,255,0.7)',
                fontSize: 12,
                textAnchor: 'middle',
                transform: 'rotate(-90)',
              }}
            />
          </>
        )}
      </Group>
    </svg>
  );
}

export function DemandCurveChart(props: DemandCurveChartProps) {
  if (props.width && props.height) {
    return <DemandCurveChartInner {...props} width={props.width} height={props.height} />;
  }

  return (
    <ParentSize>
      {({ width, height }) => (
        <DemandCurveChartInner {...props} width={width} height={height} />
      )}
    </ParentSize>
  );
}
