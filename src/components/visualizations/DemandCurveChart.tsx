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

  // Scales
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...demandCurve.map((d) => d.price))],
        range: [0, xMax],
        nice: true,
      }),
    [demandCurve, xMax]
  );

  // Calculate fixed Y-axis max based on transaction type's max possible demand
  // This keeps the axis stable while the curve moves
  const maxPossibleDemand = useMemo(() => {
    // Max volatility factor is (1 + demandVolatility)
    // At price 0, demand is highest
    const maxVolatilityFactor = 1 + transactionType.demandVolatility;
    const baseDemandAtZeroPrice = transactionType.baseDemand * maxVolatilityFactor;
    return baseDemandAtZeroPrice * 1.2; // 20% padding
  }, [transactionType]);

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxPossibleDemand],
        range: [yMax, 0],
        nice: true,
      }),
    [maxPossibleDemand, yMax]
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

        {/* Area under curve */}
        <AreaClosed<DemandPoint>
          data={demandCurve}
          x={(d) => xScale(d.price)}
          y={(d) => yScale(d.quantity)}
          yScale={yScale}
          curve={curveMonotoneX}
          fill={transactionType.color}
          fillOpacity={0.2}
        />

        {/* Demand curve line */}
        <LinePath<DemandPoint>
          data={demandCurve}
          x={(d) => xScale(d.price)}
          y={(d) => yScale(d.quantity)}
          stroke={transactionType.color}
          strokeWidth={2}
          curve={curveMonotoneX}
        />

        {/* Current price indicator */}
        {currentPrice !== undefined && currentDemand !== undefined && (
          <>
            {/* Vertical line at current price */}
            <line
              x1={xScale(currentPrice)}
              y1={0}
              x2={xScale(currentPrice)}
              y2={yMax}
              stroke="white"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.5}
            />
            {/* Horizontal line at current demand */}
            <line
              x1={0}
              y1={yScale(currentDemand)}
              x2={xScale(currentPrice)}
              y2={yScale(currentDemand)}
              stroke="white"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.5}
            />
            {/* Point at intersection */}
            <circle
              cx={xScale(currentPrice)}
              cy={yScale(currentDemand)}
              r={6}
              fill="white"
              stroke={transactionType.color}
              strokeWidth={2}
            />
            {/* Label */}
            <text
              x={xScale(currentPrice) + 10}
              y={yScale(currentDemand) - 10}
              fill="white"
              fontSize={12}
            >
              {currentDemand.toFixed(1)} TPS
            </text>
          </>
        )}

        {/* Axes */}
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
              label="Price (gwei)"
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
              label="Demand (TPS)"
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
