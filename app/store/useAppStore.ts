import { create } from 'zustand';

interface AppState {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  user: any | null;
  setUser: (user: any | null) => void;
  tripId: string | null;
  setTripId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  onboardingStep: 0,
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  user: null,
  setUser: (user) => set({ user }),
  tripId: null,
  setTripId: (id) => set({ tripId: id }),
}));
