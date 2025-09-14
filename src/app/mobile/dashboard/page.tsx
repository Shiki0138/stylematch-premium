'use client';

import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/mobile/MobileContainer';
import { GradientBg } from '@/components/mobile/GradientBg';
import { SparkleButton } from '@/components/mobile/SparkleButton';
import { useAuth } from '@/lib/firebase/auth-context';
import { 
  ArrowLeft,
  Camera,
  Users,
  Calendar,
  User as UserIcon,
  Clock,
  Star,
  ChevronRight,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function MobileDashboardPage() {
  const router = useRouter();
  const { userData } = useAuth();

  const menuItems = [
    {
      icon: Clock,
      title: '予約履歴',
      description: '過去の予約を確認',
      path: '/mobile/bookings/history'
    },
    {
      icon: Star,
      title: 'お気に入り',
      description: 'お気に入りの美容師',
      path: '/mobile/favorites'
    },
    {
      icon: Camera,
      title: '診断履歴',
      description: 'AI診断の結果を確認',
      path: '/mobile/diagnosis/history'
    },
    {
      icon: Settings,
      title: '設定',
      description: 'アカウント設定',
      path: '/mobile/settings'
    }
  ];

  return (
    <MobileContainer>
      <GradientBg variant="soft" className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm px-4 pt-safe pb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">マイページ</h1>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/mobile/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Profile Section */}
          <div className="px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {userData?.name ? userData.name.charAt(0) : 'U'}
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {userData?.name || 'ゲストユーザー'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {userData?.email || 'guest@example.com'}
                  </p>
                  {userData?.diagnoses?.faceShape && (
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded-full text-xs">
                        {userData.diagnoses.faceShape}
                      </span>
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                        {userData.diagnoses.personalColor}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!userData?.diagnoses?.faceShape && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">
                    AI診断であなたに似合うスタイルを発見
                  </p>
                  <SparkleButton
                    onClick={() => router.push('/mobile/diagnosis')}
                    size="sm"
                    className="w-full"
                  >
                    診断を始める
                  </SparkleButton>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Stats */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg p-4 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-pink-500">3</div>
                <div className="text-xs text-gray-600">予約済み</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-4 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-purple-500">12</div>
                <div className="text-xs text-gray-600">お気に入り</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg p-4 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-orange-500">5</div>
                <div className="text-xs text-gray-600">レビュー</div>
              </motion.div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-4 space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => router.push(item.path)}
                  className="w-full bg-white rounded-lg p-4 shadow-sm flex items-center justify-between touch-feedback active:scale-98"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="px-4 py-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Handle logout
                router.push('/mobile');
              }}
            >
              ログアウト
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="w-full">
            <div className="flex items-center justify-around pt-2 pb-safe">
              <button 
                onClick={() => router.push('/mobile/diagnosis')}
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-gray-400 touch-feedback active:bg-gray-50 rounded-lg transition-colors"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">診断</span>
              </button>
              <button 
                onClick={() => router.push('/mobile/stylists')}
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-gray-400 touch-feedback active:bg-gray-50 rounded-lg transition-colors"
              >
                <Users className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">美容師</span>
              </button>
              <button 
                onClick={() => router.push('/mobile/dashboard')}
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-gray-400 touch-feedback active:bg-gray-50 rounded-lg transition-colors"
              >
                <Calendar className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">予約</span>
              </button>
              <button 
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-pink-500 touch-feedback active:bg-pink-50 rounded-lg transition-colors"
              >
                <UserIcon className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">マイページ</span>
              </button>
            </div>
          </div>
        </div>
      </GradientBg>
    </MobileContainer>
  );
}