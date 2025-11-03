import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator, Platform, SafeAreaView, Dimensions } from 'react-native';

console.log('=== APP.JS LOADED - NEW VERSION 2024-10-08 ===');
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { forwardRef, useRef, useState } from 'react';

console.log('=== MODULE IMPORT STATUS ===', {
  CameraViewType: typeof CameraView,
  CameraTypeKeys: CameraType ? Object.keys(CameraType).slice(0, 5) : 'undefined',
  useCameraPermissions: typeof useCameraPermissions,
  ImagePicker: ImagePicker ? Object.keys(ImagePicker).slice(0, 5) : 'undefined',
  MediaLibrary: MediaLibrary ? Object.keys(MediaLibrary).slice(0, 5) : 'undefined',
  FileSystem: FileSystem ? Object.keys(FileSystem).slice(0, 5) : 'undefined',
  FileSystemDefault: FileSystem ? typeof FileSystem.default : 'undefined',
  LinearGradient: typeof LinearGradient,
  Linking: Linking ? Object.keys(Linking).slice(0, 5) : 'undefined'
});

if (global.ErrorUtils && !global.__STYLEMATCH_ERROR_PATCHED__) {
  const originalHandler = global.ErrorUtils.getGlobalHandler
    ? global.ErrorUtils.getGlobalHandler()
    : null;
  global.ErrorUtils.setGlobalHandler((err, isFatal) => {
    try {
      console.log('=== GLOBAL ERROR HANDLER ===');
      console.log('Fatal:', isFatal);
      console.log('Name:', err?.name);
      console.log('Message:', err?.message);
      console.log('Stack:', err?.stack);
    } catch (_) {
      // ignore logging failures
    }
    if (originalHandler) {
      originalHandler(err, isFatal);
    }
  });
  global.__STYLEMATCH_ERROR_PATCHED__ = true;
}

// 女性向けスタイルオプション
const femaleCutOptions = [
  { id: 'airy_short', name: 'エアリーショート', mood: '軽やか＆カジュアル' },
  { id: 'polish_bob', name: 'つやつやボブ', mood: '上品＆大人かわいい' },
  { id: 'midi_wolf', name: 'レイヤーミディ', mood: '動きのあるナチュラル感' },
  { id: 'soft_long', name: 'うるつやロング', mood: 'フェミニン＆王道' },
];

// 男性向けスタイルオプション
const maleCutOptions = [
  { id: 'business_short', name: 'ビジネスショート', mood: '清潔感＆プロフェッショナル' },
  { id: 'fade_cut', name: 'フェードカット', mood: 'モダン＆スタイリッシュ' },
  { id: 'undercut', name: 'アンダーカット', mood: 'トレンド＆個性的' },
  { id: 'natural_short', name: 'ナチュラルショート', mood: 'カジュアル＆親しみやすい' },
];

const femaleColorOptions = [
  { id: 'natural_black', name: 'ナチュラルブラック', vibe: '艶のあるシンプルなブラックで王道クールに', bleachRequired: false },
  { id: 'milk_tea', name: 'ミルクティーブラウン', vibe: 'やわらかな印象で親しみやすく', bleachRequired: false },
  { id: 'ash_gray', name: 'アッシュグレー', vibe: '洗練された大人の魅力', bleachRequired: true },
  { id: 'chocolate', name: 'チョコレートブラウン', vibe: '温かみがあり上品な印象', bleachRequired: false },
  { id: 'honey_blonde', name: 'ハニーブロンド', vibe: '明るく華やかな印象', bleachRequired: true },
  { id: 'rose_gold', name: 'ローズゴールド', vibe: 'フェミニンで上品', bleachRequired: true },
  { id: 'dark_brown', name: 'ダークブラウン', vibe: '自然で美しい艶感', bleachRequired: false },
  { id: 'caramel', name: 'キャラメルブラウン', vibe: '甘く優しい印象', bleachRequired: false },
  { id: 'ash_beige', name: 'アッシュベージュ', vibe: '透明感のある軽やかさ', bleachRequired: true },
  { id: 'burgundy', name: 'バーガンディ', vibe: '個性的で大人っぽい', bleachRequired: false },
];

const maleColorOptions = [
  { id: 'natural_black', name: 'ナチュラルブラック', vibe: 'クラシックで上品な印象', bleachRequired: false },
  { id: 'dark_brown', name: 'ダークブラウン', vibe: '自然で落ち着いた印象', bleachRequired: false },
  { id: 'ash_brown', name: 'アッシュブラウン', vibe: 'モダンで洗練された印象', bleachRequired: false },
  { id: 'gray_silver', name: 'グレーシルバー', vibe: 'トレンドで個性的', bleachRequired: true },
  { id: 'chocolate', name: 'チョコレートブラウン', vibe: '温かみのあるビジネス向け', bleachRequired: false },
];

const femaleTextureOptions = [
  { id: 'straight_gloss', name: 'ストレートツヤ', feel: 'まっすぐでツヤのある髪質', restrictsBrightColors: true },
  { id: 'loose_wave', name: 'ゆるふわウェーブ', feel: 'やわらかくふんわりした質感', restrictsBrightColors: false },
  { id: 'korean_perm', name: '韓国風パーマ', feel: 'トレンドの韓国スタイル', restrictsBrightColors: false },
];

const maleTextureOptions = [
  { id: 'natural_straight', name: 'ナチュラルストレート', feel: '自然でビジネス向き', restrictsBrightColors: false },
  { id: 'soft_wave', name: 'ソフトウェーブ', feel: '軽やかで動きのある質感', restrictsBrightColors: false },
  { id: 'textured_cut', name: 'テクスチャードカット', feel: 'モダンで立体的', restrictsBrightColors: false },
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
  unlimited: { maxUsage: Infinity, name: '無制限' },
  tester: { maxUsage: 10, name: 'テスター' }
};

// 実際のGemini API統合サービス
import { requestStyleBlend, analyzeFaceShape } from './src/services/geminiBridge';
import APIMonitor from './src/components/APIMonitor';

// 画面サイズ取得
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const isLargeDevice = screenWidth >= 414;

