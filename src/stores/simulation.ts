import { create } from 'zustand';
import type { Resource, ResourceState } from '@/data/resources/types';
import type { TransactionType, Transaction } from '@/data/transactions/types';
import type { Tech } from '@/data/tech/types';

export interface SimulationConfig {
  /** Resources to include in simulation */
  resources: Resource[];

  /** Transaction types to simulate */
  transactionTypes: TransactionType[];

  /** Active tech stack */
  techStack: Tech[];

  /** Fee market model to use */
  feeMarketModel: 'eip1559' | 'multidim-1559' | 'ai-oracle' | 'fixed';

  /** Simulation duration in seconds */
  duration: number;

  /** Timestep resolution in seconds */
  timestep: number;

  /** EIP-1559 parameters */
  eip1559Params: {
    targetUtilization: number;
    maxChangeRate: number;
    minBaseFee: number;
  };

  /** Speed multiplier for visualization */
  speedMultiplier: number;
}

export interface SimulationState {
  /** Current simulation timestamp */
  timestamp: number;

  /** Per-resource state */
  resourceStates: Record<string, ResourceState>;

  /** Current base fee (in gwei) */
  baseFee: number;

  /** Pending transactions */
  pendingTransactions: Transaction[];

  /** Executed transactions (last N for display) */
  recentTransactions: Transaction[];

  /** Running metrics */
  metrics: {
    totalTxExecuted: number;
    totalGasUsed: number;
    averageUtilization: Record<string, number>;
    peakBackpressure: Record<string, number>;
    feeHistory: number[];
  };
}

export interface SimulationStore {
  // Configuration
  config: SimulationConfig;
  setConfig: (config: Partial<SimulationConfig>) => void;

  // State
  state: SimulationState;
  setState: (state: Partial<SimulationState>) => void;

  // Control
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  step: () => void;

  // Tech stack management
  enableTech: (techId: string) => void;
  disableTech: (techId: string) => void;
  toggleTech: (techId: string) => void;

  // Available data (loaded from data files)
  availableResources: Resource[];
  availableTransactions: TransactionType[];
  availableTech: Tech[];
  setAvailableData: (data: {
    resources?: Resource[];
    transactions?: TransactionType[];
    tech?: Tech[];
  }) => void;
}

const defaultConfig: SimulationConfig = {
  resources: [],
  transactionTypes: [],
  techStack: [],
  feeMarketModel: 'eip1559',
  duration: 60,
  timestep: 0.1,
  eip1559Params: {
    targetUtilization: 0.5,
    maxChangeRate: 0.125,
    minBaseFee: 1,
  },
  speedMultiplier: 1,
};

const defaultState: SimulationState = {
  timestamp: 0,
  resourceStates: {},
  baseFee: 20,
  pendingTransactions: [],
  recentTransactions: [],
  metrics: {
    totalTxExecuted: 0,
    totalGasUsed: 0,
    averageUtilization: {},
    peakBackpressure: {},
    feeHistory: [],
  },
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  config: defaultConfig,
  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),

  state: defaultState,
  setState: (newState) =>
    set((state) => ({
      state: { ...state.state, ...newState },
    })),

  isRunning: false,
  isPaused: false,

  start: () => {
    const { config } = get();
    // Initialize resource states
    const resourceStates: Record<string, ResourceState> = {};
    for (const resource of config.resources) {
      resourceStates[resource.id] = {
        resourceId: resource.id,
        currentThroughput: 0,
        utilization: 0,
        backpressure: 0,
        effectiveMaxThroughput: resource.maxThroughput,
      };
    }

    set({
      isRunning: true,
      isPaused: false,
      state: {
        ...defaultState,
        resourceStates,
      },
    });
  },

  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  stop: () => set({ isRunning: false, isPaused: false }),

  reset: () =>
    set({
      state: defaultState,
      isRunning: false,
      isPaused: false,
    }),

  step: () => {
    const { state, config } = get();
    // Single simulation step - implemented in simulation engine
    set({
      state: {
        ...state,
        timestamp: state.timestamp + config.timestep,
      },
    });
  },

  enableTech: (techId) => {
    const { config, availableTech } = get();
    const tech = availableTech.find((t) => t.id === techId);
    if (tech && !config.techStack.find((t) => t.id === techId)) {
      set({
        config: {
          ...config,
          techStack: [...config.techStack, tech],
        },
      });
    }
  },

  disableTech: (techId) => {
    const { config } = get();
    set({
      config: {
        ...config,
        techStack: config.techStack.filter(
          (t) => t.id !== techId
        ),
      },
    });
  },

  toggleTech: (techId) => {
    const { config } = get();
    const isEnabled = config.techStack.some((t) => t.id === techId);
    if (isEnabled) {
      get().disableTech(techId);
    } else {
      get().enableTech(techId);
    }
  },

  availableResources: [],
  availableTransactions: [],
  availableTech: [],

  setAvailableData: (data) =>
    set((state) => ({
      availableResources: data.resources ?? state.availableResources,
      availableTransactions: data.transactions ?? state.availableTransactions,
      availableTech: data.tech ?? state.availableTech,
    })),
}));
