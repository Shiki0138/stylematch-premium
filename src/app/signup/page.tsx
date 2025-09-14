'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PulseButton, HoverSparkle } from '@/components/ui/MicroInteractions';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'female' | 'male' | 'other';
  prefecture: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    firstName: '',
    lastName: '',
    age: 25,
    gender: 'female',
    prefecture: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 都道府県リスト
  const prefectures = [
    '東京都', '大阪府', '神奈川県', '愛知県', '埼玉県', '千葉県', '兵庫県', '北海道',
    '福岡県', '静岡県', '茨城県', '広島県', '京都府', '宮城県', '新潟県', '長野県',
    '岐阜県', '栃木県', '群馬県', '岡山県', '三重県', '熊本県', '鹿児島県', '沖縄県',
    '青森県', '岩手県', '秋田県', '山形県', '福島県', '山梨県', '富山県', '石川県',
    '福井県', '滋賀県', '奈良県', '和歌山県', '鳥取県', '島根県', '山口県', '徳島県',
    '香川県', '愛媛県', '高知県', '佐賀県', '長崎県', '大分県', '宮崎県'
  ];

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    // Display name
    if (!formData.displayName.trim()) {
      newErrors.displayName = '表示名を入力してください';
    }

    // First name
    if (!formData.firstName.trim()) {
      newErrors.firstName = '名前を入力してください';
    }

    // Age
    if (!formData.age || formData.age < 13 || formData.age > 100) {
      newErrors.age = '13歳以上100歳以下で入力してください';
    }

    // Terms and privacy
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '利用規約に同意してください';
    }
    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'プライバシーポリシーに同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signup(
        formData.email,
        formData.password,
        formData.displayName,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: formData.age,
          gender: formData.gender,
          prefecture: formData.prefecture
        }
      );
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ 
        email: error.message.includes('email-already-in-use') 
          ? 'このメールアドレスは既に使用されています' 
          : 'アカウント作成に失敗しました' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Google signup error:', error);
      setErrors({ email: 'Googleアカウントでのサインアップに失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <HoverSparkle>
          <Card className="border-2 border-pink-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-800">
                ✨ StyleMatch へようこそ ✨
              </CardTitle>
              <p className="text-gray-600 mt-2">
                AI美容診断で理想のスタイリストと出会いましょう
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    メールアドレス *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      パスワード *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="6文字以上"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      パスワード確認 *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="パスワード再入力"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    表示名 * <span className="text-xs text-gray-500">（他のユーザーに表示される名前）</span>
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.displayName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="さくら"
                  />
                  {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
                </div>

                {/* Name */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      お名前（姓）*
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="田中"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      お名前（名）*
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="花子"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                </div>

                {/* Age and Gender */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      年齢 *
                    </label>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.age ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      性別
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value as 'female' | 'male' | 'other')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="female">女性</option>
                      <option value="male">男性</option>
                      <option value="other">その他</option>
                    </select>
                  </div>
                </div>

                {/* Prefecture */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    お住まいの地域
                  </label>
                  <select
                    value={formData.prefecture}
                    onChange={(e) => handleInputChange('prefecture', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">選択してください</option>
                    {prefectures.map(pref => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                </div>

                {/* Terms and Privacy */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">
                      <Link href="/terms" className="text-pink-600 hover:underline">利用規約</Link>に同意します *
                    </span>
                  </label>
                  {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}
                  
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.agreeToPrivacy}
                      onChange={(e) => handleInputChange('agreeToPrivacy', e.target.checked)}
                      className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">
                      <Link href="/privacy" className="text-pink-600 hover:underline">プライバシーポリシー</Link>に同意します *
                    </span>
                  </label>
                  {errors.agreeToPrivacy && <p className="text-red-500 text-sm">{errors.agreeToPrivacy}</p>}
                </div>

                {/* Submit Button */}
                <PulseButton
                  type="submit"
                  disabled={isLoading}
                  variant="primary"
                  className="w-full text-lg py-4 mt-6"
                >
                  {isLoading ? '作成中...' : '🌸 アカウントを作成する'}
                </PulseButton>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">または</span>
                </div>
              </div>

              {/* Google Signup */}
              <PulseButton
                type="button"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                variant="secondary"
                className="w-full text-lg py-4"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Googleでサインアップ
              </PulseButton>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  既にアカウントをお持ちですか？{' '}
                  <Link href="/login" className="text-pink-600 hover:underline font-semibold">
                    ログイン
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </HoverSparkle>
      </div>
    </div>
  );
}