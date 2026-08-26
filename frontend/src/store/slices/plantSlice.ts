import { StateCreator } from 'zustand';
import {
  PlantNode,
  PlantEdge,
  RunbookData,
  MOCK_GRAPH_INITIAL,
  MOCK_GRAPH_REROUTED,
  MOCK_RUNBOOK_INITIAL,
  apexApi,
} from '../../services/api';

export interface PlantSlice {
  isAnomalyActive: boolean;
  isRerouted: boolean;
  selectedNode: PlantNode | null;

  nodes: PlantNode[];
  edges: PlantEdge[];
  runbook: RunbookData;

  triggerAnomaly: () => void;
  resetPlantState: () => void;
  setSelectedNode: (node: PlantNode | null) => void;
  toggleStepCompletion: (stepId: string) => void;
  toggleLotoStatus: (stepId: string) => void;
  markStepFailedAndReroute: () => Promise<void>;
}

export const createPlantSlice: StateCreator<PlantSlice> = (set) => ({
  isAnomalyActive: true,
  isRerouted: false,
  selectedNode: MOCK_GRAPH_INITIAL.nodes[0],

  nodes: MOCK_GRAPH_INITIAL.nodes,
  edges: MOCK_GRAPH_INITIAL.edges,
  runbook: MOCK_RUNBOOK_INITIAL,

  triggerAnomaly: () => {
    set({
      isAnomalyActive: true,
      isRerouted: false,
      nodes: MOCK_GRAPH_INITIAL.nodes,
      edges: MOCK_GRAPH_INITIAL.edges,
      runbook: MOCK_RUNBOOK_INITIAL,
      selectedNode: MOCK_GRAPH_INITIAL.nodes[0],
    });
  },

  resetPlantState: () => {
    const nominalNodes = MOCK_GRAPH_INITIAL.nodes.map((n) => ({
      ...n,
      status: 'nominal' as const,
      telemetry: {
        pressure: n.type === 'reactor' ? '11.8 Bar' : undefined,
        temperature: n.type === 'reactor' ? '210°C' : undefined,
        flow: n.type === 'pump' ? '400 L/min' : 'Nominal',
      },
    }));
    const nominalEdges = MOCK_GRAPH_INITIAL.edges.map((e) => ({
      ...e,
      status: 'nominal' as const,
    }));

    set({
      isAnomalyActive: false,
      isRerouted: false,
      nodes: nominalNodes,
      edges: nominalEdges,
      selectedNode: nominalNodes[0],
    });
  },

  setSelectedNode: (selectedNode) => set({ selectedNode }),

  toggleStepCompletion: (stepId) => {
    set((state) => {
      const updatedSteps = state.runbook.steps.map((step) =>
        step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step,
      );
      return {
        runbook: { ...state.runbook, steps: updatedSteps },
      };
    });
  },

  toggleLotoStatus: (stepId) => {
    set((state) => {
      const updatedSteps = state.runbook.steps.map((step) => {
        if (step.id === stepId) {
          const nextStatus: 'pending' | 'verified' | 'skipped' =
            step.lotoStatus === 'pending' ? 'verified' : 'pending';
          return { ...step, lotoStatus: nextStatus };
        }
        return step;
      });
      return {
        runbook: { ...state.runbook, steps: updatedSteps },
      };
    });
  },

  markStepFailedAndReroute: async () => {
    const reroutedRunbook = await apexApi.triggerStepReroute();
    set({
      isRerouted: true,
      nodes: MOCK_GRAPH_REROUTED.nodes,
      edges: MOCK_GRAPH_REROUTED.edges,
      runbook: reroutedRunbook,
      selectedNode: MOCK_GRAPH_REROUTED.nodes[2],
    });
  },
});
