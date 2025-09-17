import { Card } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Star, MapPin, Clock, Heart } from 'lucide-react';
import { cn } from './utils';

interface StylistCardProps {
  id: string;
  name: string;
  salon: string;
  image: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  location: string;
  distance: string;
  matchScore: number;
  isLiked?: boolean;
  className?: string;
  onLike?: () => void;
  onBook?: () => void;
}

export function StylistCard({
  id,
  name,
  salon,
  image,
  rating,
  reviewCount,
  specialties,
  location,
  distance,
  matchScore,
  isLiked = false,
  className,
  onLike,
  onBook
}: StylistCardProps) {
  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-all duration-300', className)}>
      <div className="relative">
        <ImageWithFallback
          src={image}
          alt={`${name}さんのプロフィール`}
          className="w-full h-48 object-cover"
        />
        
        {/* Match Score Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn(
            'px-2 py-1 text-xs font-semibold',
            matchScore >= 80 ? 'bg-green-500 text-white' :
            matchScore >= 60 ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'
          )}>
            マッチ度 {matchScore}%
          </Badge>
        </div>
        
        {/* Like Button */}
        <button
          onClick={onLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart className={cn(
            'w-4 h-4 transition-colors',
            isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-600'
          )} />
        </button>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-600">{salon}</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
            <span>({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{distance}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {specialties.slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {specialty}
            </Badge>
          ))}
          {specialties.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
              +{specialties.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>{location}</span>
        </div>
        
        <Button 
          onClick={onBook}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
        >
          予約する
        </Button>
      </div>
    </Card>
  );
}