'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, Camera, Download, Share2, Palette, Scissors, Clock } from 'lucide-react';
import { hairstyleSimulationService, HairstyleOptions, SimulationResult } from '@/lib/services/hairstyle-simulation.service';
import { useDiagnosisStore } from '@/lib/store/diagnosis-store';
import { toast } from 'react-hot-toast';

export default function HairstyleSimulation() {
  const router = useRouter();
  const { latestDiagnosis } = useDiagnosisStore();
  
  const [selectedStyle, setSelectedStyle] = useState<HairstyleOptions>({
    style: 'elegant',
    length: 'medium'
  });
  const [selectedColor, setSelectedColor] = useState('natural');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [userImage, setUserImage] = useState<string>('');
  
  // 診断結果を取得
  const faceType = latestDiagnosis?.faceShape || 'tamago';
  const personalColor = latestDiagnosis?.personalColor;

  useEffect(() => {
    // 診断画像を取得
    if (latestDiagnosis?.imageUrl) {
      setUserImage(latestDiagnosis.imageUrl);
    }
  }, [latestDiagnosis]);

  // スタイルオプション
  const styleOptions = [
    { 
      id: 'elegant' as const, 
      name: 'エレガント', 
      description: '上品で洗練された印象',
      icon: '✨'
    },
    { 
      id: 'casual' as const, 
      name: 'カジュアル', 
      description: '自然体で親しみやすい',
      icon: '🌿'
    },
    { 
      id: 'modern' as const, 
      name: 'モダン', 
      description: '都会的でスタイリッシュ',
      icon: '🏙️'
    },
    { 
      id: 'cute' as const, 
      name: 'キュート', 
      description: '可愛らしく若々しい',
      icon: '🌸'
    },
    {
      id: 'natural' as const,
      name: 'ナチュラル',
      description: '自然で健康的な印象',
      icon: '🍃'
    }
  ];

  const lengthOptions = [
    { id: 'short' as const, name: 'ショート', icon: '✂️' },
    { id: 'medium' as const, name: 'ミディアム', icon: '💇‍♀️' },
    { id: 'long' as const, name: 'ロング', icon: '👱‍♀️' }
  ];

  const colorOptions = [
    { id: 'natural', name: 'ナチュラル', color: '#654321' },
    { id: 'ash', name: 'アッシュ', color: '#8B8680' },
    { id: 'beige', name: 'ベージュ', color: '#D4A574' },
    { id: 'pink', name: 'ピンク', color: '#FFB6C1' },
    { id: 'orange', name: 'オレンジ', color: '#FF8C42' }
  ];

  const handleSimulation = async () => {
    if (!userImage) {
      toast.error('診断画像が見つかりません。先に顔型診断を完了してください。');
      return;
    }

    setIsSimulating(true);
    try {
      const results = await hairstyleSimulationService.simulateHairstyles(
        userImage,
        faceType,
        {
          ...selectedStyle,
          color: selectedColor !== 'natural' ? selectedColor : undefined
        },
        personalColor
      );
      
      setSimulationResults(results);
      toast.success('シミュレーション完了！');
    } catch (error) {
      toast.error('シミュレーションに失敗しました');
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      // 実際の実装では画像をダウンロード
      toast.success(`スタイル${index + 1}を保存しました`);
    } catch (error) {
      toast.error('保存に失敗しました');
    }
  };

  const handleShare = async (result: SimulationResult) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'StyleMatch - AI髪型シミュレーション',
          text: `私に似合う髪型を見つけました！${result.description}`,
          url: window.location.href
        });
      } else {
        // クリップボードにコピー
        await navigator.clipboard.writeText(window.location.href);
        toast.success('リンクをコピーしました');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-pearl">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">AI髪型シミュレーション</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 説明カード */}
        <Card className="bg-gradient-to-r from-luxury-navy to-luxury-champagne text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              あなたの顔型: {faceType === 'tamago' ? '卵型' : 
                            faceType === 'maru' ? '丸顔' :
                            faceType === 'shikaku' ? '四角顔' :
                            faceType === 'heart' ? 'ハート型' : '面長'}
            </CardTitle>
            <CardDescription className="text-white/90">
              診断結果に基づいて、最適な髪型をAIがご提案します
            </CardDescription>
          </CardHeader>
        </Card>

        {/* スタイル選択 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              スタイルを選択
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* スタイルタイプ */}
            <div>
              <Label className="text-sm font-medium mb-3 block">スタイルタイプ</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {styleOptions.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle({...selectedStyle, style: style.id})}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedStyle.style === style.id
                        ? 'border-luxury-champagne bg-luxury-champagne/10'
                        : 'border-gray-200 hover:border-luxury-champagne/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{style.icon}</span>
                      <h3 className="font-semibold">{style.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 長さ選択 */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                <Scissors className="w-4 h-4 inline mr-1" />
                長さ
              </Label>
              <RadioGroup 
                value={selectedStyle.length}
                onValueChange={(value) => setSelectedStyle({...selectedStyle, length: value as any})}
                className="flex gap-4"
              >
                {lengthOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="cursor-pointer flex items-center gap-1">
                      <span>{option.icon}</span>
                      {option.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* カラー選択 */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                <Palette className="w-4 h-4 inline mr-1" />
                カラー
              </Label>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                      selectedColor === color.id
                        ? 'border-luxury-champagne bg-luxury-champagne/10'
                        : 'border-gray-200 hover:border-luxury-champagne/50'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* シミュレーション実行ボタン */}
        <Button
          onClick={handleSimulation}
          disabled={isSimulating}
          className="w-full h-14 text-lg"
        >
          {isSimulating ? (
            <>
              <Clock className="w-5 h-5 mr-2 animate-spin" />
              シミュレーション中...（約10秒）
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" />
              シミュレーションを開始
            </>
          )}
        </Button>

        {/* 結果表示 */}
        {simulationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>シミュレーション結果</CardTitle>
              <CardDescription>
                AIが提案するあなたに似合う髪型です（信頼度スコア付き）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="style1" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {simulationResults.map((_, index) => (
                    <TabsTrigger key={index} value={`style${index + 1}`}>
                      スタイル{index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {simulationResults.map((result, index) => (
                  <TabsContent key={index} value={`style${index + 1}`}>
                    <div className="space-y-4">
                      {/* スコアバッジ */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold">{result.description}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.confidence > 0.9 ? 'bg-green-100 text-green-800' :
                          result.confidence > 0.8 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          マッチ度: {Math.round(result.confidence * 100)}%
                        </span>
                      </div>
                      
                      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <Camera className="w-12 h-12 mx-auto mb-2" />
                            <p>シミュレーション画像</p>
                            <p className="text-xs mt-1">（API統合後に表示）</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleDownload(result.imageUrl, index)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          保存
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleShare(result)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          共有
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* 注意事項 */}
        <Card className="bg-luxury-pearl border-luxury-champagne">
          <CardContent className="pt-6 space-y-2">
            <p className="text-sm text-gray-600">
              ※ このシミュレーションは参考イメージです。
            </p>
            <p className="text-sm text-gray-600">
              ※ 実際の仕上がりは髪質や美容師の技術により異なります。
            </p>
            <p className="text-sm text-gray-600">
              ※ プロの美容師にご相談の上、施術をお受けください。
            </p>
          </CardContent>
        </Card>

        {/* 美容師予約への誘導 */}
        <Card className="bg-gradient-to-r from-luxury-champagne/20 to-luxury-rose/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">気に入った髪型が見つかりましたか？</h3>
            <p className="text-sm text-gray-600 mb-4">
              プロの美容師に相談して、理想の髪型を実現しましょう
            </p>
            <Button 
              className="w-full"
              variant="secondary"
              onClick={() => router.push('/stylists')}
            >
              美容師を探す
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}