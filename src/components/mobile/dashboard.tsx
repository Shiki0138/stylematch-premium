'use client';

import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { SparkleButton } from '../ui/sparkle-button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Camera, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp, 
  MapPin, 
  Heart,
  Bell,
  Search,
  User
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  onStartDiagnosis: () => void;
  onViewStylists: () => void;
  onViewProfile: () => void;
}

const recentStylists = [
  {
    id: '1',
    name: '佐藤美香',
    salon: 'Hair Studio MIKA',
    image: 'https://images.unsplash.com/photo-1563798163029-5448a0ffd596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwYmVhdXR5JTIwc2Fsb24lMjBoYWlyc3R5bGlzdHxlbnwxfHx8fDE3NTc3NzE2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    specialties: ['カラー', 'カット']
  },
  {
    id: '2',
    name: '田中優子',
    salon: 'Salon Elegant',
    image: 'https://images.unsplash.com/photo-1624850667288-31fde0ec04bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwamFwYW5lc2UlMjB3b21hbiUyMHBvcnRyYWl0JTIwZmFjZXxlbnwxfHx8fDE3NTc3NzE2ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    specialties: ['パーマ', 'トリートメント']
  }
];

const quickStats = [
  {
    icon: TrendingUp,
    label: '診断精度',
    value: '96%',
    color: 'text-green-600'
  },
  {
    icon: Users,
    label: 'マッチング',
    value: '127人',
    color: 'text-pink-600'
  },
  {
    icon: Heart,
    label: 'お気に入り',
    value: '8件',
    color: 'text-red-600'
  }
];

export function Dashboard({ onStartDiagnosis, onViewStylists, onViewProfile }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 pt-12 pb-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">おはようございます</h1>
            <p className="text-pink-100 text-sm">今日も素敵な一日を</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={onViewProfile}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-6 h-6 mx-auto mb-1 text-pink-100" />
              <p className="text-lg font-semibold">{stat.value}</p>
              <p className="text-xs text-pink-100">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-6 space-y-6">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                AI顔型診断を始めよう
              </h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                最新のAI技術であなたの顔型を診断し、最適な美容師をマッチング
              </p>
              <SparkleButton 
                onClick={onStartDiagnosis}
                size="lg"
                className="w-full"
              >
                診断スタート
              </SparkleButton>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          <Button
            variant="outline"
            onClick={onViewStylists}
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-pink-50 hover:border-pink-200"
          >
            <Users className="w-6 h-6 text-pink-500" />
            <span className="text-sm">美容師を探す</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200"
          >
            <Calendar className="w-6 h-6 text-purple-500" />
            <span className="text-sm">予約確認</span>
          </Button>
        </motion.div>

        {/* Recent stylists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">人気の美容師</h3>
            <Button variant="ghost" size="sm" onClick={onViewStylists}>
              すべて見る
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentStylists.map((stylist, index) => (
              <motion.div
                key={stylist.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <ImageWithFallback
                        src={stylist.image}
                        alt={stylist.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{stylist.name}</h4>
                        <p className="text-sm text-gray-600">{stylist.salon}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-600 ml-1">{stylist.rating}</span>
                          </div>
                          <div className="flex space-x-1">
                            {stylist.specialties.map((specialty) => (
                              <Badge key={specialty} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        予約
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">今日のヒント</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    診断前は髪を結ばずに、自然な状態で撮影することをおすすめします。より正確な分析結果が得られます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom navigation space */}
      <div className="h-20" />
    </div>
  );
}