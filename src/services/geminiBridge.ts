/**
 * Gemini NanoBanana画像編集サービス
 * Google AI StudioのNanoBanana機能を使った実際の髪型編集
 */

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBK6w_GZ8QJJ0Wz2X5QY3LN4M9P8R7T6V';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

export interface StyleBlendPayload {
  userImage: string;
  cut: string;
  color: string;
  texture: string;
  background?: string;
  gender?: string;
  promptSummary?: string;
  promptInstructions?: string;
}

export interface StyleBlendResponse {
  success?: boolean;
  fusionImage?: string;
  narrative?: string | null;
  descriptor?: {
    cut?: string;
    color?: string;
    texture?: string;
    summary?: string | null;
  };
  error?: string;
}

export interface FaceAnalysisResult {
  faceShape: 'round' | 'oval' | 'square' | 'heart' | 'long';
  confidence: number;
  recommendations: {
    cuts: string[];
    colors: string[];
    textures: string[];
    reasoning: string;
  };
}

const DEFAULT_TIMEOUT_MS = 15000;

interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

function linkAbortSignals(source: AbortSignal, target: AbortController) {
  if (source.aborted) {
    target.abort();
    return () => undefined;
  }

  const onAbort = () => target.abort();
  source.addEventListener('abort', onAbort);
  return () => source.removeEventListener('abort', onAbort);
}

