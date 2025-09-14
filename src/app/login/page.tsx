'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PulseButton, HoverSparkle } from '@/components/ui/MicroInteractions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'ログインに失敗しました';
      if (error.message.includes('user-not-found')) {
        errorMessage = 'このメールアドレスは登録されていません';
      } else if (error.message.includes('wrong-password')) {
        errorMessage = 'パスワードが間違っています';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = '有効なメールアドレスを入力してください';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = '試行回数が多すぎます。しばらく待ってから再試行してください';
      }
      
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      router.push(redirectTo);
    } catch (error) {
      console.error('Google login error:', error);
      setErrors({ email: 'Googleログインに失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setErrors({ email: 'メールアドレスを入力してください' });
      return;
    }

    try {
      await resetPassword(formData.email);
      setResetEmailSent(true);
      setErrors({});
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ email: 'パスワードリセットメールの送信に失敗しました' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <HoverSparkle>
          <Card className="border-2 border-purple-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-800">
                🌸 おかえりなさい
              </CardTitle>
              <p className="text-gray-600 mt-2">
                StyleMatchにログインして美容の旅を続けましょう
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {resetEmailSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="text-green-400">✅</div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        パスワードリセットメールを送信しました。
                        メールをご確認ください。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@example.com"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    パスワード
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="パスワードを入力"
                    autoComplete="current-password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">ログイン状態を保持</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    パスワードを忘れた方
                  </button>
                </div>

                {/* Login Button */}
                <PulseButton
                  type="submit"
                  disabled={isLoading}
                  variant="primary"
                  className="w-full text-lg py-4 mt-6"
                >
                  {isLoading ? 'ログイン中...' : '💝 ログイン'}
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

              {/* Google Login */}
              <PulseButton
                type="button"
                onClick={handleGoogleLogin}
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
                Googleでログイン
              </PulseButton>

              {/* Test Mode Notice */}
              {process.env.NEXT_PUBLIC_ENABLE_TEST_MODE === 'true' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-yellow-700 font-semibold mb-2">
                      🧪 テストモード有効
                    </p>
                    <p className="text-xs text-yellow-600">
                      認証なしで診断を開始できます
                    </p>
                    <Link href="/diagnosis" className="text-yellow-700 hover:underline text-sm font-semibold">
                      診断を始める →
                    </Link>
                  </div>
                </div>
              )}

              {/* Signup Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  まだアカウントをお持ちでないですか？{' '}
                  <Link href="/signup" className="text-purple-600 hover:underline font-semibold">
                    新規登録
                  </Link>
                </p>
              </div>

              {/* Quick Access */}
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">クイックアクセス</p>
                <div className="flex justify-center space-x-4 text-xs">
                  <Link href="/stylists" className="text-purple-600 hover:underline">
                    美容師を探す
                  </Link>
                  <Link href="/about" className="text-purple-600 hover:underline">
                    StyleMatchとは
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverSparkle>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}