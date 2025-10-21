import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  CameraType,
  type CameraCapturedPicture,
} from 'expo-camera';
import type { SelectedImage } from '../hooks/useImageSelection';
import { requestHairSegmentation } from '../services/hairSegmentation';

interface CameraCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (image: SelectedImage) => void;
}

export function CameraCaptureModal({ visible, onClose, onCapture }: CameraCaptureModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('顔を中央に合わせ、自然光で撮影しましょう');
  const [maskPreview, setMaskPreview] = useState<string | null>(null);

  useEffect(() => {
    if (visible && !permission) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  useEffect(() => {
    if (!visible) {
      setMaskPreview(null);
      setStatusMessage('顔を中央に合わせ、自然光で撮影しましょう');
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (permission?.status === 'denied') {
      setError('カメラへのアクセスが拒否されています。設定アプリから許可してください。');
    } else {
      setError(null);
    }
  }, [permission?.status]);

  const handleCapture = async () => {
    if (!cameraRef.current || isSaving) return;
    try {
      setIsSaving(true);
      setStatusMessage('撮影中…揺れないように保持してください');
      const photo: CameraCapturedPicture = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.85,
        skipProcessing: false,
      });

      if (!photo || !photo.uri) {
        setError('写真の取得に失敗しました。');
        return;
      }

      const mimeType = 'image/jpeg';
      const dataUrl = photo.base64 ? `data:${mimeType};base64,${photo.base64}` : null;

      let hairMask: string | undefined;
      let hairMaskPreview: string | undefined;

      if (dataUrl) {
        try {
          setStatusMessage('髪の輪郭を解析しています…');
          const segmentation = await requestHairSegmentation(dataUrl);
          hairMask = segmentation.mask;
          hairMaskPreview = segmentation.preview;
          setMaskPreview(segmentation.preview);
        } catch (segmentationError) {
          console.warn('[camera] hair segmentation failed', segmentationError);
          setError('髪の領域解析に失敗しました。マスクは手動で調整してください。');
        }
      }

      onCapture({
        uri: photo.uri,
        base64: photo.base64 ?? undefined,
        width: photo.width ?? 0,
        height: photo.height ?? 0,
        mimeType,
        hairMask,
        hairMaskPreview,
      });
      onClose();
    } catch (captureError) {
      setError(
        captureError instanceof Error
          ? captureError.message
          : '写真の保存中に問題が発生しました。',
      );
    } finally {
      setIsSaving(false);
      setStatusMessage('顔を中央に合わせ、自然光で撮影しましょう');
    }
  };

  const hasPermission = permission?.granted ?? false;
  const guidancePoints = useMemo(
    () => [
      '正面を向き、あごを引いてください',
      '自然光または柔らかい照明で撮影',
      '背景はすっきり、他の人が写らないように',
    ],
    [],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {hasPermission ? (
          <View style={styles.cameraWrapper}>
            <CameraView
              ref={(ref) => {
                cameraRef.current = ref;
              }}
              style={styles.camera}
              facing={cameraType}
            />
            <View style={styles.overlay} pointerEvents="none">
              <Text style={styles.statusLabel}>{statusMessage}</Text>
              <View style={styles.guideContainer}>
                <View style={styles.faceGuideOuter}>
                  <View style={styles.faceGuideInner} />
                </View>
                <View style={styles.shoulderGuide} />
              </View>
              <View style={styles.guidanceList}>
                {guidancePoints.map((item) => (
                  <Text key={item} style={styles.guidanceItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
            {maskPreview && (
              <Image source={{ uri: maskPreview }} style={styles.maskPreview} resizeMode="cover" />
            )}
            {isSaving && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.processingText}>解析中…そのままお待ちください</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              カメラを利用するには権限が必要です。
            </Text>
            <Pressable style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>権限をリクエスト</Text>
            </Pressable>
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.controls}>
          <Pressable
            onPress={() => setCameraType((prev) => (prev === 'front' ? 'back' : 'front'))}
            style={styles.controlButton}
          >
            <Text style={styles.controlLabel}>カメラ切替</Text>
          </Pressable>

          <Pressable
            onPress={handleCapture}
            style={[styles.shutterButton, isSaving && styles.shutterButtonDisabled]}
            disabled={isSaving || !hasPermission}
          >
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.shutterLabel}>撮影</Text>}
          </Pressable>

          <Pressable onPress={onClose} style={styles.controlButton}>
            <Text style={styles.controlLabel}>閉じる</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 120,
    paddingHorizontal: 32,
  },
  statusLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  guideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  faceGuideOuter: {
    width: '68%',
    aspectRatio: 3 / 4,
    maxWidth: 320,
    borderRadius: 160,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuideInner: {
    width: '80%',
    height: '72%',
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  shoulderGuide: {
    marginTop: 16,
    width: '82%',
    maxWidth: 340,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  guidanceList: {
    backgroundColor: 'rgba(0,0,0,0.38)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  guidanceItem: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
  },
  maskPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#1A1A1Fcc',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 44,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  shutterButtonDisabled: {
    opacity: 0.5,
  },
  shutterLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: '#6C63FF',
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    position: 'absolute',
    top: 64,
    left: 24,
    right: 24,
    textAlign: 'center',
    color: '#FF8585',
    fontSize: 14,
  },
});