// 顔型分析API
export async function analyzeFaceShape(
  imageUri: string,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<FaceAnalysisResult> {
  const controller = new AbortController();
  const detach = signal ? linkAbortSignals(signal, controller) : undefined;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 実際のGemini API呼び出しを試行
    const base64Data = imageUri.replace(/^data:image\/[a-z]+;base64,/, '') || imageUri;
    
    const prompt = `この顔写真を分析して、顔型を判定してください。以下の5つのカテゴリから最も適合するものを選択し、その顔型に似合う髪型を推薦してください：

1. round（丸型） - 頬がふっくらしていて、縦と横の比率がほぼ同じ
2. oval（卵型） - 理想的なバランス、縦が横より少し長い
3. square（四角型） - エラが張っていて、角ばった輪郭
4. heart（ハート型） - 額が広く、顎が細い逆三角形
5. long（面長） - 縦に長く、額から顎までの距離が長い

分析結果をJSON形式で返してください：
{
  "faceShape": "判定した顔型",
  "confidence": 0.85,
  "recommendations": {
    "cuts": ["似合うカットスタイル1", "似合うカットスタイル2"],
    "colors": ["似合うカラー1", "似合うカラー2"],
    "textures": ["似合うテクスチャ1", "似合うテクスチャ2"],
    "reasoning": "この顔型に対する推薦理由"
  }
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }]
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Face analysis failed: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No analysis result received');
    }

    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid analysis response format');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Face analysis timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (detach) detach();
  }
}

// NanoBananaスタイル合成API
export async function requestStyleBlend(
  payload: StyleBlendPayload,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<StyleBlendResponse> {
  console.log('=== GEMINI BRIDGE DEBUG - MALE GENDER ===');
  console.log('Payload gender:', payload.gender);
  console.log('Is male request:', payload.gender === 'male');
  
  const controller = new AbortController();
  const detach = signal ? linkAbortSignals(signal, controller) : undefined;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const base64Data = payload.userImage.split(',')[1] || payload.userImage;
    
    // 背景設定の処理
    const getBackgroundInstruction = (background?: string) => {
      switch (background) {
        case 'indoor':
          return 'Change the background to a stylish indoor setting (cafe or salon). ';
        case 'outdoor':
          return 'Change the background to a beautiful outdoor setting (park or street). ';
        case 'none':
        default:
          return 'Keep the original background unchanged. ';
      }
    };

    // Gemini 2.5 Flash Image用の画像編集プロンプト（性別対応版）
    const genderContext = payload.gender === 'male' ? 'for a male person' : 'for a female person';
    const prompt = `Create a new image with the person's hairstyle changed to:
- Hair cut: ${payload.cut}
- Hair color: ${payload.color}
- Hair texture: ${payload.texture}
- Style this ${genderContext}

Keep the face, skin tone, expression, and clothing exactly the same.
${getBackgroundInstruction(payload.background)}Generate a realistic photo showing the new hairstyle.

IMPORTANT: This is ${payload.gender === 'male' ? 'a male styling request' : 'a female styling request'}.`;

    console.log('About to send request to Gemini API...');
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        response_modalities: ["IMAGE"],
        temperature: 0.4,
        maxOutputTokens: 8192
      }
    };
    console.log('Request body size:', JSON.stringify(requestBody).length);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    
    console.log('Response received from Gemini API');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Style blend failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('=== FULL GEMINI API RESPONSE ===');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Full response:', JSON.stringify(result, null, 2));
    
    // 生成された画像を複数の方法で探す
    console.log('=== SEARCHING FOR IMAGE DATA ===');
    
    // 方法1: inline_data
    const imageData1 = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inline_data && part.inline_data.mime_type?.startsWith('image/')
    )?.inline_data?.data;
    console.log('Method 1 - inline_data found:', imageData1 ? 'Yes' : 'No');
    
    // 方法2: inlineData (camelCase)
    const imageData2 = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData && part.inlineData.mimeType?.startsWith('image/')
    )?.inlineData?.data;
    console.log('Method 2 - inlineData found:', imageData2 ? 'Yes' : 'No');
    
    // 方法3: すべてのpartsを調べる
    if (result.candidates?.[0]?.content?.parts) {
      console.log('All parts in response:');
      result.candidates[0].content.parts.forEach((part: any, index: number) => {
        console.log(`Part ${index}:`, Object.keys(part));
      });
    }
    
    const imageData = imageData1 || imageData2;
    console.log('Final image data found:', imageData ? 'Yes' : 'No');
    console.log('=== MALE GENDER IMAGE DATA CHECK ===');
    console.log('Gender:', payload.gender);
    console.log('Image data exists:', !!imageData);
    if (imageData) {
      console.log('Image data length:', imageData.length);
    }
    
    if (imageData && imageData.length > 100) {  // Ensure we have substantial image data
      const genderIcon = payload.gender === 'male' ? '💇‍♂️' : '💇‍♀️';
      return {
        success: true,
        fusionImage: `data:image/jpeg;base64,${imageData}`,
        narrative: `${payload.cut} × ${payload.color} × ${payload.texture} の完成！

✨ Gemini AIが実際にヘアスタイルを編集しました

${genderIcon} 顔の特徴を保ちながら、美しい新しいスタイルに変更されています

🎯 選択されたスタイルが自然に適用されました`,
        descriptor: {
          cut: payload.cut,
          color: payload.color,
          texture: payload.texture,
          summary: 'AI編集完了'
        }
      };
    } else {
      console.log('=== IMAGE DATA ISSUE - THROWING ERROR ===');
      console.log('Will trigger fallback mechanism in StyleBlendService');
      throw new Error('No generated image received or image data too small');
    }
  } catch (error) {
    console.error('=== GEMINI API ERROR DETAILS ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    if (controller.signal.aborted) {
      throw new Error('Style blend timed out after 15 seconds');
    }
    
    // エラーを再投げして、上位で処理させる
    throw error;
    return {
      success: true,
      fusionImage: payload.userImage, // 元の画像を使用
      narrative: `${payload.cut} × ${payload.color} × ${payload.texture} のスタイル提案
      
✨ 選択されたスタイルはトレンドの組み合わせです

🎯 調整提案: 顔型に合わせて長さやレイヤーを調整することで、より魅力的に仕上がります

💫 完成イメージ: 自然で美しい仕上がりが期待できる組み合わせです`,
      descriptor: {
        cut: payload.cut,
        color: payload.color,
        texture: payload.texture,
        summary: 'スタイル提案完了'
      }
    };
  } finally {
    clearTimeout(timeoutId);
    if (detach) detach();
  }
}

// NanoBanana画像生成メソッド - Google AI StudioのNanoBanana機能を活用
async function generateNanoBananaStyledImage(
  originalImage: string, 
  visualDescription: string, 
  technicalInstructions: string
): Promise<string> {
  try {
    // Gemini Vision APIを使って実際の画像編集分析を行う
    const analysisRequest = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { 
              text: `あなたはプロの美容師AIです。この写真の髪型を以下の指示で変更した場合の詳細な完成イメージを説明してください：

変更内容: ${visualDescription}
技術指示: ${technicalInstructions}

完成後の詳細なビジュアルを日本語で説明してください。髪の色、長さ、質感、スタイリングまで具体的に。` 
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: originalImage.split(',')[1] || originalImage
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      })
    });

    if (analysisRequest.ok) {
      const analysisResult = await analysisRequest.json();
      const analysisText = analysisResult.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (analysisText) {
        console.log('NanoBanana analysis completed:', analysisText);
        
        // 分析結果をもとに、元の画像に効果を加えて返す
        // 実際のNanoBanana機能では、この分析結果をもとに画像が編集される
        return await createNanoBananaProcessedImage(originalImage, analysisText);
      }
    }

    // フォールバック処理
    return await createNanoBananaProcessedImage(originalImage, visualDescription);

  } catch (error) {
    console.warn('NanoBanana processing failed:', error);
    return await createNanoBananaProcessedImage(originalImage, visualDescription);
  }
}

// NanoBanana風の画像処理実装（模擬）
async function createNanoBananaProcessedImage(originalImage: string, description: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 現在は元の画像をそのまま返すが、将来的には以下を実装予定：
      // 1. Expo ImageManipulator を使った実際の画像加工
      // 2. 髪の部分の色調変更、形状変更
      // 3. AI分析結果に基づく自動調整
      
      console.log('NanoBanana image processing simulated for:', description);
      
      // 元の画像をベースとした編集済み画像を返す
      resolve(originalImage);
    }, 3000); // NanoBanana処理をシミュレート
  });
}