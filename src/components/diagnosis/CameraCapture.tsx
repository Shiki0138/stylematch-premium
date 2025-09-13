'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel?: () => void;
  className?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

  // カメラストリームを開始
  const startCamera = useCallback(async () => {
    try {
      setError('');
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('カメラアクセスエラー:', err);
      setError('カメラへのアクセスが拒否されました。ブラウザの設定を確認してください。');
    }
  }, []);

  // カメラストリームを停止
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // 写真を撮影
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // キャンバスサイズをビデオサイズに合わせる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // ビデオフレームをキャンバスに描画
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Base64形式で画像を取得
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    setIsCaptured(true);
    stopCamera();
  }, [stopCamera]);

  // 撮り直し
  const retake = useCallback(() => {
    setIsCaptured(false);
    setCapturedImage('');
    startCamera();
  }, [startCamera]);

  // 画像を使用
  const usePhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  // ファイルアップロード
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      setError('画像サイズは5MB以下にしてください。');
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      setIsCaptured(true);
    };
    reader.readAsDataURL(file);
  }, []);

  // コンポーネントのアンマウント時にカメラを停止
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // カメラを自動で開始
  useEffect(() => {
    if (!isCaptured && !isStreaming) {
      startCamera();
    }
  }, [isCaptured, isStreaming, startCamera]);

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-4 bg-error/10 text-error rounded-lg">
          {error}
        </div>
      )}

      {/* カメラ/画像表示エリア */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[4/3]">
        {!isCaptured ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* ガイド枠 */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-80 border-3 border-white/50 rounded-2xl" />
                <p className="text-white text-center mt-4">
                  顔が枠内に収まるように調整してください
                </p>
              </div>
            </div>
          </>
        ) : (
          <img
            src={capturedImage}
            alt="撮影した写真"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* 隠しキャンバス（撮影用） */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 撮影のポイント */}
      {!isCaptured && (
        <div className="mt-4 p-4 bg-primary-50 rounded-lg">
          <h3 className="font-semibold mb-2">撮影のポイント</h3>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li>• 正面から撮影してください</li>
            <li>• 明るい場所で撮影してください</li>
            <li>• 髪を耳にかけて顔全体が見えるようにしてください</li>
            <li>• メガネは外すことをおすすめします</li>
          </ul>
        </div>
      )}

      {/* コントロールボタン */}
      <div className="mt-6 space-y-4">
        {!isCaptured ? (
          <>
            <Button
              onClick={capturePhoto}
              fullWidth
              size="lg"
              disabled={!isStreaming}
            >
              撮影する
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-text-secondary">または</span>
              </div>
            </div>

            <label htmlFor="file-upload" className="block">
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                as="span"
                variant="outline"
                fullWidth
                size="lg"
                className="cursor-pointer"
              >
                ギャラリーから選択
              </Button>
            </label>
          </>
        ) : (
          <div className="flex gap-4">
            <Button
              onClick={retake}
              variant="outline"
              fullWidth
            >
              撮り直す
            </Button>
            <Button
              onClick={usePhoto}
              fullWidth
            >
              この写真を使用
            </Button>
          </div>
        )}

        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            fullWidth
            className="text-text-secondary"
          >
            キャンセル
          </Button>
        )}
      </div>
    </div>
  );
};