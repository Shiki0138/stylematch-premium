import { create } from 'zustand';
import { FaceShape, PersonalColor, DiagnosisResult, MatchingResult, Stylist } from '@/types/models';

interface AppState {
  // 診断関連
  diagnosisInProgress: boolean;
  currentDiagnosis: DiagnosisResult | null;
  diagnosisImage: string | null;
  
  // マッチング関連
  matchingResults: MatchingResult[];
  selectedStylist: Stylist | null;
  
  // UI状態
  isLoading: boolean;
  error: string | null;

  // Actions
  setDiagnosisInProgress: (inProgress: boolean) => void;
  setCurrentDiagnosis: (diagnosis: DiagnosisResult | null) => void;
  setDiagnosisImage: (image: string | null) => void;
  setMatchingResults: (results: MatchingResult[]) => void;
  setSelectedStylist: (stylist: Stylist | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  diagnosisInProgress: false,
  currentDiagnosis: null,
  diagnosisImage: null,
  matchingResults: [],
  selectedStylist: null,
  isLoading: false,
  error: null,

  // Actions
  setDiagnosisInProgress: (inProgress) => set({ diagnosisInProgress: inProgress }),
  setCurrentDiagnosis: (diagnosis) => set({ currentDiagnosis: diagnosis }),
  setDiagnosisImage: (image) => set({ diagnosisImage: image }),
  setMatchingResults: (results) => set({ matchingResults: results }),
  setSelectedStylist: (stylist) => set({ selectedStylist: stylist }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    diagnosisInProgress: false,
    currentDiagnosis: null,
    diagnosisImage: null,
    matchingResults: [],
    selectedStylist: null,
    isLoading: false,
    error: null,
  }),
}));