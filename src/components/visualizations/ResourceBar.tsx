'use client';

import { motion } from 'framer-motion';
import type { Resource, ResourceState } from '@/data/resources/types';

interface ResourceBarProps {
  resource: Resource;
  state?: ResourceState;
  showLabel?: boolean;
  showValue?: boolean;
  height?: number;
  animated?: boolean;
}

export function ResourceBar({
  resource,
  state,
  showLabel = true,
  showValue = true,
  height = 32,
  animated = true,
}: ResourceBarProps) {
  const utilization = state?.utilization ?? 0;
  const effectiveMax = state?.effectiveMaxThroughput ?? resource.maxThroughput;
  const currentThroughput = state?.currentThroughput ?? 0;

  // Color based on utilization
  const getUtilizationColor = (util: number) => {
    if (util < 0.5) return 'bg-green-500';
    if (util < 0.8) return 'bg-yellow-500';
    if (util < 0.95) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const BarComponent = animated ? motion.div : 'div';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-white">{resource.name}</span>
          {showValue && (
            <span className="text-xs text-gray-400">
              {currentThroughput.toFixed(1)} / {effectiveMax.toFixed(1)} {resource.unit}
            </span>
          )}
        </div>
      )}

      <div
        className="relative w-full bg-white/10 rounded-full overflow-hidden"
        style={{ height }}
      >
        {/* Background with resource color */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundColor: resource.color }}
        />

        {/* Utilization bar */}
        <BarComponent
          className={`absolute inset-y-0 left-0 ${getUtilizationColor(utilization)} rounded-full`}
          initial={animated ? { width: 0 } : undefined}
          animate={animated ? { width: `${utilization * 100}%` } : undefined}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={!animated ? { width: `${utilization * 100}%` } : undefined}
        />

        {/* Effective max indicator (if different from base) */}
        {effectiveMax !== resource.maxThroughput && (
          <div
            className="absolute inset-y-0 w-0.5 bg-white/50"
            style={{
              left: `${(resource.maxThroughput / effectiveMax) * 100}%`,
            }}
            title={`Base capacity: ${resource.maxThroughput} ${resource.unit}`}
          />
        )}

        {/* Utilization percentage */}
        {utilization > 0.1 && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
            {(utilization * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Backpressure indicator */}
      {state?.backpressure && state.backpressure > 0 && (
        <div className="mt-1 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400">
            Backpressure: {state.backpressure.toFixed(1)} TPS queued
          </span>
        </div>
      )}
    </div>
  );
}

interface ResourceBarGroupProps {
  resources: Resource[];
  states?: Record<string, ResourceState>;
  title?: string;
}

export function ResourceBarGroup({
  resources,
  states = {},
  title,
}: ResourceBarGroupProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      {resources.map((resource) => (
        <ResourceBar
          key={resource.id}
          resource={resource}
          state={states[resource.id]}
        />
      ))}
    </div>
  );
}