class StyleBlendService {
  static async processStyleBlend(imageUri, selectedCut, selectedColor, selectedTexture, selectedBackground = 'none', selectedGender = 'female') {
    console.log('=== StyleBlendService.processStyleBlend START ===');
    console.log('=== MALE GENDER PROCESSING DEBUG ===');
    console.log('Input params:', { selectedCut, selectedColor, selectedTexture, selectedBackground, selectedGender });
    console.log('Gender:', selectedGender);
    console.log('Is male processing:', selectedGender === 'male');
    console.log('Image URI length:', imageUri ? imageUri.length : 'null');
    
    try {
      console.log('=== GEMINI API CALL START ===');
      console.log('API Key exists:', process.env.EXPO_PUBLIC_GEMINI_API_KEY ? 'YES' : 'NO');
      console.log('Enable Mocks:', process.env.EXPO_PUBLIC_ENABLE_MOCKS);
      console.log('Image URI type:', typeof imageUri);
      console.log('Image URI length:', imageUri ? imageUri.length : 'null');
      console.log('Attempting Gemini API call...');
      
      // 実際のGemini API呼び出し（性別情報付き）
      const result = await requestStyleBlend({
        userImage: imageUri,
        cut: selectedCut,
        color: selectedColor,
        texture: selectedTexture,
        background: selectedBackground,
        gender: selectedGender,
        promptSummary: `${selectedGender}向け${selectedCut}×${selectedColor}×${selectedTexture}×背景${selectedBackground}`,
        promptInstructions: `${selectedGender === 'male' ? '男性' : '女性'}の顔型に合わせて自然に調整し、${selectedCut}の特徴を活かしつつ${selectedColor}で美しく仕上げてください。`
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
        console.log('Gemini API failed or returned no image, creating fallback result');
        console.log('Selected options:', { selectedCut, selectedColor, selectedTexture });
        
        // フォールバック: 元の画像を使用して性別対応結果を返す
        console.log('Creating fallback result for gender:', selectedGender);
        const genderIcon = selectedGender === 'male' ? '👨‍👼' : '👩‍👼';
        const genderText = selectedGender === 'male' ? '男性向け' : '女性向け';
        
        return {
          success: true,
          fusionImageUri: imageUri, // 元の画像を使用
          narrative: `${genderText}${selectedCut} × ${selectedColor} × ${selectedTexture} のスタイル\n\n${genderIcon} 選択されたスタイルの組み合わせです\n\n🎯 このスタイルの特徴を活かした仕上がりになります`,
          styleDescription: {
            cut: selectedCut,
            color: selectedColor,
            texture: selectedTexture,
            confidence: 80
          }
        };
      }
    } catch (error) {
      console.error('=== GEMINI API ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', error);
      
      // エラー時のフォールバック処理（性別対応）
      console.log('Creating error fallback result for gender:', selectedGender);
      const genderIcon = selectedGender === 'male' ? '👨‍👼' : '👩‍👼';
      const genderText = selectedGender === 'male' ? '男性向け' : '女性向け';
      
      return {
        success: true,
        fusionImageUri: imageUri, // 元の画像を使用
        narrative: `${genderText}${selectedCut} × ${selectedColor} × ${selectedTexture} のスタイル提案\n\n${genderIcon} 選択されたスタイルはトレンドの組み合わせです\n\n💫 完成イメージ: 自然で美しい仕上がりが期待できます`,
        styleDescription: {
          cut: selectedCut,
          color: selectedColor,
          texture: selectedTexture,
          confidence: 75
        }
      };
    }
  }


  static async analyzeFace(imageUri, gender = 'female') {
    console.log('=== FACE ANALYSIS START ===');
    console.log('Gender:', gender);

    const femaleRecommendations = {
      round: {
        cuts: ['エアリーショート', 'レイヤーミディ'],
        colors: ['アッシュグレー', 'ミルクティーブラウン', 'ダークブラウン'],
        textures: ['ゆるふわウェーブ', '韓国風パーマ'],
        reasoning: '丸顔には縦のラインを強調するスタイルがおすすめです。レイヤーで動きを出し、縦の印象を強めましょう。'
      },
      oval: {
        cuts: ['つやつやボブ', 'うるつやロング', 'レイヤーミディ'],
        colors: ['ナチュラルブラック', 'チョコレートブラウン', 'ハニーブロンド'],
        textures: ['ストレートツヤ', 'ゆるふわウェーブ'],
        reasoning: '理想的な顔型なので、どんなスタイルでも似合います。お好みに合わせて選択できます。'
      },
      square: {
        cuts: ['うるつやロング', 'ゆるふわウェーブ'],
        colors: ['ミルクティーブラウン', 'キャラメルブラウン'],
        textures: ['ゆるふわウェーブ', '韓国風パーマ'],
        reasoning: 'エラの張りを和らげるため、丸みのあるスタイルがおすすめです。'
      },
      heart: {
        cuts: ['つやつやボブ', 'レイヤーミディ'],
        colors: ['ローズゴールド', 'アッシュベージュ'],
        textures: ['ゆるふわウェーブ', '韓国風パーマ'],
        reasoning: '額の広さを活かしつつ顎を柔らかく見せるスタイルでバランスを整えましょう。'
      },
      long: {
        cuts: ['レイヤーミディ', 'うるつやロング'],
        colors: ['ナチュラルブラック', 'チョコレートブラウン'],
        textures: ['ストレートツヤ', 'ゆるふわウェーブ'],
        reasoning: '面長には横方向にボリュームを出すレイヤーや柔らかいウェーブが好相性です。'
      }
    };

    const maleRecommendations = {
      round: {
        cuts: ['ビジネスショート', 'フェードカット'],
        colors: ['ナチュラルブラック', 'ダークブラウン'],
        textures: ['ナチュラルストレート', 'テクスチャードカット'],
        reasoning: '丸顔には高さを出すスタイルがおすすめです。サイドを短くして縦のラインを強調しましょう。'
      },
      oval: {
        cuts: ['ナチュラルショート', 'ビジネスショート', 'アンダーカット'],
        colors: ['ナチュラルブラック', 'アッシュブラウン', 'チョコレートブラウン'],
        textures: ['ナチュラルストレート', 'ソフトウェーブ'],
        reasoning: '理想的な顔型です。ビジネスからカジュアルまで幅広いスタイルが似合います。'
      },
      square: {
        cuts: ['ナチュラルショート', 'ソフトウェーブ'],
        colors: ['ダークブラウン', 'アッシュブラウン'],
        textures: ['ソフトウェーブ', 'ナチュラルストレート'],
        reasoning: 'エラの印象を和らげるため、自然な丸みのあるスタイルがおすすめです。'
      },
      heart: {
        cuts: ['フェードカット', 'アンダーカット'],
        colors: ['ナチュラルブラック', 'グレーシルバー'],
        textures: ['テクスチャードカット', 'ソフトウェーブ'],
        reasoning: 'トップにボリュームを集め、顎周りをシャープに見せることで全体のバランスが整います。'
      },
      long: {
        cuts: ['ソフトウェーブ', 'ナチュラルショート'],
        colors: ['ダークブラウン', 'チョコレートブラウン'],
        textures: ['ソフトウェーブ', 'ナチュラルストレート'],
        reasoning: '面長には横方向の動きと束感を意識したスタイルで柔らかさを出しましょう。'
      }
    };

    const recommendationMap = gender === 'male' ? maleRecommendations : femaleRecommendations;
    const defaultShape = 'oval';

    try {
      const analysis = await analyzeFaceShape(imageUri, { timeoutMs: 20000 });
      const faceShape = recommendationMap[analysis.faceShape] ? analysis.faceShape : defaultShape;
      const curated = recommendationMap[faceShape];

      console.log('Face analysis result:', analysis);

      return {
        success: true,
        faceShape,
        confidence: analysis.confidence,
        recommendations: {
          cuts: curated.cuts,
          colors: curated.colors,
          textures: curated.textures,
          reasoning: analysis.recommendations?.reasoning ?? curated.reasoning,
        },
        gender,
        vendorRecommendations: analysis.recommendations,
      };
    } catch (error) {
      console.error('Face analysis error:', error);

      const shapeOptions = Object.keys(recommendationMap);
      const fallbackShape = shapeOptions[Math.floor(Math.random() * shapeOptions.length)] || defaultShape;
      const rec = recommendationMap[fallbackShape];

      return {
        success: false,
        faceShape: fallbackShape,
        confidence: 0.5,
        recommendations: rec,
        gender,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

const resolveCameraType = (facing = 'front') => {
  if (CameraType) {
    return facing === 'front' ? CameraType.front : CameraType.back;
  }
  return facing;
};

const resolveCameraComponent = () => {
  if (typeof CameraView === 'function') {
    return CameraView;
  }
  return null;
};

const CameraPreview = forwardRef(({ facing = 'front', children, ...rest }, ref) => {
  const CameraComponent = resolveCameraComponent();
  if (!CameraComponent) {
    console.warn('CameraPreview: Camera component unavailable, rendering placeholder view');
    return (
      <View ref={ref} {...rest}>
        {children}
      </View>
    );
  }

  const cameraProps = CameraComponent === CameraView
    ? { facing: facing === 'front' ? 'front' : 'back' }
    : { type: resolveCameraType(facing) };

  return (
    <CameraComponent ref={ref} {...cameraProps} {...rest}>
      {children}
    </CameraComponent>
  );
});

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
  const [loadingMessage, setLoadingMessage] = useState('');
  const [styleResult, setStyleResult] = useState(null);
  const [faceAnalysis, setFaceAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAPIMonitor, setShowAPIMonitor] = useState(false);
  const [currentSettingScreen, setCurrentSettingScreen] = useState(null); // 'notifications', 'data', 'privacy', 'help'
  const [selectedBackground, setSelectedBackground] = useState('none'); // 'none', 'indoor', 'outdoor'
  const [userPlan, setUserPlan] = useState('tester'); // 'basic', 'premium', 'unlimited', 'tester'
  const [usageCount, setUsageCount] = useState(0);
  const [maintenanceInfo, setMaintenanceInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'camera', 'premium', 'gallery', 'account'
  const [selectedGender, setSelectedGender] = useState(null); // 'male', 'female'
  const [compatibilityWarnings, setCompatibilityWarnings] = useState([]);
  const [titleTapCount, setTitleTapCount] = useState(0);

  const selectedImage = capturedImage?.previewUri || legacySelectedImage || capturedImage?.fileUri || null;

  // 性別に応じたスタイルオプションを取得
  const getCurrentStyleOptions = () => {
    if (selectedGender === 'male') {
      return {
        cuts: maleCutOptions,
        colors: maleColorOptions,
        textures: maleTextureOptions
      };
    } else {
      return {
        cuts: femaleCutOptions,
        colors: femaleColorOptions,
        textures: femaleTextureOptions
      };
    }
  };

  // スタイル組み合わせの互換性チェック
  const checkStyleCompatibility = (cut, color, texture) => {
    const warnings = [];
    const options = getCurrentStyleOptions();
    
    const selectedTextureOption = options.textures.find(t => t.name === texture);
    const selectedColorOption = options.colors.find(c => c.name === color);
    
    // ストレート系施術と明るいカラーの組み合わせチェック
    if (selectedTextureOption?.restrictsBrightColors && selectedColorOption?.bleachRequired) {
      warnings.push({
        type: 'compatibility',
        message: '髪質改善ストレートと明るいカラーの同時施術は困難です',
        detail: 'ストレート施術後は髪が傷みやすく、ブリーチが必要なカラーは推奨されません。ダークカラーをおすすめします。',
        severity: 'high'
      });
    }
    
    // ブリーチが必要なカラーの注意
    if (selectedColorOption?.bleachRequired) {
      warnings.push({
        type: 'process',
        message: 'このカラーにはブリーチが必要です',
        detail: '髪へのダメージが大きくなります。事前のカウンセリングとアフターケアが重要です。',
        severity: 'medium'
      });
    }
    
    return warnings;
  };

  // スタイル選択時の互換性チェック
  const updateCompatibilityWarnings = () => {
    if (selectedCut && selectedColor && selectedTexture) {
      const warnings = checkStyleCompatibility(selectedCut, selectedColor, selectedTexture);
      setCompatibilityWarnings(warnings);
    } else {
      setCompatibilityWarnings([]);
    }
  };

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
      setCurrentScreen('gender_select');
      return;
    }

    const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
    if (!cacheDir) {
      const fallbackPreview = dataUri || (base64Data ? `data:image/jpeg;base64,${base64Data}` : originalUri);
      const payload = { previewUri: fallbackPreview || null, base64: base64Data || null, fileUri: originalUri || null };
      setCapturedImage(payload);
      setLegacySelectedImage(payload.previewUri);
      setShowCamera(false);
      setCurrentScreen('gender_select');
      return;
    }

    const targetPath = `${cacheDir}stylematch-${Date.now()}.jpg`;
    let previewUri = dataUri || null;
    let fileUri = null;

    try {
      if (base64Data) {
        await FileSystem.writeAsStringAsync(targetPath, base64Data, {
          encoding: 'base64',
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
            encoding: 'base64',
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
            encoding: 'base64',
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
    console.log('=== MALE GENDER DEBUGGING ===');
    console.log('Selected gender:', selectedGender);
    console.log('Is male selected:', selectedGender === 'male');
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
      const limitMessage = userPlan === 'tester' 
        ? `テスター用の利用上限（${limit.maxUsage}回）に達しました。\n\nテストにご協力いただき、ありがとうございました！\nフィードバックフォームへのご回答をお待ちしております。`
        : `${limit.name}プランの月間利用上限（${limit.maxUsage}回）に達しています。\n\nプレミアムプランで月10回まで、または無制限プランで制限なしでお楽しみください。`;
      
      Alert.alert(
        '利用上限に達しました',
        limitMessage,
        [
          { text: 'キャンセル', style: 'cancel' },
          { 
            text: 'プランを見る', 
            onPress: () => {
              setCurrentScreen('home');
              setActiveTab('premium');
            }
          }
        ]
      );
      return;
    }

    setIsProcessing(true);
    setLoadingMessage('AI画像編集中...');
    try {
      let base64Data = capturedImage?.base64 || null;

      if (!base64Data && capturedImage?.fileUri) {
        console.log('Reading base64 from fileUri...');
        try {
          base64Data = await FileSystem.readAsStringAsync(capturedImage.fileUri, {
            encoding: 'base64',
          });
          console.log('Successfully read base64 from file');
        } catch (fsError) {
          console.warn('Failed to read image for style blend', fsError);
        }
      }

      if (!base64Data) {
        Alert.alert('エラー', '写真の取得に失敗しました。撮影からやり直してください。');
        setIsProcessing(false);
      setLoadingMessage('');
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

      console.log('=== CALLING STYLEBLENDSERVICE ===');
      console.log('Gender being processed:', selectedGender);
      console.log('Cut for processing:', selectedCut);
      console.log('Color for processing:', selectedColor);
      console.log('Texture for processing:', selectedTexture);
      
      const result = await StyleBlendService.processStyleBlend(
        dataUri,
        selectedCut,
        selectedColor,
        selectedTexture,
        selectedBackground,
        selectedGender  // Pass gender to StyleBlendService
      );
      
      console.log('=== STYLE BLEND RESULT PROCESSING ===');
      console.log('=== MALE GENDER RESULT DEBUGGING ===');
      console.log('Gender:', selectedGender);
      console.log('Is male?:', selectedGender === 'male');
      console.log('StyleBlendService result:', result);
      console.log('Result success:', result?.success);
      console.log('Result has fusionImageUri:', !!result?.fusionImageUri);
      console.log('FusionImageUri type:', typeof result?.fusionImageUri);
      console.log('FusionImageUri starts with data:', result?.fusionImageUri?.startsWith('data:'));
      if (result?.fusionImageUri) {
        console.log('FusionImageUri first 100 chars:', result.fusionImageUri.substring(0, 100));
      }
      
      // メンテナンス情報を生成
      const maintenance = generateMaintenanceInfo(selectedCut, selectedColor, selectedTexture);
      console.log('Generated maintenance info:', maintenance);
      setMaintenanceInfo(maintenance);
      
      // 使用回数を増加
      const newUsageCount = usageCount + 1;
      setUsageCount(newUsageCount);
      
      setStyleResult(result);
      console.log('Setting screen to result...');
      setCurrentScreen('result');
      setIsProcessing(false);
      setLoadingMessage('');
      
      // 利用制限が近い場合の警告
      if (userPlan === 'basic' && newUsageCount >= planLimits[userPlan].maxUsage - 1) {
        setTimeout(() => {
          Alert.alert(
            '利用制限のお知らせ',
            `無料プランの残り利用回数が少なくなりました。\n残り：${planLimits[userPlan].maxUsage - newUsageCount}回\n\nプレミアムプランで月10回まで、無制限プランで制限なしでお楽しみください。`,
            [
              { text: '後で', style: 'cancel' },
              { 
                text: 'プランを見る', 
                onPress: () => {
                  setCurrentScreen('home');
                  setActiveTab('premium');
                }
              }
            ]
          );
        }, 3000);
      } else if (userPlan === 'tester' && newUsageCount >= planLimits[userPlan].maxUsage - 2) {
        setTimeout(() => {
          Alert.alert(
            'テスト利用回数のお知らせ',
            `テスト利用回数の残りが少なくなりました。\n残り：${planLimits[userPlan].maxUsage - newUsageCount}回\n\nすべての機能をお試しいただいた後、フィードバックフォームへのご回答をお待ちしております。`,
            [
              { text: '了解', style: 'cancel' },
              { 
                text: 'フィードバックフォームへ', 
                onPress: () => {
                  Linking.openURL('https://forms.gle/tHpLWmZm2mPfQMxt5');
                }
              }
            ]
          );
        }, 3000);
      }
    } catch (error) {
      console.error('handleStyleBlend error:', error);
      setIsProcessing(false);
      setLoadingMessage('');
      Alert.alert('エラー', 'スタイル合成に失敗しました: ' + error.message);
    }
  };

  const handleSaveResult = async () => {
    try {
      console.log('=== SAVE FUNCTION START ===');
      console.log('Current screen:', currentScreen);
      console.log('StyleResult exists:', !!styleResult);
      console.log('CapturedImage exists:', !!capturedImage);
      
      // 保存する画像を決定（優先順位つき）
      let imageToSave = null;
      let isAIGenerated = false;
      
      // 1. AI生成画像があれば優先
      if (styleResult?.fusionImageUri) {
        imageToSave = styleResult.fusionImageUri;
        isAIGenerated = true;
        console.log('Using AI generated image');
      }
      // 2. 撮影した画像のpreviewUriを使用
      else if (capturedImage?.previewUri) {
        imageToSave = capturedImage.previewUri;
        console.log('Using captured image previewUri');
      }
      // 3. 撮影した画像のfileUriを使用
      else if (capturedImage?.fileUri) {
        imageToSave = capturedImage.fileUri;
        console.log('Using captured image fileUri');
      }
      // 4. legacy選択画像を使用
      else if (legacySelectedImage) {
        imageToSave = legacySelectedImage;
        console.log('Using legacy selected image');
      }
      
      if (!imageToSave) {
        console.error('No image available for saving');
        Alert.alert('エラー', '保存する画像がありません。先に写真を撮影してください。');
        return;
      }

      console.log('Image to save (first 100 chars):', imageToSave.substring(0, 100));
      console.log('Is AI generated:', isAIGenerated);
      console.log('Image type:', imageToSave.startsWith('data:') ? 'base64' : 'file');

      // 権限チェック
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'アクセス許可が必要です', 
          '写真アプリに保存するには、設定→StyleMatch→写真でアクセスを許可してください。',
          [
            { text: 'キャンセル', style: 'cancel' },
            { text: '設定を開く', onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              }
            }}
          ]
        );
        return;
      }

      console.log('Permissions granted, processing image...');

      // ファイル保存準備
      const timestamp = Date.now();
      const filename = `stylematch_${isAIGenerated ? 'ai_' : ''}${timestamp}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      console.log('Target file URI:', fileUri);

      let savedFileUri = fileUri;

      // 画像形式に応じた処理
      if (imageToSave.startsWith('data:image/') || imageToSave.startsWith('data:')) {
        // Base64データの場合
        console.log('Processing base64 image...');
        
        let base64Data;
        if (imageToSave.includes(',')) {
          base64Data = imageToSave.split(',')[1];
        } else {
          base64Data = imageToSave;
        }
        
        if (!base64Data || base64Data.length < 100) {
          throw new Error('Invalid base64 image data');
        }
        
        console.log('Base64 data length:', base64Data.length);
        
        // Base64をファイルに書き込み
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: 'base64',
        });
        
        console.log('Base64 file written successfully');
        
      } else if (imageToSave.startsWith('file://') || imageToSave.startsWith('/')) {
        // ファイルURIの場合
        console.log('Processing file URI...');
        
        // ファイルの存在確認
        const fileInfo = await FileSystem.getInfoAsync(imageToSave);
        if (!fileInfo.exists) {
          throw new Error('Source file does not exist');
        }
        
        console.log('Source file exists, size:', fileInfo.size);
        
        // ファイルをコピー
        await FileSystem.copyAsync({
          from: imageToSave,
          to: fileUri
        });
        
        console.log('File copied successfully');
        
      } else {
        throw new Error('Unsupported image format');
      }
      
      // ファイル保存の確認
      const savedFileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!savedFileInfo.exists || savedFileInfo.size === 0) {
        throw new Error('Failed to save image file');
      }
      
      console.log('Saved file verified, size:', savedFileInfo.size);
      
      // メディアライブラリに保存
      console.log('Creating media library asset...');
      let asset = null;
      let librarySaved = false;

      try {
        asset = await MediaLibrary.createAssetAsync(fileUri);
        console.log('Asset created successfully via createAssetAsync:', asset.id);
      } catch (createError) {
        console.warn('createAssetAsync failed, trying saveToLibraryAsync fallback:', createError);
        try {
          const savedId = await MediaLibrary.saveToLibraryAsync(fileUri);
          librarySaved = true;
          asset = savedId ? { id: savedId } : null;
          console.log('Asset saved via saveToLibraryAsync:', savedId);
        } catch (saveError) {
          console.error('saveToLibraryAsync fallback failed:', saveError);
          throw createError;
        }
      }
      
      // StyleMatchアルバムに追加（オプション）
      if (asset && !librarySaved) {
        try {
          const albums = await MediaLibrary.getAlbumsAsync();
          let styleMatchAlbum = albums.find(album => album.title === 'StyleMatch');
          
          if (!styleMatchAlbum) {
            console.log('Creating StyleMatch album...');
            styleMatchAlbum = await MediaLibrary.createAlbumAsync('StyleMatch', asset, false);
          } else {
            console.log('Adding to existing StyleMatch album...');
            await MediaLibrary.addAssetsToAlbumAsync([asset], styleMatchAlbum.id, false);
          }
          console.log('Album operation completed');
        } catch (albumError) {
          console.warn('Album operation failed, but image was saved to main library:', albumError);
        }
      }
      
      // 一時ファイルの削除
      try {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        console.log('Temporary file cleaned up');
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary file:', cleanupError);
      }
      
      // 成功メッセージ
      const imageType = isAIGenerated ? 'AI編集済み画像' : '元の写真';
      const successMessage = Platform.OS === 'ios' 
        ? `${imageType}が写真アプリに保存されました！\n写真アプリの「ライブラリ」または「StyleMatch」アルバムでご確認ください。`
        : `${imageType}がギャラリーに保存されました！\nギャラリーアプリでご確認ください。`;
      
      console.log('=== SAVE FUNCTION SUCCESS ===');
      Alert.alert('保存完了', successMessage);
      
    } catch (error) {
      console.error('=== SAVE FUNCTION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // 具体的なエラーメッセージ
      let userMessage = '保存に失敗しました。';
      
      if (error.message.includes('permission') || error.message.includes('Permission')) {
        userMessage = '写真アクセスの許可が必要です。\n設定→StyleMatch→写真でアクセスを許可してください。';
      } else if (error.message.includes('space') || error.message.includes('storage')) {
        userMessage = '端末の容量が不足しています。\n不要なファイルを削除してから再度お試しください。';
      } else if (error.message.includes('Invalid') || error.message.includes('Unsupported')) {
        userMessage = '画像形式に問題があります。\n撮影からやり直してください。';
      } else if (error.message.includes('file') || error.message.includes('exists')) {
        userMessage = '画像ファイルの処理に失敗しました。\n撮影からやり直してください。';
      } else {
        userMessage = '保存に失敗しました。\nしばらく待ってから再度お試しください。';
      }
      
      Alert.alert('保存エラー', userMessage);
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
          encoding: 'base64',
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
      const analysis = await StyleBlendService.analyzeFace(`data:image/jpeg;base64,${base64Data}`, selectedGender);
      setFaceAnalysis(analysis);
      
      // 推薦に基づいて初期選択を設定（性別対応）
      if (analysis.recommendations) {
        const rec = analysis.recommendations;
        const currentOptions = getCurrentStyleOptions();
        
        if (rec.cuts && rec.cuts.length > 0) {
          const recommendedCut = currentOptions.cuts.find(cut => 
            rec.cuts.some(recCut => cut.name.includes(recCut) || recCut.includes(cut.name))
          );
          if (recommendedCut) setSelectedCut(recommendedCut.name);
        }
        if (rec.colors && rec.colors.length > 0) {
          const recommendedColor = currentOptions.colors.find(color => 
            rec.colors.some(recColor => color.name.includes(recColor) || recColor.includes(color.name))
          );
          if (recommendedColor) setSelectedColor(recommendedColor.name);
        }
        if (rec.textures && rec.textures.length > 0) {
          const recommendedTexture = currentOptions.textures.find(texture => 
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

  // 設定関連のハンドラー
  const handleNotificationSettings = () => {
    setCurrentSettingScreen('notifications');
    setShowSettings(true);
  };

  const handleDataManagement = () => {
    setCurrentSettingScreen('data');
    setShowSettings(true);
  };

  const handlePrivacySettings = () => {
    setCurrentSettingScreen('privacy');
    setShowSettings(true);
  };

  const handleHelpSupport = () => {
    setCurrentSettingScreen('help');
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
    setCurrentSettingScreen(null);
  };

  // メンテナンス情報生成（男女別対応）
  const generateMaintenanceInfo = (cut, color, texture) => {
    // 女性向けメンテナンス情報
    const femaleCutMaintenance = {
      'つやつやボブ': { 
        duration: '2-3ヶ月', 
        care: '毛先のトリートメントが重要', 
        frequency: '6-8週間ごと',
        process: 'カット→ブロー→スタイリング'
      },
      'レイヤーミディ': { 
        duration: '3-4ヶ月', 
        care: 'スタイリング剤でボリュームキープ', 
        frequency: '8-10週間ごと',
        process: 'レイヤーカット→トリートメント→ブロー'
      },
      'うるつやロング': { 
        duration: '4-5ヶ月', 
        care: '定期的な毛先カットと保湿', 
        frequency: '10-12週間ごと',
        process: 'カット→髪質改善トリートメント→ブロー'
      },
      'エアリーショート': { 
        duration: '2-3ヶ月', 
        care: 'ワックスで動きを出す', 
        frequency: '6-8週間ごと',
        process: 'ショートカット→軽めのパーマ→スタイリング'
      }
    };

    // 男性向けメンテナンス情報
    const maleCutMaintenance = {
      'ビジネスショート': { 
        duration: '1-2ヶ月', 
        care: '清潔感を保つ頻繁なカット', 
        frequency: '3-4週間ごと',
        process: 'カット→シャンプー→セット'
      },
      'フェードカット': { 
        duration: '2-3週間', 
        care: 'サイドの伸びに注意', 
        frequency: '2-3週間ごと',
        process: 'フェードカット→ワックスセット'
      },
      'アンダーカット': { 
        duration: '3-4週間', 
        care: 'トップとサイドのバランス', 
        frequency: '3-4週間ごと',
        process: 'アンダーカット→トップスタイリング'
      },
      'ナチュラルショート': { 
        duration: '4-6週間', 
        care: '自然な毛流れを活かす', 
        frequency: '4-6週間ごと',
        process: 'ナチュラルカット→軽めのワックス'
      }
    };
    
    // 女性向けカラー情報
    const femaleColorMaintenance = {
      'ナチュラルブラック': { duration: '4-6ヶ月', care: 'カラー用シャンプーで色持ち向上', process: '根元タッチアップ' },
      'ミルクティーブラウン': { duration: '2-3ヶ月', care: '紫シャンプーで黄ばみ防止', process: 'ブリーチ→カラー→トリートメント' },
      'アッシュグレー': { duration: '2-3ヶ月', care: 'シルバーシャンプーでトーン維持', process: 'ダブルブリーチ→アッシュカラー' },
      'ハニーブロンド': { duration: '2-3ヶ月', care: '紫シャンプーと保湿重視', process: 'ブリーチ→ハイライト→トーニング' },
      'ローズゴールド': { duration: '2-3ヶ月', care: 'ピンク系シャンプーで色補正', process: 'ブリーチ→ピンクカラー→グロストリートメント' },
      'チョコレートブラウン': { duration: '3-4ヶ月', care: 'ブラウン系トリートメント', process: 'カラー→グロストリートメント' },
      'キャラメルブラウン': { duration: '3-4ヶ月', care: '温かみ系ケア製品', process: 'ハイライト→カラー' },
      'アッシュベージュ': { duration: '2-3ヶ月', care: 'ベージュ系シャンプー', process: 'ブリーチ→ベージュカラー' },
      'バーガンディ': { duration: '3-4ヶ月', care: 'レッド系シャンプー', process: 'カラー→レッドトリートメント' },
      'ダークブラウン': { duration: '4-5ヶ月', care: 'ダーク系ケア', process: 'カラー→ツヤ出しトリートメント' }
    };

    // 男性向けカラー情報
    const maleColorMaintenance = {
      'ナチュラルブラック': { duration: '4-6ヶ月', care: 'シンプルなケア', process: '根元カラー' },
      'ダークブラウン': { duration: '3-4ヶ月', care: 'ブラウン系ケア', process: 'ファッションカラー' },
      'アッシュブラウン': { duration: '2-3ヶ月', care: 'アッシュ系ケア', process: 'ブリーチ→アッシュカラー' },
      'グレーシルバー': { duration: '2-3ヶ月', care: 'シルバーシャンプー必須', process: 'ダブルブリーチ→シルバーカラー' },
      'チョコレートブラウン': { duration: '3-4ヶ月', care: 'ビジネス向けケア', process: 'ソフトカラー' }
    };

    // 性別に応じた情報選択
    const cutData = selectedGender === 'male' ? maleCutMaintenance : femaleCutMaintenance;
    const colorData = selectedGender === 'male' ? maleColorMaintenance : femaleColorMaintenance;

    const cutInfo = cutData[cut] || { 
      duration: '3-4ヶ月', 
      care: '定期的なカット', 
      frequency: '8-10週間ごと',
      process: 'カット→スタイリング'
    };
    const colorInfo = colorData[color] || { 
      duration: '3-4ヶ月', 
      care: 'カラー用ヘアケア',
      process: 'カラー施術'
    };

    // テクスチャ別の追加情報
    const textureInfo = {
      'ストレートツヤ': '髪質改善ストレート→グロストリートメント',
      'ゆるふわウェーブ': 'デジタルパーマ→保湿トリートメント',
      '韓国風パーマ': 'コールドパーマ→スタイリング',
      'ナチュラルストレート': '弱酸性ストレート',
      'ソフトウェーブ': 'パーマ→ナチュラルセット',
      'テクスチャードカット': 'レザーカット→ワックスセット'
    };

    const processTime = textureInfo[texture] || 'スタイリング';

    return {
      style: `${cut} × ${color} × ${texture}`,
      duration: `美しい状態: ${Math.min(parseInt(cutInfo.duration), parseInt(colorInfo.duration))}ヶ月`,
      processDetails: {
        title: '📋 施術内容',
        steps: [
          `1. ${cutInfo.process}`,
          `2. ${colorInfo.process}`,
          `3. ${processTime}`,
          '4. 仕上げ・スタイリング'
        ],
        totalTime: 'サロンとご相談ください',
        price: selectedGender === 'male' ? '¥8,000-15,000' : '¥12,000-25,000'
      },
      maintenance: [
        `✂️ カット: ${cutInfo.frequency}にサロンメンテナンス`,
        `🎨 カラー: ${colorInfo.care}`,
        `💆‍♀️ ケア: ${cutInfo.care}`,
        '🧴 シャンプー: 毎日のシャンプーで清潔に保つ',
        selectedGender === 'male' ? '🧴 スタイリング: 軽めのワックスでセット' : '🌟 スタイリング: 熱保護スプレー使用推奨',
        selectedGender === 'male' ? '💧 ケア: 週末のコンディショナーでうるおいをキープ' : '💧 ケア: 週1-2回のディープトリートメント'
      ],
      tips: selectedGender === 'male' ? [
        '毎日のシャンプーで清潔な頭皮をキープ',
        'ドライヤーは短時間で済ませる',
        'ワックスは少量で十分',
        '月1回のカットで清潔感キープ'
      ] : [
        '毎日のシャンプーで健康な髪と頭皮を保つ',
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
        <Text style={styles.processingText}>{loadingMessage || 'AI スタイル合成中...'}</Text>
        <Text style={styles.processingSubText}>
          {loadingMessage.includes('編集') ? 'あなただけのヘアスタイルを生成しています' : 
           loadingMessage.includes('保存') ? '写真アプリに保存しています' : 
           'あなただけのヘアスタイルを生成しています'}
        </Text>
      </LinearGradient>
    );
  }

  // 分析結果画面
  if (currentScreen === 'analysis' && capturedImage) {
    // 性別が選択されていない場合は性別選択画面に戻す
    if (!selectedGender) {
      setCurrentScreen('gender_select');
      return null;
    }
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
              <Text style={styles.analysisTitle}>
                {selectedGender === 'male' ? '🎯 男性向け分析結果' : '🎯 女性向け分析結果'}
              </Text>
              <Text style={styles.faceShapeResult}>
                顔型: {faceAnalysis.faceShape} (信頼度: {Math.round(faceAnalysis.confidence * 100)}%)
              </Text>
              
              <Text style={styles.recommendationTitle}>
                {selectedGender === 'male' ? '💼 プロ推奨スタイル' : '💡 おすすめスタイル'}
              </Text>
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
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backButtonText}>← ホーム</Text>
            </TouchableOpacity>
          </View>

          {renderCapturedImage()}

          {/* 取り直しボタン */}
          <View style={styles.retakeButtonContainer}>
            <TouchableOpacity 
              style={styles.retakeButton} 
              onPress={() => {
                console.log('Retaking photo...');
                // 撮影データをクリア
                setCapturedImage(null);
                setLegacySelectedImage(null);
                setStyleResult(null);
                setFaceAnalysis(null);
                setSelectedMode(null);
                setSelectedCut(null);
                setSelectedColor(null);
                setSelectedTexture(null);
                setSelectedBackground('none');
                // カメラ画面に戻る
                setShowCamera(true);
                setCurrentScreen('home');
              }}
            >
              <Text style={styles.retakeButtonText}>📷 取り直しする</Text>
            </TouchableOpacity>
          </View>

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
    console.log('selectedGender:', selectedGender);
    console.log('capturedImage:', capturedImage);
    console.log('styleResult:', styleResult);
    console.log('styleResult.fusionImageUri exists:', !!styleResult.fusionImageUri);
    console.log('styleResult.fusionImageUri length:', styleResult.fusionImageUri?.length);
    console.log('legacySelectedImage:', legacySelectedImage);
    
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView 
          style={styles.resultContainer} 
          contentContainerStyle={{ paddingHorizontal: 10, maxWidth: screenWidth }}
          showsHorizontalScrollIndicator={false}
        >
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
                {(() => {
                  console.log('=== RESULT IMAGE DISPLAY DEBUG ===');
                  console.log('Gender:', selectedGender);
                  console.log('fusionImageUri exists:', !!styleResult.fusionImageUri);
                  console.log('fusionImageUri type:', typeof styleResult.fusionImageUri);
                  if (styleResult.fusionImageUri) {
                    console.log('fusionImageUri length:', styleResult.fusionImageUri.length);
                    console.log('fusionImageUri format:', styleResult.fusionImageUri.substring(0, 50));
                  }
                  
                  // フォールバック機能を強化：AI生成失敗時は元の画像を表示
                  const originalImageUri = capturedImage?.previewUri || legacySelectedImage || capturedImage?.fileUri;
                  const displayImageUri = styleResult.fusionImageUri || originalImageUri;
                  const isAIGenerated = !!styleResult.fusionImageUri;
                  
                  console.log('Using image URI:', displayImageUri);
                  console.log('Is AI generated:', isAIGenerated);
                  
                  return displayImageUri ? (
                    <View style={styles.imageWrapper}>
                      <TouchableOpacity onPress={() => handleImagePress(displayImageUri)}>
                        <Image 
                          source={{ uri: displayImageUri }} 
                          style={styles.resultImage}
                          onError={(error) => {
                            console.error('=== RESULT IMAGE ERROR ===');
                            console.error('Gender:', selectedGender);
                            console.error('Image load error:', error);
                            console.error('Failed URI:', displayImageUri);
                            console.error('URI starts with data:', displayImageUri?.startsWith('data:'));
                          }}
                          onLoad={() => {
                            console.log('=== RESULT IMAGE SUCCESS ===');
                            console.log('Gender:', selectedGender);
                            console.log('Result image loaded successfully');
                            console.log('AI Generated:', isAIGenerated);
                          }}
                        />
                      </TouchableOpacity>
                      {!isAIGenerated && (
                        <View style={styles.fallbackBadge}>
                          <Text style={styles.fallbackBadgeText}>元の写真</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.mockResultImage}>
                      <Text style={styles.mockImageText}>🎨 プレビュー</Text>
                      <Text style={styles.styleConfidence}>AI機能準備中</Text>
                      <Text style={styles.mockImageText}>性別: {selectedGender}</Text>
                    </View>
                  );
                })()}
              </View>
            </View>
          </View>

          <View style={styles.styleDetailsContainer}>
            <Text style={styles.styleDetailsTitle}>選択されたスタイル</Text>
            <Text style={styles.styleDetail}>💇‍♀️ カット: {styleResult.styleDescription.cut}</Text>
            <Text style={styles.styleDetail}>🎨 カラー: {styleResult.styleDescription.color}</Text>
            <Text style={styles.styleDetail}>✨ テクスチャ: {styleResult.styleDescription.texture}</Text>
          </View>

          {/* 施術内容とメンテナンス情報 */}
          {maintenanceInfo && (
            <View style={styles.maintenanceContainer}>
              <Text style={styles.maintenanceTitle}>
                {selectedGender === 'male' ? '👨‍💼 施術・メンテナンス情報' : '💇‍♀️ 施術・メンテナンス情報'}
              </Text>
              
              {/* 施術詳細 */}
              <View style={styles.processSection}>
                <Text style={styles.processSectionTitle}>{maintenanceInfo.processDetails.title}</Text>
                <View style={styles.processSteps}>
                  {maintenanceInfo.processDetails.steps.map((step, index) => (
                    <Text key={index} style={styles.processStep}>{step}</Text>
                  ))}
                </View>
                <View style={styles.processInfo}>
                  <Text style={styles.processInfoText}>⏰ 施術時間: {maintenanceInfo.processDetails.totalTime}</Text>
                  <Text style={styles.processInfoText}>💰 目安料金: {maintenanceInfo.processDetails.price}</Text>
                </View>
              </View>
              
              <View style={styles.maintenanceSection}>
                <Text style={styles.maintenanceSectionTitle}>🎯 スタイル概要</Text>
                <Text style={styles.maintenanceText}>{maintenanceInfo.style}</Text>
                <Text style={styles.maintenanceText}>{maintenanceInfo.duration}</Text>
              </View>

              <View style={styles.maintenanceSection}>
                <Text style={styles.maintenanceSectionTitle}>🔧 日常メンテナンス</Text>
                {maintenanceInfo.maintenance.map((item, index) => (
                  <Text key={index} style={styles.maintenanceItem}>• {item}</Text>
                ))}
              </View>

              <View style={styles.maintenanceSection}>
                <Text style={styles.maintenanceSectionTitle}>💡 プロのお手入れアドバイス</Text>
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
          <Text style={styles.optionTitle}>
            {selectedGender === 'male' ? '💇‍♂️ カットスタイル' : '💇‍♀️ カットスタイル'}
          </Text>
          <View style={styles.optionsContainer}>
            {getCurrentStyleOptions().cuts.map((cut) => (
              <TouchableOpacity
                key={cut.id}
                style={[styles.optionButton, selectedCut === cut.name && styles.selectedOption]}
                onPress={() => {
                  setSelectedCut(cut.name);
                  setTimeout(() => updateCompatibilityWarnings(), 100);
                }}
              >
                <Text style={styles.optionName}>{cut.name}</Text>
                <Text style={styles.optionMood}>{cut.mood}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* カラー選択 */}
          <Text style={styles.optionTitle}>🎨 ヘアカラー</Text>
          <View style={styles.optionsContainer}>
            {getCurrentStyleOptions().colors.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[styles.optionButton, selectedColor === color.name && styles.selectedOption]}
                onPress={() => {
                  setSelectedColor(color.name);
                  setTimeout(() => updateCompatibilityWarnings(), 100);
                }}
              >
                <Text style={styles.optionName}>{color.name}</Text>
                <Text style={styles.optionMood}>{color.vibe}</Text>
                {color.bleachRequired && (
                  <Text style={styles.warningText}>⚠️ ブリーチ必須</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* テクスチャ選択 */}
          <Text style={styles.optionTitle}>✨ ヘアテクスチャ</Text>
          <View style={styles.optionsContainer}>
            {getCurrentStyleOptions().textures.map((texture) => (
              <TouchableOpacity
                key={texture.id}
                style={[styles.optionButton, selectedTexture === texture.name && styles.selectedOption]}
                onPress={() => {
                  setSelectedTexture(texture.name);
                  setTimeout(() => updateCompatibilityWarnings(), 100);
                }}
              >
                <Text style={styles.optionName}>{texture.name}</Text>
                <Text style={styles.optionMood}>{texture.feel}</Text>
                {texture.restrictsBrightColors && (
                  <Text style={styles.warningText}>⚠️ カラー制限あり</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* 互換性警告表示 */}
          {compatibilityWarnings.length > 0 && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningTitle}>⚠️ 施術に関する注意事項</Text>
              {compatibilityWarnings.map((warning, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.warningItem,
                    warning.severity === 'high' ? styles.highWarning : styles.mediumWarning
                  ]}
                >
                  <Text style={styles.warningMessage}>{warning.message}</Text>
                  <Text style={styles.warningDetail}>{warning.detail}</Text>
                </View>
              ))}
            </View>
          )}

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
        <CameraPreview ref={cameraRef} style={styles.camera} facing="front">
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
        </CameraPreview>
      </View>
    );
  }

  // プレミアムページ
  const renderPremiumPage = () => (
    <LinearGradient colors={['#ffd89b', '#19547b']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.premiumContent}>
        <Text style={styles.premiumTitle}>💎 StyleMatch Premium</Text>
        <Text style={styles.premiumSubtitle}>プロ仕様のAI髪型編集を体験</Text>
        
        <View style={styles.planContainer}>
          <View style={styles.planCard}>
            <Text style={styles.planName}>🆓 ベーシック</Text>
            <Text style={styles.planPrice}>無料</Text>
            <Text style={styles.planFeature}>• 月3回まで編集</Text>
            <Text style={styles.planFeature}>• 基本の髪型パターン</Text>
            <Text style={styles.planFeature}>• 写真保存機能</Text>
          </View>
          
          <View style={[styles.planCard, styles.popularPlan]}>
            <Text style={styles.popularBadge}>人気No.1</Text>
            <Text style={styles.planName}>✨ プレミアム</Text>
            <Text style={styles.planPrice}>¥980/月</Text>
            <Text style={styles.planFeature}>• 月10回まで編集</Text>
            <Text style={styles.planFeature}>• 全髪型パターン利用</Text>
            <Text style={styles.planFeature}>• 背景変更機能</Text>
            <Text style={styles.planFeature}>• メンテナンス情報</Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>プレミアムを始める</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.planCard}>
            <Text style={styles.planName}>🔥 無制限</Text>
            <Text style={styles.planPrice}>¥1,980/月</Text>
            <Text style={styles.planFeature}>• 無制限で編集</Text>
            <Text style={styles.planFeature}>• 優先サポート</Text>
            <Text style={styles.planFeature}>• 新機能先行体験</Text>
            <Text style={styles.planFeature}>• 商用利用可能</Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>無制限プランを始める</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );

  // アカウントページ
  const renderAccountPage = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.accountContent}>
        <Text style={styles.accountTitle}>👤 マイアカウント</Text>
        
        <View style={styles.accountCard}>
          <Text style={styles.accountCardTitle}>利用状況</Text>
          <View style={styles.usageInfo}>
            <Text style={styles.usageText}>
              {userPlan === 'tester' ? '🧪 テスターアカウント' : `現在のプラン: ${planLimits[userPlan].name}`}
            </Text>
            <Text style={styles.usageText}>
              {userPlan === 'tester' 
                ? `テスト利用回数: ${usageCount} / ${planLimits[userPlan].maxUsage}回`
                : `今月の利用回数: ${usageCount} / ${planLimits[userPlan].maxUsage === Infinity ? '∞' : planLimits[userPlan].maxUsage}`
              }
            </Text>
            <View style={styles.usageBar}>
              <View 
                style={[
                  styles.usageProgress, 
                  { width: `${Math.min((usageCount / (planLimits[userPlan].maxUsage === Infinity ? 100 : planLimits[userPlan].maxUsage)) * 100, 100)}%` }
                ]} 
              />
            </View>
          </View>
          
          {userPlan === 'basic' && usageCount >= 2 && (
            <View style={styles.upgradePrompt}>
              <Text style={styles.upgradePromptText}>残り{planLimits[userPlan].maxUsage - usageCount}回です</Text>
              <TouchableOpacity 
                style={styles.upgradePromptButton}
                onPress={() => setActiveTab('premium')}
              >
                <Text style={styles.upgradePromptButtonText}>アップグレード</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {userPlan === 'tester' && (
            <View style={styles.testerPrompt}>
              <Text style={styles.testerPromptText}>📝 テスト完了後はフィードバックフォームへのご回答をお待ちしております</Text>
              <TouchableOpacity 
                style={styles.feedbackButton}
                onPress={() => {
                  const feedbackUrl = 'https://forms.gle/tHpLWmZm2mPfQMxt5';
                  Linking.openURL(feedbackUrl).catch(err => {
                    Alert.alert('エラー', 'フィードバックフォームを開けませんでした。');
                  });
                }}
              >
                <Text style={styles.feedbackButtonText}>フィードバックフォームへ</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.accountCard}>
          <Text style={styles.accountCardTitle}>設定</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
            <Text style={styles.settingText}>📧 通知設定</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleDataManagement}>
            <Text style={styles.settingText}>💾 データ管理</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySettings}>
            <Text style={styles.settingText}>🔒 プライバシー</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport}>
            <Text style={styles.settingText}>❓ ヘルプ・サポート</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );

  // ギャラリーページ
  const renderGalleryPage = () => (
    <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.container}>
      <View style={styles.galleryContent}>
        <Text style={styles.galleryTitle}>📚 スタイルギャラリー</Text>
        <Text style={styles.gallerySubtitle}>過去の編集結果</Text>
        <View style={styles.galleryPlaceholder}>
          <Text style={styles.galleryPlaceholderText}>🎨</Text>
          <Text style={styles.galleryPlaceholderText}>まだ編集履歴がありません</Text>
          <Text style={styles.galleryPlaceholderSubtext}>髪型編集を始めて、あなたのスタイルコレクションを作りましょう！</Text>
        </View>
      </View>
    </LinearGradient>
  );

  // メインコンテンツのレンダリング
  const renderMainContent = () => {
    switch (activeTab) {
      case 'camera':
        if (showCamera) {
          return (
            <View style={styles.cameraContainer}>
              <CameraPreview ref={cameraRef} style={styles.camera} facing="front">
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
              </CameraPreview>
            </View>
          );
        }
        return (
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
            <Text style={styles.title}>📸 写真撮影</Text>
            <Text style={styles.subtitle}>美しい髪型編集のために</Text>
            
            <TouchableOpacity style={styles.button} onPress={handleCameraPress}>
              <Text style={styles.buttonText}>📸 カメラで撮影</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handleImagePicker}>
              <Text style={styles.buttonText}>🖼️ ギャラリーから選択</Text>
            </TouchableOpacity>
          </LinearGradient>
        );
      case 'premium':
        return renderPremiumPage();
      case 'gallery':
        return renderGalleryPage();
      case 'account':
        return renderAccountPage();
      default:
        return (
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
            <TouchableOpacity 
              onPress={() => {
                const newCount = titleTapCount + 1;
                setTitleTapCount(newCount);
                if (newCount >= 10) {
                  setShowAPIMonitor(true);
                  setTitleTapCount(0);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.title}>StyleMatch</Text>
            </TouchableOpacity>
            <Text style={styles.subtitle}>AI顔型分析 × スタイル生成</Text>
            
            <TouchableOpacity style={styles.button} onPress={() => setActiveTab('camera')}>
              <Text style={styles.buttonText}>📸 髪型編集を始める</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={() => setActiveTab('gallery')}>
              <Text style={styles.buttonText}>📚 ギャラリーを見る</Text>
            </TouchableOpacity>
            
            {userPlan === 'basic' && (
              <TouchableOpacity 
                style={[styles.button, styles.premiumButton]} 
                onPress={() => setActiveTab('premium')}
              >
                <Text style={styles.buttonText}>💎 プレミアムプランを見る</Text>
              </TouchableOpacity>
            )}
            
            <Text style={styles.version}>Version 2.0 (AI Complete Edition)</Text>
            <StatusBar style="light" />
          </LinearGradient>
        );
    }
  };

  // フッターナビゲーション
  const renderBottomNavigation = () => (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity 
        style={[styles.navTab, activeTab === 'home' && styles.activeNavTab]}
        onPress={() => setActiveTab('home')}
      >
        <Text style={[styles.navIcon, activeTab === 'home' && styles.activeNavIcon]}>🏠</Text>
        <Text style={[styles.navLabel, activeTab === 'home' && styles.activeNavLabel]}>ホーム</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navTab, activeTab === 'camera' && styles.activeNavTab]}
        onPress={() => setActiveTab('camera')}
      >
        <Text style={[styles.navIcon, activeTab === 'camera' && styles.activeNavIcon]}>📸</Text>
        <Text style={[styles.navLabel, activeTab === 'camera' && styles.activeNavLabel]}>撮影</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navTab, activeTab === 'premium' && styles.activeNavTab]}
        onPress={() => setActiveTab('premium')}
      >
        <Text style={[styles.navIcon, activeTab === 'premium' && styles.activeNavIcon]}>💎</Text>
        <Text style={[styles.navLabel, activeTab === 'premium' && styles.activeNavLabel]}>プレミアム</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navTab, activeTab === 'gallery' && styles.activeNavTab]}
        onPress={() => setActiveTab('gallery')}
      >
        <Text style={[styles.navIcon, activeTab === 'gallery' && styles.activeNavIcon]}>📚</Text>
        <Text style={[styles.navLabel, activeTab === 'gallery' && styles.activeNavLabel]}>ギャラリー</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navTab, activeTab === 'account' && styles.activeNavTab]}
        onPress={() => setActiveTab('account')}
      >
        <Text style={[styles.navIcon, activeTab === 'account' && styles.activeNavIcon]}>👤</Text>
        <Text style={[styles.navLabel, activeTab === 'account' && styles.activeNavLabel]}>アカウント</Text>
      </TouchableOpacity>
    </View>
  );

  // 既存の画面がある場合は優先して表示（髪型編集フロー）
  if (currentScreen !== 'home') {
    let content;
    
    if (currentScreen === 'gender_select') {
      // 性別選択画面
      content = (
        <SafeAreaView style={styles.safeArea}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
            <View style={styles.safeHeader}>
              <Text style={styles.styleTitle}>👥 性別を選択</Text>
              <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
                <Text style={styles.backButtonText}>← 戻る</Text>
              </TouchableOpacity>
            </View>
          <Text style={styles.subtitle}>あなたに最適なスタイルを提案します</Text>
          
          {/* デバッグ情報 */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>現在の状態: {currentScreen}</Text>
            <Text style={styles.debugText}>選択された性別: {selectedGender || 'なし'}</Text>
            <Text style={styles.debugText}>顔型分析: {faceAnalysis ? `${faceAnalysis.faceShape} (${selectedGender})` : 'なし'}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.genderButton, styles.femaleButton]} 
            onPress={() => {
              console.log('=== FEMALE BUTTON PRESSED ===');
              console.log('Setting gender to: female');
              setSelectedGender('female');
              console.log('Setting screen to: mode_select');
              setCurrentScreen('mode_select');
              console.log('Gender selection completed');
            }}
          >
            <Text style={styles.genderButtonIcon}>👩</Text>
            <Text style={styles.genderButtonTitle}>女性</Text>
            <Text style={styles.genderButtonDesc}>豊富なカラー・スタイルバリエーション</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.genderButton, styles.maleButton]} 
            onPress={() => {
              console.log('=== MALE BUTTON PRESSED ===');
              console.log('Setting gender to: male');
              setSelectedGender('male');
              console.log('Setting screen to: mode_select');
              setCurrentScreen('mode_select');
              console.log('Gender selection completed');
            }}
          >
            <Text style={styles.genderButtonIcon}>👨</Text>
            <Text style={styles.genderButtonTitle}>男性</Text>
            <Text style={styles.genderButtonDesc}>ビジネス・カジュアル向けスタイル</Text>
          </TouchableOpacity>
          </LinearGradient>
        </SafeAreaView>
      );
    } else if (currentScreen === 'mode_select') {
      // モード選択画面
      content = (
        <SafeAreaView style={styles.safeArea}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
            <View style={styles.safeHeader}>
              <Text style={styles.styleTitle}>✨ 編集モードを選択</Text>
              <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('gender_select')}>
                <Text style={styles.backButtonText}>← 戻る</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>どちらの方法で髪型を決めますか？</Text>
          
          {/* デバッグ情報 */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>選択された性別: {selectedGender}</Text>
            <Text style={styles.debugText}>利用可能なカット数: {getCurrentStyleOptions().cuts.length}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.modeButton} 
            onPress={() => {
              if (!selectedGender) {
                Alert.alert('性別選択が必要です', 'AI顔型診断には性別情報が必要です。まず性別を選択してください。', [
                  { text: 'OK', onPress: () => setCurrentScreen('gender_select') }
                ]);
              } else {
                setCurrentScreen('analysis');
              }
            }}
          >
            <Text style={styles.modeButtonTitle}>🔍 AI顔型診断</Text>
            <Text style={styles.modeButtonDesc}>あなたの顔型に最適なスタイルを提案</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modeButton} 
            onPress={() => setCurrentScreen('style')}
          >
            <Text style={styles.modeButtonTitle}>🎨 自由カスタム</Text>
            <Text style={styles.modeButtonDesc}>お好みでカット・カラー・質感を選択</Text>
          </TouchableOpacity>
          </LinearGradient>
        </SafeAreaView>
      );
    } else {
      // その他の既存画面はそのまま表示
      return null; // 既存のrender処理に委譲
    }
    
    return (
      <View style={styles.appContainer}>
        {content}
        {renderBottomNavigation()}
      </View>
    );
  }

  // メインアプリ構造
  // 設定画面のレンダリング
  const renderSettingsScreen = () => {
    const getSettingsContent = () => {
      switch (currentSettingScreen) {
        case 'notifications':
          return {
            title: '📧 通知設定',
            items: [
              { label: 'スタイル完成通知', value: true, type: 'toggle' },
              { label: '新機能のお知らせ', value: true, type: 'toggle' },
              { label: 'プロモーション情報', value: false, type: 'toggle' },
              { label: 'メンテナンスリマインダー', value: true, type: 'toggle' }
            ]
          };
        case 'data':
          return {
            title: '💾 データ管理',
            items: [
              { label: 'キャッシュをクリア', action: 'clearCache', type: 'action' },
              { label: '撮影履歴を消去', action: 'clearHistory', type: 'action' },
              { label: '使用状況をリセット', action: 'resetUsage', type: 'action' },
              { label: `使用容量: 約5MB`, type: 'info' }
            ]
          };
        case 'privacy':
          return {
            title: '🔒 プライバシー',
            items: [
              { label: '撮影データの自動削除', value: true, type: 'toggle' },
              { label: '分析データの共有', value: false, type: 'toggle' },
              { label: 'プライバシーポリシーを表示', action: 'showPrivacy', type: 'action' },
              { label: '利用規約を表示', action: 'showTerms', type: 'action' }
            ]
          };
        case 'help':
          return {
            title: '❓ ヘルプ・サポート',
            items: [
              { label: 'よくある質問', action: 'showFAQ', type: 'action' },
              { label: 'お問い合わせ', action: 'contact', type: 'action' },
              { label: '使い方ガイド', action: 'showGuide', type: 'action' },
              { label: 'アプリバージョン: 1.0.0', type: 'info' }
            ]
          };
        default:
          return { title: '設定', items: [] };
      }
    };

    const content = getSettingsContent();

    return (
      <View style={styles.settingsModal}>
        <View style={styles.settingsContent}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>{content.title}</Text>
            <TouchableOpacity style={styles.settingsCloseButton} onPress={closeSettings}>
              <Text style={styles.settingsCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.settingsBody}>
            {content.items.map((item, index) => (
              <View key={index} style={styles.settingsRow}>
                <Text style={styles.settingsRowLabel}>{item.label}</Text>
                {item.type === 'toggle' && (
                  <TouchableOpacity style={[styles.settingsToggle, item.value && styles.settingsToggleActive]}>
                    <View style={[styles.settingsToggleThumb, item.value && styles.settingsToggleThumbActive]} />
                  </TouchableOpacity>
                )}
                {item.type === 'action' && (
                  <TouchableOpacity style={styles.settingsActionButton} onPress={() => handleSettingsAction(item.action)}>
                    <Text style={styles.settingsActionText}>›</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  // 設定アクションの処理
  const handleSettingsAction = (action) => {
    switch (action) {
      case 'clearCache':
        Alert.alert('キャッシュをクリア', 'キャッシュデータを削除しました。');
        break;
      case 'clearHistory':
        Alert.alert('履歴を消去', '撮影履歴を削除しました。');
        break;
      case 'resetUsage':
        setUsageCount(0);
        Alert.alert('リセット完了', '使用状況をリセットしました。');
        break;
      case 'showPrivacy':
        Alert.alert('プライバシーポリシー', 'プライバシーポリシーの詳細を表示します。');
        break;
      case 'showTerms':
        Alert.alert('利用規約', '利用規約の詳細を表示します。');
        break;
      case 'showFAQ':
        Alert.alert('よくある質問', 'FAQページを表示します。');
        break;
      case 'contact':
        Alert.alert('お問い合わせ', 'お問い合わせフォームを開きます。');
        break;
      case 'showGuide':
        Alert.alert('使い方ガイド', 'ガイドを表示します。');
        break;
    }
  };

  return (
    <View style={styles.appContainer}>
      {renderMainContent()}
      {renderBottomNavigation()}
      {showSettings && renderSettingsScreen()}
      <APIMonitor 
        isVisible={showAPIMonitor} 
        onClose={() => setShowAPIMonitor(false)} 
      />
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
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
    width: '100%',
    maxWidth: screenWidth,
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
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: 'bold',
  },
  resultImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
    maxWidth: screenWidth,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    gap: 8,
    maxWidth: screenWidth - 30,
    alignSelf: 'center',
  },
  imageSection: {
    alignItems: 'center',
    flex: 1,
    maxWidth: '48%',
    minWidth: Math.min(120, (screenWidth - 60) / 2),
  },
  imageSectionTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainImageSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: screenWidth,
  },
  mainImageTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  mainResultImage: {
    width: Math.min(isSmallDevice ? 200 : isMediumDevice ? 240 : 280, screenWidth - 80),
    height: Math.min(isSmallDevice ? 250 : isMediumDevice ? 300 : 350, (screenWidth - 80) * 1.25),
    borderRadius: isSmallDevice ? 15 : 20,
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: screenWidth - 80,
    alignSelf: 'center',
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
    width: '100%',
    aspectRatio: 3/4,
    maxWidth: Math.min(150, (screenWidth - 60) / 2 - 10),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 165, 0, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  fallbackBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
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
  styleDetailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 12,
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
    paddingHorizontal: isSmallDevice ? 12 : 15,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderRadius: isSmallDevice ? 15 : 20,
    alignItems: 'center',
    flex: 0.48,
  },
  saveButtonText: {
    color: 'white',
    fontSize: isSmallDevice ? 16 : 18,
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
  // フッターナビゲーション関連スタイル
  appContainer: {
    flex: 1,
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeNavTab: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 15,
    marginHorizontal: 5,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  activeNavIcon: {
    fontSize: 26,
  },
  navLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  
  // プレミアムページスタイル
  premiumContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  premiumSubtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  planContainer: {
    gap: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  popularPlan: {
    borderColor: '#ffd700',
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#ffd700',
    color: '#000',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 15,
  },
  planFeature: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    opacity: 0.9,
  },
  upgradeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 15,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumButton: {
    backgroundColor: '#ffd700',
  },
  
  // アカウントページスタイル
  accountContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  accountTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  accountCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  accountCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  usageInfo: {
    marginBottom: 15,
  },
  usageText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  usageBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginTop: 10,
  },
  usageProgress: {
    height: '100%',
    backgroundColor: '#4ecdc4',
    borderRadius: 4,
  },
  upgradePrompt: {
    backgroundColor: 'rgba(255,107,107,0.2)',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upgradePromptText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  upgradePromptButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  upgradePromptButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testerPrompt: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  testerPromptText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  feedbackButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingText: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  settingArrow: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // 設定モーダルスタイル
  settingsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  settingsContent: {
    backgroundColor: '#2c3e50',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#34495e',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsBody: {
    flex: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingsRowLabel: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  settingsToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  settingsToggleActive: {
    backgroundColor: '#4CAF50',
  },
  settingsToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  settingsToggleThumbActive: {
    alignSelf: 'flex-end',
  },
  settingsActionButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsActionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // ギャラリーページスタイル
  galleryContent: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  galleryTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  gallerySubtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  galleryPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryPlaceholderText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  galleryPlaceholderSubtext: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  
  // モード選択画面スタイル
  modeButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modeButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  modeButtonDesc: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  
  // 性別選択画面スタイル
  genderButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  femaleButton: {
    borderColor: '#ff6b9d',
    backgroundColor: 'rgba(255,107,157,0.2)',
  },
  maleButton: {
    borderColor: '#4dabf7',
    backgroundColor: 'rgba(77,171,247,0.2)',
  },
  genderButtonIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  genderButtonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  genderButtonDesc: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  
  // 互換性警告スタイル
  warningText: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: 'bold',
    marginTop: 5,
  },
  warningContainer: {
    backgroundColor: 'rgba(255,107,107,0.2)',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.5)',
  },
  warningTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  warningItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  highWarning: {
    backgroundColor: 'rgba(255,107,107,0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  mediumWarning: {
    backgroundColor: 'rgba(255,193,7,0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningMessage: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  warningDetail: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 18,
  },
  
  // 施術詳細スタイル
  processSection: {
    backgroundColor: 'rgba(76,205,196,0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(76,205,196,0.4)',
  },
  processSectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  processSteps: {
    marginBottom: 10,
  },
  processStep: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
    paddingLeft: 5,
  },
  processInfo: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 5,
    gap: isSmallDevice ? 5 : 0,
  },
  processInfoText: {
    color: 'white',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: 'bold',
    flex: isSmallDevice ? 0 : 1,
    textAlign: isSmallDevice ? 'left' : 'center',
    paddingHorizontal: 2,
  },
  
  // デバッグ情報スタイル
  debugInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    margin: 20,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  
  // SafeArea対応スタイル
  safeArea: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  safeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
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
    width: '100%',
    aspectRatio: 3/4,
    maxWidth: Math.min(isSmallDevice ? 120 : isMediumDevice ? 140 : 160, (screenWidth - 60) / 2 - 10),
    borderRadius: isSmallDevice ? 8 : 10,
    borderWidth: 1.5,
    borderColor: 'white',
    resizeMode: 'cover',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
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
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
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
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 15,
    gap: 8,
  },
  regenerateButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'white',
    flex: 0.48,
  },
  regenerateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // 取り直しボタンスタイル
  retakeButtonContainer: {
    alignItems: 'center',
    marginVertical: 15,
    marginBottom: 20,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 87, 87, 0.9)',
    paddingHorizontal: isSmallDevice ? 20 : 25,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderRadius: isSmallDevice ? 20 : 25,
    borderWidth: 2,
    borderColor: '#FF5757',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
