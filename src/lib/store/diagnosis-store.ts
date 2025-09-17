import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Diagnosis {
  id: string;
  userId: string;
  faceShape?: string;
  personalColor?: string;
  imageUrl?: string;
  recommendations?: {
    hairstyles?: string[];
    avoidStyles?: string[];
    points?: string[];
  };
  createdAt: Date;
  score?: number;
}

interface DiagnosisState {
  diagnoses: Diagnosis[];
  latestDiagnosis: Diagnosis | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addDiagnosis: (diagnosis: Diagnosis) => void;
  setLatestDiagnosis: (diagnosis: Diagnosis) => void;
  updateDiagnosis: (id: string, updates: Partial<Diagnosis>) => void;
  clearDiagnoses: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDiagnosisStore = create<DiagnosisState>()(
  persist(
    (set, get) => ({
      diagnoses: [],
      latestDiagnosis: null,
      isLoading: false,
      error: null,

      addDiagnosis: (diagnosis) => set((state) => ({
        diagnoses: [...state.diagnoses, diagnosis],
        latestDiagnosis: diagnosis,
      })),

      setLatestDiagnosis: (diagnosis) => set({
        latestDiagnosis: diagnosis,
      }),

      updateDiagnosis: (id, updates) => set((state) => ({
        diagnoses: state.diagnoses.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        ),
        latestDiagnosis: 
          state.latestDiagnosis?.id === id
            ? { ...state.latestDiagnosis, ...updates }
            : state.latestDiagnosis,
      })),

      clearDiagnoses: () => set({
        diagnoses: [],
        latestDiagnosis: null,
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'diagnosis-storage',
      partialize: (state) => ({
        diagnoses: state.diagnoses,
        latestDiagnosis: state.latestDiagnosis,
      }),
    }
  )
);