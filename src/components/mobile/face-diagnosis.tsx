'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ProgressSteps } from '../ui/progress-steps';
import { LoadingSpinner } from '../ui/loading-spinner';
import { FaceShapeCard } from '../ui/face-shape-card';
import { SparkleButton } from '../ui/sparkle-button';
import { 
  Camera, 
  RefreshCw, 
  CheckCircle, 
  ArrowLeft, 
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaceDiagnosisProps {
  onBack: () => void;
  onComplete: (result: DiagnosisResult) => void;
  onViewStylists: () => void;
}

interface DiagnosisResult {
  faceShape: string;
  confidence: number;
  description: string;
  celebrity: string;
  recommendedStyles: string[];
  personalColor: string;
  matchingStylists: number;
}

const steps = [
  { id: 1, label: '撮影' },
  { id: 2, label: '解析' },
  { id: 3, label: '結果' }
];

const mockResults: DiagnosisResult = {
  faceShape: '卵型',
  confidence: 94,
  description: 'バランスの取れた理想的な顔型です。どんなヘアスタイルも似合いやすく、様々なスタイルに挑戦できます。',
  celebrity: '石原さとみさん',
  recommendedStyles: ['ロングレイヤー', 'ボブ', 'ショート', 'パーマ'],
  personalColor: 'スプリング',
  matchingStylists: 23
};

export function FaceDiagnosis({ onBack, onComplete, onViewStylists }: FaceDiagnosisProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleCapture = () => {
    // Simulate camera capture
    setCapturedImage('https://images.unsplash.com/photo-1624850667288-31fde0ec04bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwamFwYW5lc2UlMjB3b21hbiUyMHBvcnRyYWl0JTIwZmFjZXxlbnwxfHx8fDE3NTc3NzE2ODd8MA&ixlib=rb-4.1.0&q=80&w=1080');
    setCurrentStep(2);
    startAnalysis();
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate AI analysis with progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsAnalyzing(false);
          setCurrentStep(3);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 3000));
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCurrentStep(1);
    setAnalysisProgress(0);
  };

  const handleComplete = () => {
    onComplete(mockResults);
    onViewStylists();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">AI顔型診断</h1>
          <div className="w-6" />
        </div>
        
        <ProgressSteps steps={steps} currentStep={currentStep} />
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Camera */}
          {currentStep === 1 && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-48 h-48 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                    <Camera className="w-24 h-24 text-pink-500" />
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-3">顔写真を撮影しましょう</h2>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    正面を向いて、髪が顔にかからないようにして撮影してください。
                    明るい場所での撮影をおすすめします。
                  </p>
                  
                  <SparkleButton onClick={handleCapture} size="lg" className="w-full">
                    撮影開始
                  </SparkleButton>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    撮影のコツ
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 正面を向いて撮影</li>
                    <li>• 髪は耳にかけて顔のラインを見せる</li>
                    <li>• 明るい自然光の下で撮影</li>
                    <li>• 表情は自然に</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Analysis */}
          {currentStep === 2 && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <Card>
                <CardContent className="p-6 text-center space-y-6">
                  {capturedImage && (
                    <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-lg">
                      <img 
                        src={capturedImage} 
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <LoadingSpinner size="lg" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping mx-auto mb-2" />
                        </div>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold">AI分析中...</h2>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(analysisProgress, 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{Math.floor(analysisProgress)}% 完了</p>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      {analysisProgress > 20 && <p>✓ 顔の輪郭を検出中</p>}
                      {analysisProgress > 50 && <p>✓ 顔型パターンを分析中</p>}
                      {analysisProgress > 80 && <p>✓ 最適なスタイルを検索中</p>}
                    </div>
                  </div>
                  
                  <Button variant="outline" onClick={handleRetake}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    撮り直し
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              {/* Success message */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center py-4"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                <h2 className="text-xl font-semibold text-gray-800">診断完了！</h2>
                <p className="text-gray-600 text-sm">あなたにぴったりの結果をお届けします</p>
              </motion.div>

              {/* Results */}
              <FaceShapeCard
                shape={mockResults.faceShape}
                confidence={mockResults.confidence}
                description={mockResults.description}
                celebrity={mockResults.celebrity}
                recommendedStyles={mockResults.recommendedStyles}
                isActive={true}
              />

              {/* Personal color */}
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">パーソナルカラー診断</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-purple-500 text-white mb-1">{mockResults.personalColor}</Badge>
                      <p className="text-sm text-gray-600">暖かみのある明るい色がお似合いです</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Matching stylists */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1">マッチング美容師</h3>
                      <p className="text-sm text-gray-600">
                        {mockResults.matchingStylists}人の美容師があなたにおすすめです
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {mockResults.matchingStylists}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <SparkleButton 
                  onClick={handleComplete}
                  size="lg" 
                  className="w-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  おすすめ美容師を見る
                  <ChevronRight className="w-4 h-4 ml-2" />
                </SparkleButton>
                
                <Button variant="outline" onClick={handleRetake} className="w-full">
                  診断をやり直す
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}