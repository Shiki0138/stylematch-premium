'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/mobile/MobileContainer';
import { GradientBg } from '@/components/mobile/GradientBg';
import { SparkleButton } from '@/components/mobile/SparkleButton';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/useAppStore';
import { useDiagnosisStore } from '@/lib/stores/diagnosisStore';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Heart,
  Filter,
  Search,
  Camera,
  Users,
  Calendar,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Mock data for stylists
const mockStylists = [
  {
    id: '1',
    name: '田中 美咲',
    salon: 'Beauty Salon Tokyo',
    rating: 4.8,
    reviews: 128,
    distance: '0.5km',
    specialties: ['卵型', 'スプリング'],
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    matchScore: 95
  },
  {
    id: '2',
    name: '佐藤 健太',
    salon: 'Hair Studio Shibuya',
    rating: 4.9,
    reviews: 89,
    distance: '1.2km',
    specialties: ['丸顔', 'オータム'],
    image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400',
    matchScore: 88
  },
  {
    id: '3',
    name: '鈴木 あや',
    salon: 'Premium Cut Ginza',
    rating: 4.7,
    reviews: 201,
    distance: '2.3km',
    specialties: ['面長', 'サマー'],
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=400',
    matchScore: 82
  }
];

export default function MobileStylistsPage() {
  const router = useRouter();
  const { userData } = useAuth();
  const { currentDiagnosis } = useAppStore();
  const diagnosisResult = useDiagnosisStore((state) => state.diagnosisResult);
  const [selectedTab, setSelectedTab] = useState('stylists');
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    router.push('/mobile');
  };

  const handleStylistSelect = (stylistId: string) => {
    router.push(`/mobile/stylists/${stylistId}`);
  };

  return (
    <MobileContainer>
      <GradientBg variant="soft" className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm px-4 pt-safe pb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">美容師を探す</h1>
            <Button variant="ghost" size="icon" onClick={() => setShowFilter(!showFilter)}>
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="名前やサロン名で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Diagnosis Result Banner */}
          {currentDiagnosis && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-lg"
            >
              <p className="text-sm font-medium">
                {currentDiagnosis.faceShape}・{currentDiagnosis.personalColor}
                のあなたにおすすめ
              </p>
            </motion.div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Location Permission */}
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">近くの美容師を表示中</span>
              </div>
              <button className="text-sm text-blue-600 font-medium">
                変更
              </button>
            </div>
          </div>

          {/* Stylist List */}
          <div className="px-4 py-4 space-y-4">
            {mockStylists.map((stylist, index) => (
              <motion.div
                key={stylist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleStylistSelect(stylist.id)}
                className="bg-white rounded-xl shadow-sm overflow-hidden touch-feedback active:scale-98"
              >
                <div className="flex p-4">
                  {/* Profile Image */}
                  <div className="relative">
                    <img
                      src={stylist.image}
                      alt={stylist.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    {stylist.matchScore >= 90 && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {stylist.matchScore}%
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 ml-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{stylist.name}</h3>
                        <p className="text-sm text-gray-600">{stylist.salon}</p>
                      </div>
                      <button className="p-2">
                        <Heart className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    <div className="flex items-center mt-2 text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="font-medium">{stylist.rating}</span>
                        <span className="text-gray-500 ml-1">({stylist.reviews})</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-600">{stylist.distance}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {stylist.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 bg-pink-50 text-pink-700 rounded-full text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="px-4 py-4">
            <Button variant="outline" className="w-full">
              もっと見る
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
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-pink-500 touch-feedback active:bg-pink-50 rounded-lg transition-colors"
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
                onClick={() => router.push('/mobile/dashboard')}
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-gray-400 touch-feedback active:bg-gray-50 rounded-lg transition-colors"
              >
                <User className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">マイページ</span>
              </button>
            </div>
          </div>
        </div>
      </GradientBg>
    </MobileContainer>
  );
}