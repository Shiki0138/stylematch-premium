'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { StylistCard } from '../ui/stylist-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';

interface StylistListProps {
  onBack: () => void;
  onStylistSelect: (stylist: any) => void;
}

const mockStylists = [
  {
    id: '1',
    name: '佐藤美香',
    salon: 'Hair Studio MIKA',
    image: 'https://images.unsplash.com/photo-1563798163029-5448a0ffd596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwYmVhdXR5JTIwc2Fsb24lMjBoYWlyc3R5bGlzdHxlbnwxfHx8fDE3NTc3NzE2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviewCount: 234,
    specialties: ['カラー', 'カット', 'トリートメント'],
    location: '渋谷区',
    distance: '0.8km',
    matchScore: 94,
    isLiked: true
  },
  {
    id: '2',
    name: '田中優子',
    salon: 'Salon Elegant',
    image: 'https://images.unsplash.com/photo-1624850667288-31fde0ec04bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwamFwYW5lc2UlMjB3b21hbiUyMHBvcnRyYWl0JTIwZmFjZXxlbnwxfHx8fDE3NTc3NzE2ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviewCount: 156,
    specialties: ['パーマ', 'カット', 'スタイリング'],
    location: '新宿区',
    distance: '1.2km',
    matchScore: 87,
    isLiked: false
  },
  {
    id: '3',
    name: '山田彩',
    salon: 'Beauty Lounge AYA',
    image: 'https://images.unsplash.com/photo-1678121039070-fedd1e9c2cf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtb2Rlcm4lMjBiZWF1dHklMjBzYWxvbiUyMGludGVyaW9yJTIwZGVzaWdufGVufDF8fHx8MTc1Nzc3MTY5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviewCount: 189,
    specialties: ['ブリーチ', 'デザインカラー', 'ヘアケア'],
    location: '原宿',
    distance: '2.1km',
    matchScore: 82,
    isLiked: true
  },
  {
    id: '4',
    name: '鈴木麻衣',
    salon: 'Hair Design M',
    image: 'https://images.unsplash.com/photo-1563798163029-5448a0ffd596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwYmVhdXR5JTIwc2Fsb24lMjBoYWlyc3R5bGlzdHxlbnwxfHx8fDE3NTc3NzE2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    reviewCount: 98,
    specialties: ['ショートカット', 'レイヤー'],
    location: '表参道',
    distance: '1.5km',
    matchScore: 79,
    isLiked: false
  }
];

const filterOptions = {
  distance: ['0.5km以内', '1km以内', '2km以内', '5km以内'],
  rating: ['4.5以上', '4.0以上', '3.5以上'],
  specialty: ['カット', 'カラー', 'パーマ', 'トリートメント', 'ブリーチ', 'ヘアケア'],
  price: ['¥3,000以下', '¥5,000以下', '¥8,000以下', '¥10,000以上']
};

export function StylistList({ onBack, onStylistSelect }: StylistListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('match');
  const [stylists, setStylists] = useState(mockStylists);

  const handleLike = (id: string) => {
    setStylists(prev => 
      prev.map(stylist => 
        stylist.id === id 
          ? { ...stylist, isLiked: !stylist.isLiked }
          : stylist
      )
    );
  };

  const handleBook = (stylist: any) => {
    onStylistSelect(stylist);
  };

  const sortedStylists = [...stylists].sort((a, b) => {
    switch (sortBy) {
      case 'match':
        return b.matchScore - a.matchScore;
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      default:
        return 0;
    }
  });

  const filteredStylists = sortedStylists.filter(stylist =>
    stylist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stylist.salon.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stylist.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">美容師一覧</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Filter className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>フィルター</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">距離</h3>
                    <div className="space-y-2">
                      {filterOptions.distance.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">評価</h3>
                    <div className="space-y-2">
                      {filterOptions.rating.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">得意分野</h3>
                    <div className="space-y-2">
                      {filterOptions.specialty.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="美容師名、サロン名、得意分野で検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats and sort */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">{filteredStylists.length}名の美容師が見つかりました</p>
          
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-transparent border-none outline-none"
            >
              <option value="match">マッチ度順</option>
              <option value="rating">評価順</option>
              <option value="distance">距離順</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 bg-white border-t">
        <div className="flex space-x-2 overflow-x-auto">
          <Badge variant="secondary" className="whitespace-nowrap">
            <MapPin className="w-3 h-3 mr-1" />
            2km以内
          </Badge>
          <Badge variant="secondary" className="whitespace-nowrap">
            <Star className="w-3 h-3 mr-1" />
            4.5以上
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap">
            カラー得意
          </Badge>
        </div>
      </div>

      {/* Stylist list */}
      <div className="p-4">
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
          {filteredStylists.map((stylist, index) => (
            <motion.div
              key={stylist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StylistCard
                {...stylist}
                onLike={() => handleLike(stylist.id)}
                onBook={() => handleBook(stylist)}
                className={viewMode === 'grid' ? 'h-full' : ''}
              />
            </motion.div>
          ))}
        </div>

        {filteredStylists.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">検索条件に一致する美容師が見つかりませんでした</p>
            <Button
              variant="ghost"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-pink-500"
            >
              検索条件をリセット
            </Button>
          </div>
        )}
      </div>

      {/* Bottom navigation space */}
      <div className="h-20" />
    </div>
  );
}