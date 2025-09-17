'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AdvancedFaceResultProps {
  baseType: string;
  subType: string;
  confidence: number;
  features: {
    symmetry_score?: number;
    face_area_ratio?: number;
    chin_angle?: number;
    cheek_fullness?: number;
    [key: string]: number | undefined;
  };
}

// サブタイプ情報の定義
const subtypeInfo: Record<string, Record<string, {
  name: string;
  description: string;
  characteristics: string[];
  recommendations: {
    hairstyles: string[];
    makeup: string[];
    accessories: string[];
  };
}>> = {
  tamago: {
    standard: {
      name: '標準タイプ',
      description: '教科書的な理想バランス',
      characteristics: ['黄金比に近い縦横比', 'なだらかな顎のライン', '左右対称性が高い'],
      recommendations: {
        hairstyles: ['どんなスタイルも似合う', 'トレンドスタイルに挑戦', '個性的なカットもOK'],
        makeup: ['ナチュラルメイクが映える', 'ポイントメイクで遊べる', '骨格を活かしたメイク'],
        accessories: ['シンプルなアクセサリー', '大ぶりのピアスも似合う', '眼鏡の選択肢が広い']
      }
    },
    compact: {
      name: '小顔タイプ',
      description: '全体的に小さめでコンパクト',
      characteristics: ['顔のパーツが中心に集まっている', '全体的に小ぶり', 'キュートな印象'],
      recommendations: {
        hairstyles: ['ショートヘア', 'コンパクトなボブ', 'ピクシーカット'],
        makeup: ['目を大きく見せるメイク', 'リップで存在感を', 'ハイライトで立体感'],
        accessories: ['小ぶりなアクセサリー', '華奢なネックレス', '小さめの眼鏡フレーム']
      }
    },
    elegant: {
      name: 'エレガントタイプ',
      description: 'やや面長寄りで上品な印象',
      characteristics: ['縦のラインが美しい', '鼻筋が通っている', '大人っぽい雰囲気'],
      recommendations: {
        hairstyles: ['ロングヘア', 'ローポニーテール', 'サイドパート'],
        makeup: ['横のラインを意識', 'チークは横長に', '眉は平行気味に'],
        accessories: ['縦長のピアス', 'Y字ネックレス', 'クラシックな眼鏡']
      }
    },
    cute: {
      name: 'キュートタイプ',
      description: 'やや丸顔寄りで可愛らしい',
      characteristics: ['頬がふっくら', '柔らかい印象', '若々しい雰囲気'],
      recommendations: {
        hairstyles: ['ふんわりカール', 'エアリーボブ', '前髪あり'],
        makeup: ['ピンク系メイク', 'ふんわりチーク', 'つやリップ'],
        accessories: ['丸みのあるアクセサリー', 'パールのピアス', '丸眼鏡も似合う']
      }
    },
    sharp: {
      name: 'シャープタイプ',
      description: '顎がややシャープで都会的',
      characteristics: ['顎のラインがシャープ', 'クールな印象', 'モダンな雰囲気'],
      recommendations: {
        hairstyles: ['ストレートヘア', 'ワンレングス', 'センターパート'],
        makeup: ['クールトーンメイク', 'シャープな眉', 'マットリップ'],
        accessories: ['幾何学的デザイン', 'シルバーアクセサリー', 'スクエア眼鏡']
      }
    }
  },
  maru: {
    baby_face: {
      name: 'ベビーフェイスタイプ',
      description: '童顔で年齢より若く見える',
      characteristics: ['大きな目', '小さな鼻', 'ぷっくりした唇'],
      recommendations: {
        hairstyles: ['ショートボブ', 'ゆるふわパーマ', 'シースルーバング'],
        makeup: ['ナチュラルメイク', '血色感重視', 'グロッシーリップ'],
        accessories: ['華奢なアクセサリー', 'リボンモチーフ', '大きめ眼鏡で知的に']
      }
    },
    plump: {
      name: 'ぽっちゃりタイプ',
      description: '頬の膨らみが特に目立つ',
      characteristics: ['ふっくらした頬', '優しい印象', '健康的な雰囲気'],
      recommendations: {
        hairstyles: ['レイヤーカット', 'サイドにボリューム', '長め前髪'],
        makeup: ['シェーディングで輪郭修正', 'ハイライトで立体感', 'ヌードリップ'],
        accessories: ['縦長デザイン', '長めのピアス', 'V字ネックレス']
      }
    },
    compact: {
      name: '小顔タイプ',
      description: '顔は丸いが全体的に小さい',
      characteristics: ['小さくまとまっている', 'バランスが良い', '可愛らしい印象'],
      recommendations: {
        hairstyles: ['ショートヘア', '外ハネボブ', 'マッシュルームカット'],
        makeup: ['メリハリメイク', 'はっきりした色使い', '目力アップ'],
        accessories: ['存在感のあるアクセサリー', '太めのチェーン', 'ボリュームピアス']
      }
    },
    cheekbone: {
      name: '頬骨タイプ',
      description: '頬骨が発達している',
      characteristics: ['頬骨が高い', '立体的な顔立ち', '印象的な横顔'],
      recommendations: {
        hairstyles: ['サイドを軽く', '顎ラインのレイヤー', '斜め前髪'],
        makeup: ['頬骨下にシェーディング', '上部にハイライト', 'グラデーションメイク'],
        accessories: ['シンプルなデザイン', '小ぶりなピアス', 'フープピアス避ける']
      }
    },
    feminine: {
      name: 'フェミニンタイプ',
      description: '柔らかい印象が強い',
      characteristics: ['曲線的なライン', '優しい表情', '女性らしい雰囲気'],
      recommendations: {
        hairstyles: ['ゆるウェーブ', 'フェミニンボブ', '流し前髪'],
        makeup: ['ピンクブラウンメイク', 'ふんわりアイメイク', 'グロスリップ'],
        accessories: ['フェミニンなデザイン', 'パール', 'フラワーモチーフ']
      }
    }
  },
  shikaku: {
    prominent_jaw: {
      name: 'エラ張りタイプ',
      description: 'エラが特に目立つ',
      characteristics: ['強い顎のライン', '意志の強い印象', '個性的な顔立ち'],
      recommendations: {
        hairstyles: ['顎周りに動き', 'サイドにボリューム', 'ひし形シルエット'],
        makeup: ['エラにシェーディング', 'Tゾーンハイライト', '横長チーク'],
        accessories: ['丸みのあるデザイン', 'ドロップ型ピアス', 'カーブのあるフレーム']
      }
    },
    masculine: {
      name: '男顔タイプ',
      description: '骨格がしっかり、クールな印象',
      characteristics: ['直線的なライン', '骨格がしっかり', 'クールビューティー'],
      recommendations: {
        hairstyles: ['ロングストレート', 'かきあげヘア', 'オールバック'],
        makeup: ['フェミニンメイクで中和', '曲線的な眉', 'つやめきリップ'],
        accessories: ['女性らしいデザイン', 'ドロップピアス', '華奢なネックレス']
      }
    },
    compact: {
      name: 'コンパクトタイプ',
      description: '四角いが小さめ',
      characteristics: ['小さくまとまっている', '顎がシャープ', 'キリッとした印象'],
      recommendations: {
        hairstyles: ['ショートボブ', '前下がりボブ', 'アシメカット'],
        makeup: ['縦長効果のメイク', 'シャープなアイライン', 'ポイントリップ'],
        accessories: ['縦のラインを強調', '長めネックレス', 'ティアドロップ型']
      }
    },
    wide: {
      name: 'ワイドタイプ',
      description: '横幅が広い',
      characteristics: ['横に広がった印象', '安定感がある', '頼もしい雰囲気'],
      recommendations: {
        hairstyles: ['トップにボリューム', 'Iラインシルエット', 'センターパート'],
        makeup: ['縦長メイク', 'ノーズシャドウ', 'リップは中心に'],
        accessories: ['縦長デザイン', 'Y字ネックレス', 'オーバル眼鏡']
      }
    },
    soft: {
      name: 'ソフトタイプ',
      description: '角張っているが柔らかい印象',
      characteristics: ['優しい雰囲気', '親しみやすい', '温かみがある'],
      recommendations: {
        hairstyles: ['ソフトウェーブ', '内巻きボブ', 'ふんわり前髪'],
        makeup: ['暖色系メイク', 'ふんわりチーク', '自然な仕上がり'],
        accessories: ['曲線的デザイン', 'パール', '丸みのある眼鏡']
      }
    }
  },
  heart: {
    sharp_chin: {
      name: 'シャープタイプ',
      description: '顎が特に細い',
      characteristics: ['顎が尖っている', 'シャープな印象', 'クールな雰囲気'],
      recommendations: {
        hairstyles: ['顎周りにボリューム', 'ゆるカール', 'サイドパート'],
        makeup: ['顎にハイライト', '丸みのあるチーク', 'ふっくらリップ'],
        accessories: ['丸みのあるデザイン', 'フープピアス', 'ラウンド眼鏡']
      }
    },
    wide_forehead: {
      name: '額広タイプ',
      description: '額が特に広い',
      characteristics: ['広い額', '知的な印象', 'バランスの取れた顔立ち'],
      recommendations: {
        hairstyles: ['前髪あり', 'サイドバング', '斜め前髪'],
        makeup: ['額にシェーディング', '眉下ハイライト', '横長アイメイク'],
        accessories: ['横のラインを強調', 'チョーカー', '横長フレーム']
      }
    },
    cheekbone: {
      name: '頬骨タイプ',
      description: '頬骨が張っている',
      characteristics: ['頬骨が目立つ', '立体的', '個性的な美しさ'],
      recommendations: {
        hairstyles: ['レイヤーカット', '頬にかかる髪', '動きのあるスタイル'],
        makeup: ['頬骨活かしメイク', 'グラデーションチーク', 'ツヤ肌'],
        accessories: ['シンプルデザイン', '長めピアス', '縦ライン強調']
      }
    },
    petite: {
      name: '小顔タイプ',
      description: '全体的に小さく華奢',
      characteristics: ['小さくまとまっている', '繊細な印象', '可憐な雰囲気'],
      recommendations: {
        hairstyles: ['コンパクトなスタイル', 'ショートヘア', '軽やかなボブ'],
        makeup: ['繊細なメイク', '薄づきカラー', 'ナチュラル仕上げ'],
        accessories: ['華奢なデザイン', '小ぶりピアス', '繊細なチェーン']
      }
    },
    balanced: {
      name: 'バランスタイプ',
      description: '比較的バランスが良い',
      characteristics: ['調和の取れた顔立ち', '親しみやすい', '自然な美しさ'],
      recommendations: {
        hairstyles: ['様々なスタイルに挑戦', 'ナチュラルヘア', '流行スタイル'],
        makeup: ['トレンドメイク', '季節感のある色', 'バランス重視'],
        accessories: ['TPOに合わせて', '多様なデザイン', 'お好みで選択']
      }
    }
  },
  omochou: {
    slender: {
      name: 'スレンダータイプ',
      description: '全体的に細長い',
      characteristics: ['細面', 'スッキリした印象', 'モダンな雰囲気'],
      recommendations: {
        hairstyles: ['サイドボリューム', 'ウェーブヘア', 'ワイドバング'],
        makeup: ['横幅を意識', 'チークは横に', '眉は水平に'],
        accessories: ['横のライン強調', 'フープピアス', 'ワイドな眼鏡']
      }
    },
    elegant: {
      name: 'エレガントタイプ',
      description: '上品な縦長',
      characteristics: ['品のある顔立ち', '洗練された印象', '大人の魅力'],
      recommendations: {
        hairstyles: ['ミディアムヘア', 'ローレイヤー', 'サイドパート'],
        makeup: ['上品メイク', '控えめカラー', 'マットな質感'],
        accessories: ['上質なデザイン', '一粒ダイヤ', 'シンプルな眼鏡']
      }
    },
    narrow_forehead: {
      name: '額狭タイプ',
      description: '額が狭く顎が長い',
      characteristics: ['額が狭い', '顎が長め', '個性的なバランス'],
      recommendations: {
        hairstyles: ['トップボリューム', '立ち上げ前髪', 'ポンパドール'],
        makeup: ['額を広く見せる', 'Tゾーンハイライト', '顎シェーディング'],
        accessories: ['上部にポイント', 'カチューシャ', 'ヘアアクセサリー']
      }
    },
    long_midface: {
      name: '頬長タイプ',
      description: '頬の部分が特に長い',
      characteristics: ['中顔面が長い', '落ち着いた印象', '大人っぽい'],
      recommendations: {
        hairstyles: ['頬骨ラインでカット', '横の動き', 'レイヤーボブ'],
        makeup: ['頬骨にチーク', '横グラデ', '目と口を強調'],
        accessories: ['頬骨ラインに', '横長ピアス', 'アイキャッチな眼鏡']
      }
    },
    long_chin: {
      name: '顎長タイプ',
      description: '顎が特に長い',
      characteristics: ['顎が長め', '意志の強い印象', '個性的な美しさ'],
      recommendations: {
        hairstyles: ['顎ラインボブ', '内巻きヘア', '顔周りレイヤー'],
        makeup: ['顎を短く見せる', '下部シェーディング', 'リップ控えめ'],
        accessories: ['上部にポイント', 'イヤーカフ', '上向きデザイン']
      }
    }
  }
};

