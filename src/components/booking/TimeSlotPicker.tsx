'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  availableSlots: Date[];
  selectedSlot?: Date;
  onSlotSelect: (slot: Date) => void;
  className?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  availableSlots,
  selectedSlot,
  onSlotSelect,
  className
}) => {
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const isSelected = (slot: Date): boolean => {
    if (!selectedSlot) return false;
    return slot.getTime() === selectedSlot.getTime();
  };

  // 時間帯でグループ化
  const groupedSlots = availableSlots.reduce((groups, slot) => {
    const hour = slot.getHours();
    let period: string;
    
    if (hour < 12) {
      period = '午前';
    } else if (hour < 15) {
      period = '昼';
    } else if (hour < 18) {
      period = '午後';
    } else {
      period = '夜';
    }

    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(slot);
    return groups;
  }, {} as Record<string, Date[]>);

  const periodOrder = ['午前', '昼', '午後', '夜'];

  if (availableSlots.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-text-secondary">
          選択された日付に予約可能な時間帯はありません
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {periodOrder.map(period => {
        const slots = groupedSlots[period];
        if (!slots || slots.length === 0) return null;

        return (
          <div key={period}>
            <h3 className="font-semibold mb-3 text-text-secondary">
              {period}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {slots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => onSlotSelect(slot)}
                  className={cn(
                    'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                    'border hover:border-primary',
                    isSelected(slot)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-gray-300 hover:bg-primary-50'
                  )}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};