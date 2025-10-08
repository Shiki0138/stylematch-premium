import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator, Platform } from 'react-native';

console.log('=== APP.JS LOADED - NEW VERSION 2024-10-08 ===');
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';

// スタイルオプション（nanobanana.tsxから抽出）
const cutOptions = [
  { id: 'airy_short', name: 'エアリーショート', mood: '軽やか＆カジュアル' },
  { id: 'polish_bob', name: 'つやつやボブ', mood: '上品＆大人かわいい' },
  { id: 'midi_wolf', name: 'レイヤーミディ', mood: '動きのあるナチュラル感' },
  { id: 'soft_long', name: 'うるつやロング', mood: 'フェミニン＆王道' },
];

const colorOptions = [
  { id: 'natural_black', name: 'ナチュラルブラック', vibe: '艶のあるシンプルなブラックで王道クールに' },
  { id: 'milk_tea', name: 'ミルクティーブラウン', vibe: 'やわらかな印象で親しみやすく' },
  { id: 'ash_gray', name: 'アッシュグレー', vibe: '洗練された大人の魅力' },
  { id: 'chocolate', name: 'チョコレートブラウン', vibe: '温かみがあり上品な印象' },
  { id: 'honey_blonde', name: 'ハニーブロンド', vibe: '明るく華やかな印象' },
  { id: 'rose_gold', name: 'ローズゴールド', vibe: 'フェミニンで上品' },
  { id: 'dark_brown', name: 'ダークブラウン', vibe: '自然で美しい艶感' },
  { id: 'caramel', name: 'キャラメルブラウン', vibe: '甘く優しい印象' },
  { id: 'ash_beige', name: 'アッシュベージュ', vibe: '透明感のある軽やかさ' },
  { id: 'burgundy', name: 'バーガンディ', vibe: '個性的で大人っぽい' },
];

const textureOptions = [
  { id: 'straight_gloss', name: 'ストレートツヤ', feel: 'まっすぐでツヤのある髪質' },
  { id: 'loose_wave', name: 'ゆるふわウェーブ', feel: 'やわらかくふんわりした質感' },
  { id: 'korean_perm', name: '韓国風パーマ', feel: 'トレンドの韓国スタイル' },
];

const backgroundOptions = [
  { id: 'none', name: '編集なし', description: '背景はそのまま' },
  { id: 'indoor', name: '室内', description: 'おしゃれな室内背景' },
  { id: 'outdoor', name: '屋外', description: '自然な屋外背景' },
];

// プラン別制限設定
const planLimits = {
  basic: { maxUsage: 3, name: 'ベーシック' },
  premium: { maxUsage: 10, name: 'プレミアム' },
  unlimited: { maxUsage: Infinity, name: '無制限' }
};

// 実際のGemini API統合サービス
import { requestStyleBlend, analyzeFaceShape } from './src/services/geminiBridge';

class StyleBlendService {
  static async processStyleBlend(imageUri, selectedCut, selectedColor, selectedTexture, selectedBackground = 'none') {
    console.log('=== StyleBlendService.processStyleBlend START ===');
    console.log('Input params:', { selectedCut, selectedColor, selectedTexture, selectedBackground });
    console.log('Image URI length:', imageUri ? imageUri.length : 'null');
    
    try {
      console.log('=== GEMINI API CALL START ===');
      console.log('API Key exists:', process.env.EXPO_PUBLIC_GEMINI_API_KEY ? 'YES' : 'NO');
      console.log('Enable Mocks:', process.env.EXPO_PUBLIC_ENABLE_MOCKS);
      console.log('Image URI type:', typeof imageUri);
      console.log('Image URI length:', imageUri ? imageUri.length : 'null');
      console.log('Attempting Gemini API call...');
      
      // 実際のGemini API呼び出し
      const result = await requestStyleBlend({
        userImage: imageUri,
        cut: selectedCut,
        color: selectedColor,
        texture: selectedTexture,
        background: selectedBackground,
        promptSummary: `${selectedCut}×${selectedColor}×${selectedTexture}×背景${selectedBackground}`,
        promptInstructions: `顔型に合わせて自然に調整し、${selectedCut}の特徴を活かしつつ${selectedColor}で美しく仕上げてください。`
      });
      
      console.log('=== GEMINI API RESULT ===');
      console.log('Result success:', result.success);
      console.log('Result fusionImage exists:', result.fusionImage ? 'YES' : 'NO');
      console.log('Result fusionImage length:', result.fusionImage ? result.fusionImage.length : 0);
      console.log('Full result:', result);
      
      if (result.success && result.fusionImage) {
        console.log('Gemini API succeeded, returning result');
        return {
          success: true,
          fusionImageUri: result.fusionImage,
          narrative: result.narrative,
          styleDescription: {
            cut: selectedCut,
            color: selectedColor,
            texture: selectedTexture,
            confidence: 95
          }
        };
      } else {
        console.log('Gemini API failed or returned no image, falling back to mock');
        throw new Error('No valid image returned from API');
      }
    } catch (error) {
      console.error('=== GEMINI API ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', error);
      
      // エラーを再投げして詳細を確認
      throw error;
    }
  }


