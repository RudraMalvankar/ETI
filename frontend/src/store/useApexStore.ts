import { create } from 'zustand';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { UISlice, createUISlice } from './slices/uiSlice';
import { PlantSlice, createPlantSlice } from './slices/plantSlice';
import { DataSlice, createDataSlice } from './slices/dataSlice';

export type ApexState = AuthSlice & UISlice & PlantSlice & DataSlice;

// Backward-compatible re-exports of slice types
export type { BackendConnectionState } from './slices/uiSlice';

export const useApexStore = create<ApexState>()((...args) => ({
  ...createAuthSlice(...args),
  ...createUISlice(...args),
  ...createPlantSlice(...args),
  ...createDataSlice(...args),
}));
