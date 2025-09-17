'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ProgressSteps } from '../ui/progress-steps';
import { SparkleButton } from '../ui/sparkle-button';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Phone,
  Mail,
  CheckCircle,
  Scissors,
  Palette,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingProps {
  stylist: any;
  onBack: () => void;
  onComplete: () => void;
}

const steps = [
  { id: 1, label: 'サービス' },
  { id: 2, label: '日時' },
  { id: 3, label: '確認' }
];

const services = [
  {
    id: 'cut',
    name: 'カット',
    price: 4500,
    duration: 60,
    icon: Scissors,
    description: 'シャンプー・ブロー込み'
  },
  {
    id: 'color',
    name: 'カラー',
    price: 6800,
    duration: 90,
    icon: Palette,
    description: '全体カラー・シャンプー・ブロー込み'
  },
  {
    id: 'cut-color',
    name: 'カット + カラー',
    price: 9800,
    duration: 120,
    icon: Heart,
    description: '人気のセットメニュー',
    popular: true
  }
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

const availableDates = [
  { date: '2025-01-15', dayName: '今日', available: [13, 14, 15, 16, 17] },
  { date: '2025-01-16', dayName: '明日', available: [9, 10, 11, 13, 14, 15, 16, 17, 18] },
  { date: '2025-01-17', dayName: '金', available: [9, 10, 11, 13, 14, 15] },
  { date: '2025-01-18', dayName: '土', available: [9, 10, 11, 13, 14] }
];

export function Booking({ stylist, onBack, onComplete }: BookingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBooking = async () => {
    setIsBooking(true);
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBooking(false);
    onComplete();
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedDateData = availableDates.find(d => d.date === selectedDate);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedService !== '';
      case 2:
        return selectedDate !== '' && selectedTime !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={currentStep === 1 ? onBack : handlePrevious}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">予約</h1>
          <div className="w-6" />
        </div>
        
        <ProgressSteps steps={steps} currentStep={currentStep} />
      </div>

      {/* Stylist info */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center space-x-3">
          <ImageWithFallback
            src={stylist.image}
            alt={stylist.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-medium">{stylist.name}</h3>
            <p className="text-sm text-gray-600">{stylist.salon}</p>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">{stylist.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold mb-4">サービスを選択</h2>
              
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all ${
                    selectedService === service.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'hover:border-pink-300'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                          <service.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{service.name}</h3>
                            {service.popular && (
                              <Badge className="bg-orange-500 text-white text-xs">人気</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {service.duration}分
                            </span>
                            <span className="font-medium text-pink-600">¥{service.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      {selectedService === service.id && (
                        <CheckCircle className="w-5 h-5 text-pink-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold">日時を選択</h2>
              
              {/* Date selection */}
              <div>
                <h3 className="font-medium mb-3">日付</h3>
                <div className="grid grid-cols-4 gap-2">
                  {availableDates.map((dateInfo) => (
                    <Button
                      key={dateInfo.date}
                      variant={selectedDate === dateInfo.date ? "default" : "outline"}
                      onClick={() => {
                        setSelectedDate(dateInfo.date);
                        setSelectedTime(''); // Reset time when date changes
                      }}
                      className={`h-16 flex flex-col items-center justify-center ${
                        selectedDate === dateInfo.date 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                          : ''
                      }`}
                    >
                      <span className="text-xs">{dateInfo.dayName}</span>
                      <span className="text-sm font-medium">
                        {new Date(dateInfo.date).getDate()}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time selection */}
              {selectedDate && (
                <div>
                  <h3 className="font-medium mb-3">時間</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => {
                      const timeIndex = parseInt(time.split(':')[0]);
                      const isAvailable = selectedDateData?.available.includes(timeIndex);
                      
                      return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => isAvailable && setSelectedTime(time)}
                          disabled={!isAvailable}
                          className={`h-12 ${
                            selectedTime === time 
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                              : isAvailable
                              ? ''
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold">予約内容確認</h2>
              
              {/* Booking summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">予約詳細</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">サービス</span>
                    <span className="font-medium">{selectedServiceData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">日付</span>
                    <span className="font-medium">
                      {selectedDateData?.dayName} {new Date(selectedDate).getMonth() + 1}/{new Date(selectedDate).getDate()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">時間</span>
                    <span className="font-medium">{selectedTime} ~ </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">所要時間</span>
                    <span className="font-medium">{selectedServiceData?.duration}分</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">合計金額</span>
                      <span className="font-semibold text-pink-600">¥{selectedServiceData?.price.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Salon info */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">サロン情報</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span>東京都渋谷区神南1-2-3 ビル3F</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span>03-1234-5678</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span>info@hairsalonstudio.com</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <div>
                <h3 className="font-medium mb-3">要望・質問（任意）</h3>
                <Textarea
                  placeholder="髪質や希望スタイルなど、美容師さんに伝えたいことがあれば入力してください"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-24"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="mt-8 space-y-3">
          {currentStep === 3 ? (
            <SparkleButton
              onClick={handleBooking}
              disabled={isBooking || !canProceed()}
              size="lg"
              className="w-full"
            >
              {isBooking ? '予約中...' : '予約を確定する'}
            </SparkleButton>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 h-12"
            >
              次へ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}