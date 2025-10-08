import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

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

export function useImageSelection() {
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const setImageManually = useCallback((nextImage: SelectedImage | null) => {
    setImage(nextImage);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setImageManually(null);
  }, [setImageManually]);

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
      setImageManually({
        uri: asset.uri,
        base64: asset.base64 ?? undefined,
        width: asset.width ?? 0,
        height: asset.height ?? 0,
        mimeType: asset.mimeType ?? inferMimeType(asset.uri),
      });
    } catch (pickError) {
      setError(pickError instanceof Error ? pickError.message : '画像の取得に失敗しました。');
    } finally {
      setIsRequesting(false);
    }
  }, [setImageManually]);

  return {
    image,
    error,
    isRequesting,
    pickFromLibrary,
    reset,
    setImage: setImageManually,
  };
}
