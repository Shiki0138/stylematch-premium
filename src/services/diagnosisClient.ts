import { postJson } from './apiClient';

const DIAGNOSIS_TOKEN = process.env.EXPO_PUBLIC_DIAGNOSIS_TOKEN ?? 'dev-mock-token';
export const DIAGNOSIS_MOCKS_ENABLED = process.env.EXPO_PUBLIC_ENABLE_MOCKS === '1';
const DIAGNOSIS_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_DIAGNOSIS_TIMEOUT_MS ?? 45000);

export type DiagnosisType = 'face' | 'color' | 'complete';

export interface DiagnosisResponse {
  diagnosisId: string;
  faceShape?: string;
  personalColor?: string;
  subtype?: string;
  confidence?: {
    faceShape?: number;
    personalColor?: number;
  };
  recommendations?: {
    hairstyles?: string[];
    avoidStyles?: string[];
    makeupTips?: string[];
  };
  colorPalette?: {
    recommended?: string[];
    avoid?: string[];
  };
}

export interface DiagnosisQuota {
  limit: number | null;
  used: number;
  shareLinkExpiryHours?: number;
  plan?: string;
}

export interface DiagnosisResult {
  success: boolean;
  data: DiagnosisResponse;
  quota?: DiagnosisQuota;
}

export interface DiagnosisPayload {
  imageDataUrl: string;
  diagnosisType: DiagnosisType;
}

interface ApiDiagnosisResponse {
  success: boolean;
  data: DiagnosisResponse;
  quota?: DiagnosisQuota;
  error?: string;
  detail?: unknown;
}

export async function analyzeDiagnosis(
  payload: DiagnosisPayload,
  { signal }: { signal?: AbortSignal } = {},
): Promise<DiagnosisResult> {
  try {
    const response = await postJson<ApiDiagnosisResponse>(
      '/api/diagnosis/analyze/',
      {
        image: payload.imageDataUrl,
        diagnosisType: payload.diagnosisType,
      },
      {
        headers: {
          Authorization: `Bearer ${DIAGNOSIS_TOKEN}`,
        },
        signal,
        timeoutMs: DIAGNOSIS_TIMEOUT_MS,
      },
    );

    if (!response.success) {
      throw new Error(response.error ?? '診断に失敗しました');
    }

    return {
      success: true,
      data: response.data,
      quota: response.quota,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('[diagnosis] request failed', error);
    }
    throw error;
  }
}

export async function analyzeDiagnosisMock(
  payload: DiagnosisPayload,
): Promise<DiagnosisResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    data: {
      diagnosisId: `mock-${Date.now()}`,
      faceShape: 'oval',
      personalColor: payload.diagnosisType === 'color' || payload.diagnosisType === 'complete' ? 'spring' : undefined,
      subtype: 'bright-spring',
      confidence: {
        faceShape: 0.92,
        personalColor: 0.85,
      },
      recommendations: {
        hairstyles: ['ショートボブ', 'レイヤーロング', 'サイドパート'],
        avoidStyles: ['重ためワンレングス'],
        makeupTips: ['頬骨に沿ったチーク', 'セミマットなベースメイク'],
      },
      colorPalette: {
        recommended: ['#F8C8C4', '#F5A25D', '#98D8C8'],
        avoid: ['#4F5A7D', '#2C2C2C'],
      },
    },
    quota: {
      limit: 4,
      used: 1,
      shareLinkExpiryHours: 48,
      plan: 'free',
    },
  };
}