export default function AdvancedFaceResult({ 
  baseType, 
  subType, 
  confidence,
  features 
}: AdvancedFaceResultProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // 基本顔型の日本語名
  const baseTypeNames: Record<string, string> = {
    tamago: '卵型',
    maru: '丸顔',
    shikaku: '四角顔',
    heart: 'ハート型',
    omochou: '面長'
  };

  const currentSubtype = subtypeInfo[baseType]?.[subType] || {
    name: '分析中',
    description: '詳細な分析を実行中です',
    characteristics: [],
    recommendations: { hairstyles: [], makeup: [], accessories: [] }
  };

  // 特徴量の表示用フォーマット
  const formatFeature = (key: string, value: number | undefined): string => {
    if (value === undefined) return '-';
    
    const featureNames: Record<string, string> = {
      symmetry_score: '対称性',
      face_area_ratio: '顔の大きさ',
      chin_angle: '顎の角度',
      cheek_fullness: '頬の膨らみ',
      cheekbone_prominence: '頬骨の高さ',
      jawline_sharpness: '顎のシャープさ',
      eye_size_ratio: '目の大きさ',
      nose_size_ratio: '鼻の大きさ',
      forehead_width_ratio: '額の広さ'
    };

    const name = featureNames[key] || key;
    const percentage = Math.round(value * 100);
    
    return `${name}: ${percentage}%`;
  };

  return (
    <div className="space-y-6">
      {/* メイン結果カード */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {baseTypeNames[baseType]} × {currentSubtype.name}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {currentSubtype.description}
              </CardDescription>
            </div>
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              マッチ度 {Math.round(confidence * 100)}%
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 詳細情報タブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Target className="w-4 h-4 mr-2" />
            特徴
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Sparkles className="w-4 h-4 mr-2" />
            おすすめ
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <TrendingUp className="w-4 h-4 mr-2" />
            詳細分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>あなたの顔の特徴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSubtype.characteristics.map((char, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-gray-700">{char}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6 space-y-4">
          {/* 髪型 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">おすすめの髪型</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentSubtype.recommendations.hairstyles.map((style, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span>{style}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* メイク */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">メイクのポイント</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentSubtype.recommendations.makeup.map((tip, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-pink-500">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* アクセサリー */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">アクセサリー選び</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentSubtype.recommendations.accessories.map((acc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span>{acc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>詳細な分析データ</CardTitle>
              <CardDescription>
                AIが検出したあなたの顔の詳細な特徴量
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(features).map(([key, value]) => (
                  value !== undefined && (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{formatFeature(key, value)}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${Math.min(value * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>プロからのアドバイス</AlertTitle>
            <AlertDescription>
              これらの分析結果は参考値です。実際のスタイリングでは、
              あなたの好みやライフスタイルも考慮することが大切です。
              プロの美容師に相談する際の参考にしてください。
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}