  static async analyzeFace(imageUri) {
    try {
      // 顔型分析のフォールバック
      const mockRecommendations = {
        round: {
          cuts: ['エアリーショート', 'レイヤーミディ'],
          colors: ['アッシュグレー', 'ミルクティーブラウン'],
          textures: ['ゆるふわウェーブ', '韓国風パーマ'],
          reasoning: '丸顔には縦のラインを強調するスタイルがおすすめです。'
        },
        oval: {
          cuts: ['つやつやボブ', 'うるつやロング'],
          colors: ['ナチュラルブラック', 'チョコレートブラウン'],
          textures: ['ストレートツヤ', 'ゆるふわウェーブ'],
          reasoning: '理想的な顔型なので、どんなスタイルでも似合います。'
        }
      };
      
      const randomShape = Math.random() > 0.5 ? 'round' : 'oval';
      const rec = mockRecommendations[randomShape];
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            faceShape: randomShape,
            confidence: 0.88,
            recommendations: rec
          });
        }, 2000);
      });
    } catch (error) {
      throw new Error('顔型分析に失敗しました');
    }
  }
}

export default function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [legacySelectedImage, setLegacySelectedImage] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'mode_select', 'analysis', 'style', 'result'
  const [selectedMode, setSelectedMode] = useState(null); // 'diagnosis' or 'custom'
  const [selectedCut, setSelectedCut] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedTexture, setSelectedTexture] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [styleResult, setStyleResult] = useState(null);
  const [faceAnalysis, setFaceAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState('none'); // 'none', 'indoor', 'outdoor'
  const [userPlan, setUserPlan] = useState('basic'); // 'basic', 'premium', 'unlimited'
  const [usageCount, setUsageCount] = useState(0);
  const [maintenanceInfo, setMaintenanceInfo] = useState(null);

  const selectedImage = capturedImage?.previewUri || legacySelectedImage || capturedImage?.fileUri || null;

  const preparePreviewImage = async ({ base64Data = null, originalUri = null, dataUri = null } = {}) => {
    if (Platform.OS === 'web') {
      const previewUri = dataUri || (base64Data ? `data:image/jpeg;base64,${base64Data}` : originalUri);
      const payload = {
        previewUri: previewUri || null,
        base64: base64Data || (dataUri ? dataUri.split(',')[1] : null),
        fileUri: originalUri || null,
      };
      setCapturedImage(payload);
      setLegacySelectedImage(payload.previewUri);
      setShowCamera(false);
      setCurrentScreen('mode_select');
      return;
    }

    const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
    if (!cacheDir) {
      const fallbackPreview = dataUri || (base64Data ? `data:image/jpeg;base64,${base64Data}` : originalUri);
      const payload = { previewUri: fallbackPreview || null, base64: base64Data || null, fileUri: originalUri || null };
      setCapturedImage(payload);
      setLegacySelectedImage(payload.previewUri);
      setShowCamera(false);
      setCurrentScreen('mode_select');
      return;
    }

    const targetPath = `${cacheDir}stylematch-${Date.now()}.jpg`;
    let previewUri = dataUri || null;
    let fileUri = null;

    try {
      if (base64Data) {
        await FileSystem.writeAsStringAsync(targetPath, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        previewUri = targetPath;
        fileUri = targetPath;
      } else if (originalUri) {
        await FileSystem.copyAsync({ from: originalUri, to: targetPath });
        previewUri = targetPath;
        fileUri = targetPath;
      }
    } catch (error) {
      console.warn('Failed to cache preview image', error);
      previewUri = dataUri || originalUri || null;
      fileUri = originalUri || null;
    }

    const payload = {
      previewUri,
      base64: base64Data || null,
      fileUri,
    };
    setCapturedImage(payload);
    setLegacySelectedImage(payload.previewUri);
    setShowCamera(false);
    setCurrentScreen('mode_select');
  };

  const handleCameraPress = async () => {
    if (!permission) return;
    if (!permission.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        Alert.alert('カメラ許可が必要です', 'StyleMatchはヘアスタイル分析にカメラを使用します');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) {
      Alert.alert('エラー', 'カメラの初期化に失敗しました。もう一度お試しください。');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        Alert.alert('エラー', '写真の取得に失敗しました。もう一度お試しください。');
        return;
      }

      let base64Data = photo.base64;
      if (!base64Data) {
        try {
          base64Data = await FileSystem.readAsStringAsync(photo.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (fsError) {
          console.warn('Failed to read captured photo as base64', fsError);
        }
      }

      await preparePreviewImage({ base64Data, originalUri: photo.uri });
    } catch (error) {
      console.error('Failed to capture photo', error);
      Alert.alert('エラー', '写真の撮影に失敗しました。もう一度お試しください。');
    }
  };

  const handleImagePicker = async () => {
    // Web環境での画像選択
    if (typeof window !== 'undefined' && window.document) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const dataUri = typeof event.target?.result === 'string' ? event.target.result : null;
            const base64Match = dataUri && dataUri.match(/^data:image\/[^;]+;base64,(.+)$/);
            await preparePreviewImage({
              base64Data: base64Match ? base64Match[1] : null,
              dataUri,
            });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    // モバイル環境での画像選択
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('フォトライブラリ許可が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const assetUri = asset.uri || null;
      let base64Data = asset.base64 || null;

      if (!base64Data && assetUri && Platform.OS !== 'web') {
        try {
          base64Data = await FileSystem.readAsStringAsync(assetUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (fsError) {
          console.warn('Failed to read picked image as base64', fsError);
        }
      }

      if (!base64Data && !assetUri) {
        Alert.alert('エラー', '画像の読み込みに失敗しました。別の画像でお試しください。');
        return;
      }

      const dataUri = Platform.OS === 'web' && base64Data
        ? `data:image/jpeg;base64,${base64Data}`
        : null;

      await preparePreviewImage({
        base64Data,
        originalUri: assetUri,
        dataUri,
      });
    }
  };

  const renderCapturedImage = () => {
    const previewUri = capturedImage?.previewUri || capturedImage?.fileUri || null;

    return (
      <View style={styles.selectedImageContainer}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.selectedImage} />
        ) : (
          <View style={styles.demoImagePlaceholder}>
            <Text style={styles.demoImageText}>📸 撮影した写真</Text>
          </View>
        )}
      </View>
    );
  };

  const handleStyleBlend = async () => {
    console.log('=== handleStyleBlend START ===');
    console.log('Selected options:', { selectedCut, selectedColor, selectedTexture });
    console.log('capturedImage:', capturedImage);
    
    if (!selectedCut || !selectedColor || !selectedTexture) {
      Alert.alert('選択してください', 'カット、カラー、テクスチャをすべて選択してください');
      return;
    }

    if (!capturedImage) {
      Alert.alert('エラー', 'まず写真を撮影してください。');
      return;
    }

    // 使用制限チェック
    if (!checkUsageLimit()) {
      const limit = planLimits[userPlan];
      Alert.alert('使用制限', `${limit.name}プランの月間制限（${limit.maxUsage}回）に達しました。プレミアムプランにアップグレードをご検討ください。`);
      return;
    }

    setIsProcessing(true);
    try {
      let base64Data = capturedImage?.base64 || null;

      if (!base64Data && capturedImage?.fileUri) {
        console.log('Reading base64 from fileUri...');
        try {
          base64Data = await FileSystem.readAsStringAsync(capturedImage.fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log('Successfully read base64 from file');
        } catch (fsError) {
          console.warn('Failed to read image for style blend', fsError);
        }
      }

      if (!base64Data) {
        Alert.alert('エラー', '写真の取得に失敗しました。撮影からやり直してください。');
        setIsProcessing(false);
        return;
      }

      const dataUri = `data:image/jpeg;base64,${base64Data}`;
      console.log('Preparing to call StyleBlendService with dataUri length:', dataUri.length);

      // capturedImageを更新
      setCapturedImage((prev) => {
        if (!prev) return prev;
        const previewUri = prev.previewUri || dataUri;
        setLegacySelectedImage(previewUri);
        console.log('Updated capturedImage with previewUri');
        return { ...prev, base64: base64Data, previewUri };
      });

      const result = await StyleBlendService.processStyleBlend(
        dataUri,
        selectedCut,
        selectedColor,
        selectedTexture,
        selectedBackground
      );
      
      console.log('StyleBlendService result:', result);
      
      // メンテナンス情報を生成
      const maintenance = generateMaintenanceInfo(selectedCut, selectedColor, selectedTexture);
      setMaintenanceInfo(maintenance);
      
      // 使用回数を増加
      setUsageCount(prev => prev + 1);
      
      setStyleResult(result);
      setCurrentScreen('result');
      setIsProcessing(false);
    } catch (error) {
      console.error('handleStyleBlend error:', error);
      setIsProcessing(false);
      Alert.alert('エラー', 'スタイル合成に失敗しました: ' + error.message);
    }
  };

  const handleSaveResult = async () => {
    try {
      if (!styleResult?.fusionImageUri) {
        Alert.alert('エラー', '保存する画像がありません');
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('エラー', '写真を保存するには、フォトライブラリへのアクセス許可が必要です');
        return;
      }

      // Base64画像をファイルに保存
      const timestamp = Date.now();
      const filename = `stylematch_${timestamp}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Base64データを抽出
      const base64Data = styleResult.fusionImageUri.split(',')[1] || styleResult.fusionImageUri;
      
      // ファイルに書き込み
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // 写真ライブラリに保存
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('StyleMatch', asset, false);
      
      Alert.alert('保存完了', 'スタイル結果が写真ライブラリに保存されました！');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('エラー', '保存に失敗しました: ' + error.message);
    }
  };

  const handleFaceAnalysis = async () => {
    if (!capturedImage) {
      Alert.alert('エラー', 'まず写真を撮影してください。');
      return;
    }
    
    let base64Data = capturedImage?.base64 || null;
    if (!base64Data && capturedImage?.fileUri) {
      try {
        base64Data = await FileSystem.readAsStringAsync(capturedImage.fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (fsError) {
        console.warn('Failed to read image for face analysis', fsError);
      }
    }

    if (!base64Data) {
      Alert.alert('エラー', '画像の読み込みに失敗しました。撮影からやり直してください。');
      return;
    }

    setIsAnalyzing(true);
    try {
      setCapturedImage((prev) => {
        if (!prev) return prev;
        const previewUri = prev.previewUri || `data:image/jpeg;base64,${base64Data}`;
        setLegacySelectedImage(previewUri);
        return { ...prev, base64: base64Data, previewUri };
      });
      const analysis = await StyleBlendService.analyzeFace(`data:image/jpeg;base64,${base64Data}`);
      setFaceAnalysis(analysis);
      
      // 推薦に基づいて初期選択を設定
      if (analysis.recommendations) {
        const rec = analysis.recommendations;
        if (rec.cuts && rec.cuts.length > 0) {
          const recommendedCut = cutOptions.find(cut => 
            rec.cuts.some(recCut => cut.name.includes(recCut) || recCut.includes(cut.name))
          );
          if (recommendedCut) setSelectedCut(recommendedCut.name);
        }
        if (rec.colors && rec.colors.length > 0) {
          const recommendedColor = colorOptions.find(color => 
            rec.colors.some(recColor => color.name.includes(recColor) || recColor.includes(color.name))
          );
          if (recommendedColor) setSelectedColor(recommendedColor.name);
        }
        if (rec.textures && rec.textures.length > 0) {
          const recommendedTexture = textureOptions.find(texture => 
            rec.textures.some(recTexture => texture.name.includes(recTexture) || recTexture.includes(texture.name))
          );
          if (recommendedTexture) setSelectedTexture(recommendedTexture.name);
        }
      }
    } catch (error) {
      Alert.alert('分析エラー', '顔型分析に失敗しました。手動でスタイルを選択してください。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetToHome = () => {
    setCurrentScreen('home');
    setCapturedImage(null);
    setLegacySelectedImage(null);
    setSelectedMode(null);
    setSelectedCut(null);
    setSelectedColor(null);
    setSelectedTexture(null);
    setStyleResult(null);
    setFaceAnalysis(null);
  };

  const handleImagePress = (imageUri) => {
    setModalImage(imageUri);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImage(null);
  };

  // メンテナンス情報生成
  const generateMaintenanceInfo = (cut, color, texture) => {
    const cutMaintenance = {
      'つやつやボブ': { duration: '2-3ヶ月', care: '毛先のトリートメントが重要', frequency: '6-8週間ごと' },
      'レイヤーミディ': { duration: '3-4ヶ月', care: 'スタイリング剤でボリュームキープ', frequency: '8-10週間ごと' },
      'うるつやロング': { duration: '4-5ヶ月', care: '定期的な毛先カットと保湿', frequency: '10-12週間ごと' }
    };
    
    const colorMaintenance = {
      'ナチュラルブラック': { duration: '4-6ヶ月', care: 'カラー用シャンプーで色持ち向上' },
      'ミルクティーブラウン': { duration: '2-3ヶ月', care: '紫シャンプーで黄ばみ防止' },
      'アッシュグレー': { duration: '2-3ヶ月', care: 'シルバーシャンプーでトーン維持' },
      'ハニーブロンド': { duration: '2-3ヶ月', care: '紫シャンプーと保湿重視' },
      'ローズゴールド': { duration: '2-3ヶ月', care: 'ピンク系シャンプーで色補正' }
    };

    const cutInfo = cutMaintenance[cut] || { duration: '3-4ヶ月', care: '定期的なカット', frequency: '8-10週間ごと' };
    const colorInfo = colorMaintenance[color] || { duration: '3-4ヶ月', care: 'カラー用ヘアケア' };

    return {
      style: `${cut} × ${color} × ${texture}`,
      duration: `美しい状態: ${Math.min(parseInt(cutInfo.duration), parseInt(colorInfo.duration))}ヶ月`,
      maintenance: [
        `✂️ カット: ${cutInfo.frequency}にサロンメンテナンス`,
        `🎨 カラー: ${colorInfo.care}`,
        `💆‍♀️ ケア: ${cutInfo.care}`,
        '🌟 毎日: 熱保護スプレー使用推奨',
        '💧 週1-2回: ディープトリートメント'
      ],
      tips: [
        '朝のスタイリングは濡らしてから',
        'ドライヤーは低温で根元から',
        '就寝前は軽くブラッシング',
        '月1回のサロントリートメント推奨'
      ]
    };
  };

  // プラン制限チェック
  const checkUsageLimit = () => {
    const limit = planLimits[userPlan];
    return usageCount < limit.maxUsage;
  };

  // 別のパターンで再生成
  const handleRegenerate = () => {
    setCurrentScreen('style');
  };

  // 顔型分析中画面
  if (isAnalyzing) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.processingText}>AI 顔型分析中...</Text>
        <Text style={styles.processingSubText}>あなたに似合うヘアスタイルを分析しています</Text>
      </LinearGradient>
    );
  }

  // 処理中画面
  if (isProcessing) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.processingText}>AI スタイル合成中...</Text>
        <Text style={styles.processingSubText}>あなただけのヘアスタイルを生成しています</Text>
      </LinearGradient>
    );
  }

  // 分析結果画面
  if (currentScreen === 'analysis' && capturedImage) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView style={styles.styleContainer}>
          <View style={styles.styleHeader}>
            <Text style={styles.styleTitle}>顔型分析</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('mode_select')}>
              <Text style={styles.backButtonText}>← 戻る</Text>
            </TouchableOpacity>
          </View>

          {renderCapturedImage()}

          {faceAnalysis && (
            <View style={styles.analysisResult}>
              <Text style={styles.analysisTitle}>🎯 分析結果</Text>
              <Text style={styles.faceShapeResult}>
                顔型: {faceAnalysis.faceShape} (信頼度: {Math.round(faceAnalysis.confidence * 100)}%)
              </Text>
              
              <Text style={styles.recommendationTitle}>💡 おすすめスタイル</Text>
              <Text style={styles.recommendationText}>{faceAnalysis.recommendations.reasoning}</Text>
              
              <View style={styles.recommendationLists}>
                <Text style={styles.recListTitle}>推奨カット:</Text>
                <Text style={styles.recListItems}>{faceAnalysis.recommendations.cuts.join(', ')}</Text>
                
                <Text style={styles.recListTitle}>推奨カラー:</Text>
                <Text style={styles.recListItems}>{faceAnalysis.recommendations.colors.join(', ')}</Text>
                
                <Text style={styles.recListTitle}>推奨テクスチャ:</Text>
                <Text style={styles.recListItems}>{faceAnalysis.recommendations.textures.join(', ')}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.analyzeButton} 
            onPress={handleFaceAnalysis}
            disabled={isAnalyzing}
          >
            <Text style={styles.analyzeButtonText}>
              {faceAnalysis ? '🔄 再分析' : '🎯 AI顔型分析開始'}
            </Text>
          </TouchableOpacity>

          {faceAnalysis && (
            <TouchableOpacity 
              style={styles.proceedButton}
              onPress={() => setCurrentScreen('style')}
            >
              <Text style={styles.proceedButtonText}>✨ スタイル選択へ進む</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    );
  }

  // モード選択画面
  if (currentScreen === 'mode_select' && capturedImage) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView style={styles.modeContainer}>
          <View style={styles.modeHeader}>
            <Text style={styles.modeTitle}>機能を選択してください</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('mode_select')}>
              <Text style={styles.backButtonText}>← 戻る</Text>
            </TouchableOpacity>
          </View>

          {renderCapturedImage()}

          <View style={styles.modeOptionsContainer}>
            <TouchableOpacity 
              style={[styles.modeOption, styles.diagnosisMode]}
              onPress={() => {
                setSelectedMode('diagnosis');
                setCurrentScreen('analysis');
              }}
            >
              <Text style={styles.modeOptionTitle}>🎯 似合う髪型診断</Text>
              <Text style={styles.modeOptionDescription}>
                AIが顔型を分析してあなたに最適な髪型を推薦します
              </Text>
              <Text style={styles.modeOptionFeatures}>
                ✓ 顔型分析 ✓ スマート推薦 ✓ 理由説明
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modeOption, styles.customMode]}
              onPress={() => {
                setSelectedMode('custom');
                setCurrentScreen('style');
              }}
            >
              <Text style={styles.modeOptionTitle}>🎨 髪型カスタム編集</Text>
              <Text style={styles.modeOptionDescription}>
                好きなスタイルを選んでAIで画像生成・編集します
              </Text>
              <Text style={styles.modeOptionFeatures}>
                ✓ 自由選択 ✓ AI画像生成 ✓ リアルプレビュー
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // 結果画面
  if (currentScreen === 'result' && styleResult) {
    console.log('=== RESULT SCREEN DEBUG ===');
    console.log('capturedImage:', capturedImage);
    console.log('styleResult:', styleResult);
    console.log('legacySelectedImage:', legacySelectedImage);
    
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>✨ スタイル完成！</Text>
            <TouchableOpacity style={styles.backButton} onPress={resetToHome}>
              <Text style={styles.backButtonText}>🏠 ホーム</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.resultImageContainer}>
            <View style={styles.comparisonContainer}>
              <View style={styles.imageSection}>
                <Text style={styles.imageSectionTitle}>元の写真</Text>
                {(() => {
                  const imageUri = capturedImage?.previewUri || legacySelectedImage || capturedImage?.fileUri;
                  console.log('Original image URI to display:', imageUri);
                  return imageUri ? (
                    <Image 
                      source={{ uri: imageUri }} 
                      style={styles.resultImage}
                      onError={(error) => console.error('Original image load error:', error, 'URI:', imageUri)}
                      onLoad={() => console.log('Original image loaded successfully, URI:', imageUri)}
                    />
                  ) : (
                    <View style={styles.mockResultImage}>
                      <Text style={styles.mockImageText}>📷 写真なし</Text>
                    </View>
                  );
                })()}
              </View>
              <View style={styles.imageSection}>
                <Text style={styles.imageSectionTitle}>スタイル後</Text>
                {styleResult.fusionImageUri ? (
                  <TouchableOpacity onPress={() => handleImagePress(styleResult.fusionImageUri)}>
                    <Image 
                      source={{ uri: styleResult.fusionImageUri }} 
                      style={styles.resultImage}
                      onError={(error) => {
                        console.error('Result image load error:', error);
                        console.log('Failed URI:', styleResult.fusionImageUri);
                      }}
                      onLoad={() => console.log('Result image loaded successfully')}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.mockResultImage}>
                    <Text style={styles.mockImageText}>🎨 プレビュー</Text>
                    <Text style={styles.styleConfidence}>AI機能準備中</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.narrativeContainer}>
            <Text style={styles.narrativeText}>{styleResult.narrative}</Text>
          </View>

          <View style={styles.styleDetailsContainer}>
            <Text style={styles.styleDetailsTitle}>選択されたスタイル</Text>
            <Text style={styles.styleDetail}>💇‍♀️ カット: {styleResult.styleDescription.cut}</Text>
            <Text style={styles.styleDetail}>🎨 カラー: {styleResult.styleDescription.color}</Text>
            <Text style={styles.styleDetail}>✨ テクスチャ: {styleResult.styleDescription.texture}</Text>
          </View>

          {/* メンテナンス情報 */}
          {maintenanceInfo && (
            <View style={styles.maintenanceContainer}>
              <Text style={styles.maintenanceTitle}>💇‍♀️ 施術・メンテナンス情報</Text>
              
              <View style={styles.maintenanceSection}>
                <Text style={styles.maintenanceSectionTitle}>🎯 スタイル概要</Text>
                <Text style={styles.maintenanceText}>{maintenanceInfo.style}</Text>
                <Text style={styles.maintenanceText}>{maintenanceInfo.duration}</Text>
              </View>

              <View style={styles.maintenanceSection}>
                <Text style={styles.maintenanceSectionTitle}>🔧 メンテナンス</Text>
                {maintenanceInfo.maintenance.map((item, index) => (
                  <Text key={index} style={styles.maintenanceItem}>• {item}</Text>
                ))}
              </View>

              <View style={styles.maintenanceSection}>
                <Text style={styles.maintenanceSectionTitle}>💡 お手入れのコツ</Text>
                {maintenanceInfo.tips.map((tip, index) => (
                  <Text key={index} style={styles.maintenanceItem}>• {tip}</Text>
                ))}
              </View>
            </View>
          )}

          {/* 使用回数表示 */}
          <View style={styles.usageInfo}>
            <Text style={styles.usageText}>
              今月の使用回数: {usageCount}/{planLimits[userPlan].maxUsage === Infinity ? '∞' : planLimits[userPlan].maxUsage} ({planLimits[userPlan].name})
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerate}>
              <Text style={styles.regenerateButtonText}>🔄 別のパターンで生成する</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveResult}>
              <Text style={styles.saveButtonText}>📱 結果を保存</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 画像拡大モーダル */}
        {showImageModal && (
          <View style={styles.imageModal}>
            <TouchableOpacity style={styles.modalOverlay} onPress={closeImageModal}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={closeImageModal}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Image source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    );
  }

  // スタイル選択画面
  if (currentScreen === 'style') {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView style={styles.styleContainer}>
          <View style={styles.styleHeader}>
            <Text style={styles.styleTitle}>スタイルを選択</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('mode_select')}>
              <Text style={styles.backButtonText}>← 戻る</Text>
            </TouchableOpacity>
          </View>

          {renderCapturedImage()}

          {faceAnalysis && (
            <View style={styles.analysisInfo}>
              <Text style={styles.analysisInfoText}>
                🎯 {faceAnalysis.faceShape}型の顔に最適化された推薦スタイル
              </Text>
            </View>
          )}

          {/* カット選択 */}
          <Text style={styles.optionTitle}>💇‍♀️ カットスタイル</Text>
          <View style={styles.optionsContainer}>
            {cutOptions.map((cut) => (
              <TouchableOpacity
                key={cut.id}
                style={[styles.optionButton, selectedCut === cut.name && styles.selectedOption]}
                onPress={() => setSelectedCut(cut.name)}
              >
                <Text style={styles.optionName}>{cut.name}</Text>
                <Text style={styles.optionMood}>{cut.mood}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* カラー選択 */}
          <Text style={styles.optionTitle}>🎨 ヘアカラー</Text>
          <View style={styles.optionsContainer}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[styles.optionButton, selectedColor === color.name && styles.selectedOption]}
                onPress={() => setSelectedColor(color.name)}
              >
                <Text style={styles.optionName}>{color.name}</Text>
                <Text style={styles.optionMood}>{color.vibe}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* テクスチャ選択 */}
          <Text style={styles.optionTitle}>✨ ヘアテクスチャ</Text>
          <View style={styles.optionsContainer}>
            {textureOptions.map((texture) => (
              <TouchableOpacity
                key={texture.id}
                style={[styles.optionButton, selectedTexture === texture.name && styles.selectedOption]}
                onPress={() => setSelectedTexture(texture.name)}
              >
                <Text style={styles.optionName}>{texture.name}</Text>
                <Text style={styles.optionMood}>{texture.feel}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 背景選択 */}
          <Text style={styles.optionTitle}>🏞️ 背景設定</Text>
          <View style={styles.optionsContainer}>
            {backgroundOptions.map((bg) => (
              <TouchableOpacity
                key={bg.id}
                style={[styles.optionButton, selectedBackground === bg.id && styles.selectedOption]}
                onPress={() => setSelectedBackground(bg.id)}
              >
                <Text style={styles.optionName}>{bg.name}</Text>
                <Text style={styles.optionMood}>{bg.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.blendButton, (!selectedCut || !selectedColor || !selectedTexture) && styles.disabledButton]} 
            onPress={handleStyleBlend}
            disabled={!selectedCut || !selectedColor || !selectedTexture}
          >
            <Text style={styles.blendButtonText}>🎨 スタイル合成実行</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // カメラ画面
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front">
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
              <Text style={styles.cameraButtonText}>撮影</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // ホーム画面
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <Text style={styles.title}>StyleMatch</Text>
      <Text style={styles.subtitle}>AI顔型分析 × スタイル生成</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleCameraPress}>
        <Text style={styles.buttonText}>📸 写真を撮る</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleImagePicker}>
        <Text style={styles.buttonText}>🖼️ ギャラリーから選択</Text>
      </TouchableOpacity>
      
      <Text style={styles.version}>Version 2.0 (AI Complete Edition)</Text>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    marginBottom: 50,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    position: 'absolute',
    bottom: 50,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cameraButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  styleContainer: {
    flex: 1,
  },
  styleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  styleTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: 150,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  demoImagePlaceholder: {
    width: 150,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectedOption: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'white',
    borderWidth: 2,
  },
  optionName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionMood: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  blendButton: {
    backgroundColor: '#ff6b6b',
    margin: 20,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  blendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  processingText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  processingSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 10,
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  resultTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  imageSection: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  imageSectionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mainImageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainImageTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  mainResultImage: {
    width: 280,
    height: 350,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  originalImageSection: {
    alignItems: 'center',
    marginTop: 15,
  },
  originalImageTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  originalImage: {
    width: 80,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  analysisBadge: {
    backgroundColor: 'rgba(34, 139, 34, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#32CD32',
  },
  analysisText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mockResultImage: {
    width: 200,
    height: 250,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  styleConfidence: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
  },
  narrativeContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  narrativeText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  styleDetailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  styleDetailsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  styleDetail: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: '#ff6b6b',
    margin: 20,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  analysisResult: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  analysisTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  faceShapeResult: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recommendationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  recommendationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  recommendationLists: {
    gap: 10,
  },
  recListTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recListItems: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  analyzeButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proceedButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisInfo: {
    backgroundColor: 'rgba(76, 205, 196, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 205, 196, 0.5)',
  },
  analysisInfoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modeContainer: {
    flex: 1,
    padding: 20,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modeOptionsContainer: {
    gap: 20,
    marginTop: 20,
  },
  modeOption: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
  },
  diagnosisMode: {
    borderColor: '#ff6b6b',
  },
  customMode: {
    borderColor: '#4ecdc4',
  },
  modeOptionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modeOptionDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  modeOptionFeatures: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  resultImage: {
    width: 150,
    height: 190,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
  imageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderRadius: 10,
    width: '95%',
    height: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  closeButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  maintenanceContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  maintenanceTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  maintenanceSection: {
    marginBottom: 15,
  },
  maintenanceSectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  maintenanceText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  maintenanceItem: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 3,
  },
  usageInfo: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  usageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  regenerateButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    flex: 0.45,
  },
  regenerateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});