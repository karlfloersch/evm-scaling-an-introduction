'use client';

import { useMemo } from 'react';
import { Group } from '@visx/group';
import { LinePath, Bar } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { curveMonotoneX } from 'd3-shape';
import { ParentSize } from '@visx/responsive';
import type { SimulationSnapshot } from '@/lib/simulation/engine';

interface ThroughputChartProps {
  snapshots: SimulationSnapshot[];
  metric?: 'tps' | 'gasUsed' | 'baseFee';
  color?: string;
  width?: number;
  height?: number;
  showAxis?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const defaultMargin = { top: 20, right: 20, bottom: 50, left: 60 };

const metricConfig = {
  tps: { label: 'TPS', format: (v: number) => v.toFixed(1) },
  gasUsed: { label: 'Gas Used', format: (v: number) => `${(v / 1e6).toFixed(1)}M` },
  baseFee: { label: 'Base Fee (gwei)', format: (v: number) => v.toFixed(1) },
};

function ThroughputChartInner({
  snapshots,
  metric = 'tps',
  color = '#4DABF7',
  width,
  height,
  showAxis = true,
  margin = defaultMargin,
}: ThroughputChartProps & { width: number; height: number }) {
  const config = metricConfig[metric];

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const getValue = (s: SimulationSnapshot) => {
    switch (metric) {
      case 'tps':
        return s.tps;
      case 'gasUsed':
        return s.gasUsed;
      case 'baseFee':
        return s.baseFee;
    }
  };

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...snapshots.map((s) => s.timestamp))],
        range: [0, xMax],
      }),
    [snapshots, xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...snapshots.map(getValue)) * 1.1],
        range: [yMax, 0],
        nice: true,
      }),
    [snapshots, yMax]
  );

  if (width < 100 || height < 100) return null;

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Grid */}
        <GridRows
          scale={yScale}
          width={xMax}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="2,3"
        />

        {/* Line */}
        <LinePath
          data={snapshots}
          x={(d) => xScale(d.timestamp)}
          y={(d) => yScale(getValue(d))}
          stroke={color}
          strokeWidth={2}
          curve={curveMonotoneX}
        />

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
              label="Time (seconds)"
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
              tickFormat={(v) => config.format(v as number)}
              tickLabelProps={() => ({
                fill: 'rgba(255,255,255,0.7)',
                fontSize: 11,
                textAnchor: 'end',
                dx: -4,
                dy: 4,
              })}
              label={config.label}
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

export function ThroughputChart(props: ThroughputChartProps) {
  if (props.width && props.height) {
    return <ThroughputChartInner {...props} width={props.width} height={props.height} />;
  }

  return (
    <ParentSize>
      {({ width, height }) => (
        <ThroughputChartInner {...props} width={width} height={height} />
      )}
    </ParentSize>
  );
}

/**
 * Multi-line chart for comparing multiple metrics or scenarios
 */
interface MultiLineChartProps {
  series: {
    id: string;
    label: string;
    data: { x: number; y: number }[];
    color: string;
  }[];
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

function MultiLineChartInner({
  series,
  xLabel = 'X',
  yLabel = 'Y',
  width,
  height,
  margin = defaultMargin,
}: MultiLineChartProps & { width: number; height: number }) {
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const allXValues = series.flatMap((s) => s.data.map((d) => d.x));
  const allYValues = series.flatMap((s) => s.data.map((d) => d.y));

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [Math.min(...allXValues), Math.max(...allXValues)],
        range: [0, xMax],
      }),
    [allXValues, xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...allYValues) * 1.1],
        range: [yMax, 0],
        nice: true,
      }),
    [allYValues, yMax]
  );

  if (width < 100 || height < 100) return null;

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={yScale}
          width={xMax}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="2,3"
        />

        {series.map((s) => (
          <LinePath
            key={s.id}
            data={s.data}
            x={(d) => xScale(d.x)}
            y={(d) => yScale(d.y)}
            stroke={s.color}
            strokeWidth={2}
            curve={curveMonotoneX}
          />
        ))}

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
          label={xLabel}
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
          label={yLabel}
          labelProps={{
            fill: 'rgba(255,255,255,0.7)',
            fontSize: 12,
            textAnchor: 'middle',
            transform: 'rotate(-90)',
          }}
        />
      </Group>

      {/* Legend */}
      <Group left={width - margin.right - 100} top={margin.top}>
        {series.map((s, i) => (
          <Group key={s.id} top={i * 20}>
            <line x1={0} y1={0} x2={20} y2={0} stroke={s.color} strokeWidth={2} />
            <text x={25} y={4} fill="rgba(255,255,255,0.7)" fontSize={11}>
              {s.label}
            </text>
          </Group>
        ))}
      </Group>
    </svg>
  );
}

export function MultiLineChart(props: MultiLineChartProps) {
  if (props.width && props.height) {
    return <MultiLineChartInner {...props} width={props.width} height={props.height} />;
  }

  return (
    <ParentSize>
      {({ width, height }) => (
        <MultiLineChartInner {...props} width={width} height={height} />
      )}
    </ParentSize>
  );
}
