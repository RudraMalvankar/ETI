import { describe, it, expect, beforeEach } from 'vitest';
import { useApexStore } from '../store/useApexStore';

describe('useApexStore', () => {
  beforeEach(() => {
    useApexStore.setState({
      activeTab: 'dashboard',
      isDarkMode: true,
      connectionState: 'connected',
      isAnomalyActive: true,
      isRerouted: false,
    });
  });

  it('updates activeTab correctly', () => {
    const { setActiveTab } = useApexStore.getState();
    setActiveTab('documents');
    expect(useApexStore.getState().activeTab).toBe('documents');
  });

  it('toggles theme correctly', () => {
    const { toggleTheme } = useApexStore.getState();
    toggleTheme();
    expect(useApexStore.getState().isDarkMode).toBe(false);
  });

  it('resets plant state', () => {
    const { resetPlantState } = useApexStore.getState();
    resetPlantState();
    expect(useApexStore.getState().isAnomalyActive).toBe(false);
    expect(useApexStore.getState().isRerouted).toBe(false);
  });

  it('toggles step completion', () => {
    const { runbook, toggleStepCompletion } = useApexStore.getState();
    const firstStepId = runbook.steps[0].id;
    const initialStatus = runbook.steps[0].isCompleted;

    toggleStepCompletion(firstStepId);
    expect(useApexStore.getState().runbook.steps[0].isCompleted).toBe(!initialStatus);
  });
});
