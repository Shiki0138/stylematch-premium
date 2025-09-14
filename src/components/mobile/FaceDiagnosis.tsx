'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressSteps } from './ProgressSteps';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SparkleButton } from './SparkleButton';
import { MobileContainer } from './MobileContainer';
import { GradientBg } from './GradientBg';
import { 
  Camera, 
  RefreshCw, 
  CheckCircle, 
  ArrowLeft, 
  Sparkles,
  Users,
  ChevronRight,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  { id: 1, label: '撮影', completed: false },
  { id: 2, label: '解析', completed: false },
  { id: 3, label: '結果', completed: false }
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
    setCapturedImage('https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400');
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
    <MobileContainer>
      <GradientBg variant="soft" className="min-h-screen">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm px-4 pt-12 pb-4 shadow-sm safe-top">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">AI顔型診断</h1>
            <div className="w-10" />
          </div>
          
          <ProgressSteps 
            steps={steps.map((s, i) => ({ ...s, completed: i < currentStep - 1 }))} 
            currentStep={currentStep} 
          />
        </div>

        <div className="p-4 pb-20">
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
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-48 h-48 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center"
                    >
                      <Camera className="w-24 h-24 text-pink-500" />
                    </motion.div>
                    
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

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-md">
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
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center space-y-6">
                    {capturedImage && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-lg"
                      >
                        <img 
                          src={capturedImage} 
                          alt="Captured"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <LoadingSpinner size="lg" />
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
                      
                      <motion.div className="text-sm text-gray-600 space-y-1">
                        {analysisProgress > 20 && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            ✓ 顔の輪郭を検出中
                          </motion.p>
                        )}
                        {analysisProgress > 50 && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            ✓ 顔型パターンを分析中
                          </motion.p>
                        )}
                        {analysisProgress > 80 && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            ✓ 最適なスタイルを検索中
                          </motion.p>
                        )}
                      </motion.div>
                    </div>
                    
                    <Button variant="outline" onClick={handleRetake} disabled={isAnalyzing}>
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

                {/* Face Shape Result */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-1">
                    <CardContent className="bg-white m-0 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">あなたの顔型</h3>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium",
                          "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700"
                        )}>
                          {mockResults.confidence}% 確信度
                        </div>
                      </div>
                      
                      <div className="text-center py-4">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          {mockResults.faceShape}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {mockResults.description}
                        </p>
                        
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">似ている芸能人: </span>
                            {mockResults.celebrity}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">おすすめスタイル</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {mockResults.recommendedStyles.map((style) => (
                              <span
                                key={style}
                                className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs"
                              >
                                {style}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>

                {/* Personal color */}
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0 shadow-md">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">パーソナルカラー診断</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-1">
                          {mockResults.personalColor}
                        </div>
                        <p className="text-sm text-gray-600">暖かみのある明るい色がお似合いです</p>
                      </div>
                      <Heart className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                {/* Matching stylists */}
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium mb-1">マッチング美容師</h3>
                        <p className="text-sm text-gray-600">
                          {mockResults.matchingStylists}人の美容師があなたにおすすめです
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-orange-600">
                        {mockResults.matchingStylists}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-3 pb-4">
                  <SparkleButton 
                    onClick={handleComplete}
                    size="lg" 
                    className="w-full"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    おすすめ美容師を見る
                  </SparkleButton>
                  
                  <Button variant="outline" onClick={handleRetake} className="w-full">
                    診断をやり直す
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GradientBg>
    </MobileContainer>
  );
}