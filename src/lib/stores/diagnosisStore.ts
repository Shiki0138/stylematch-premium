import { create } from 'zustand';

interface DiagnosisResult {
  faceShape: string;
  confidence: number;
  description: string;
  celebrity: string;
  recommendedStyles: string[];
  personalColor: string;
  matchingStylists: number;
}

interface DiagnosisStore {
  diagnosisResult: DiagnosisResult | null;
  setDiagnosisResult: (result: DiagnosisResult) => void;
  clearDiagnosisResult: () => void;
}

export const useDiagnosisStore = create<DiagnosisStore>((set) => ({
  diagnosisResult: null,
  setDiagnosisResult: (result) => set({ diagnosisResult: result }),
  clearDiagnosisResult: () => set({ diagnosisResult: null }),
}));