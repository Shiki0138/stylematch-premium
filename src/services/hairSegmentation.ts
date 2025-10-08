import { Platform } from 'react-native';
import { API_BASE_URL } from './apiClient';

export interface HairSegmentationResult {
  mask: string;
  preview: string;
  meta: {
    width: number;
    height: number;
  };
}

export async function requestHairSegmentation(
  imageDataUrl: string,
  options: {
    widthFactor?: number;
    heightFactor?: number;
    offsetY?: number;
    timeoutMs?: number;
  } = {}
): Promise<HairSegmentationResult> {
  const { widthFactor, heightFactor, offsetY, timeoutMs = 7000 } = options;

  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
  const isLocalhostTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?/.test(API_BASE_URL);
  if (isNative && isLocalhostTarget) {
    throw new Error('ネイティブ実機から localhost には接続できません。EXPO_PUBLIC_API_BASE_URL を LAN の IP に設定してください。');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}/api/vision/hair-segmentation/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageDataUrl,
        ellipse: {
          widthFactor,
          heightFactor,
          offsetY,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Segmentation request failed (${response.status} ${response.statusText})${detail ? `\n${detail}` : ''}`
      );
    }

    const json = (await response.json()) as {
      success: boolean;
      mask: string;
      preview: string;
      meta: { width: number; height: number };
      error?: string;
    };
    if (!json.success) {
      throw new Error(json.error ?? 'hair segmentation failed');
    }

    return {
      mask: json.mask,
      preview: json.preview,
      meta: json.meta,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('hair segmentation request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
