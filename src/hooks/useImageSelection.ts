import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { requestHairSegmentation } from '../services/hairSegmentation';

export interface SelectedImage {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  mimeType: string;
  hairMask?: string;
  hairMaskPreview?: string;
}

const inferMimeType = (uri?: string) => {
  if (!uri) return 'image/jpeg';
  const lowered = uri.toLowerCase();
  if (lowered.endsWith('.png')) return 'image/png';
  if (lowered.endsWith('.webp')) return 'image/webp';
  if (lowered.endsWith('.gif')) return 'image/gif';
  if (lowered.endsWith('.heic')) return 'image/heic';
  return 'image/jpeg';
};

const buildDataUrl = (image: SelectedImage) => {
  if (image.base64) {
    return `data:${image.mimeType};base64,${image.base64}`;
  }
  if (image.uri.startsWith('data:')) {
    return image.uri;
  }
  return null;
};

export function useImageSelection() {
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentError, setSegmentError] = useState<string | null>(null);

  const setImageManually = useCallback((nextImage: SelectedImage | null) => {
    setImage(nextImage);
    setError(null);
    if (!nextImage) {
      setSegmentError(null);
    }
  }, []);

  const reset = useCallback(() => {
    setImageManually(null);
  }, [setImageManually]);

  const applySegmentation = useCallback(
    async (
      target: SelectedImage,
      options?: { widthFactor?: number; heightFactor?: number; offsetY?: number },
    ) => {
      const dataUrl = buildDataUrl(target);
      if (!dataUrl) {
        throw new Error('髪の解析にはBase64形式の画像が必要です。再撮影を試してください。');
      }

      setIsSegmenting(true);
      setSegmentError(null);
      try {
        const result = await requestHairSegmentation(dataUrl, options);
        return {
          ...target,
          hairMask: result.mask,
          hairMaskPreview: result.preview,
        } as SelectedImage;
      } catch (segmentationError) {
        const message = segmentationError instanceof Error ? segmentationError.message : '髪領域の解析に失敗しました。';
        setSegmentError(message);
        throw segmentationError;
      } finally {
        setIsSegmenting(false);
      }
    },
    [],
  );

  const pickFromLibrary = useCallback(async () => {
    try {
      setIsRequesting(true);
      setError(null);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('写真ライブラリへのアクセスが許可されていません。設定から権限を付与してください。');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const nextImage: SelectedImage = {
        uri: asset.uri,
        base64: asset.base64 ?? undefined,
        width: asset.width ?? 0,
        height: asset.height ?? 0,
        mimeType: asset.mimeType ?? inferMimeType(asset.uri),
      };

      setImageManually(nextImage);

      if (nextImage.base64) {
        try {
          const withMask = await applySegmentation(nextImage);
          setImageManually(withMask);
          setSegmentError(null);
        } catch (segmentationError) {
          console.warn('[imageSelection] segmentation failed', segmentationError);
        }
      }
    } catch (pickError) {
      setError(pickError instanceof Error ? pickError.message : '画像の取得に失敗しました。');
    } finally {
      setIsRequesting(false);
    }
  }, [applySegmentation, setImageManually]);

  const regenerateHairMask = useCallback(
    async (options?: { widthFactor?: number; heightFactor?: number; offsetY?: number }) => {
      if (!image) return null;
      try {
        const withMask = await applySegmentation(image, options);
        setImageManually(withMask);
        setSegmentError(null);
        return withMask;
      } catch (segmentationError) {
        console.warn('[imageSelection] regenerateHairMask failed', segmentationError);
        return null;
      }
    },
    [image, applySegmentation, setImageManually],
  );

  return {
    image,
    error,
    isRequesting,
    pickFromLibrary,
    reset,
    setImage: setImageManually,
    regenerateHairMask,
    isSegmenting,
    segmentError,
  };
}
