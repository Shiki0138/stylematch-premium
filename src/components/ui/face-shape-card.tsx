import { Card } from './card';
import { Badge } from './badge';
import { cn } from './utils';

interface FaceShapeCardProps {
  shape: string;
  confidence: number;
  description: string;
  celebrity: string;
  recommendedStyles: string[];
  isActive?: boolean;
  className?: string;
}

export function FaceShapeCard({
  shape,
  confidence,
  description,
  celebrity,
  recommendedStyles,
  isActive = false,
  className
}: FaceShapeCardProps) {
  return (
    <Card className={cn(
      'p-6 transition-all duration-300 border-2',
      isActive ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg' : 'border-gray-200 hover:border-pink-300',
      className
    )}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white">
              {shape.charAt(0)}
            </div>
            <h3 className="font-semibold text-lg">{shape}</h3>
          </div>
          <Badge 
            variant={confidence >= 80 ? 'default' : 'secondary'}
            className={cn(
              confidence >= 80 && 'bg-green-100 text-green-800'
            )}
          >
            {confidence}%
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium text-pink-600">参考芸能人:</span> {celebrity}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium text-sm">おすすめヘアスタイル:</p>
          <div className="flex flex-wrap gap-2">
            {recommendedStyles.map((style, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                {style}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}