'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  selectedDate,
  minDate = new Date(),
  maxDate,
  disabledDates = [],
  className
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dates, setDates] = useState<(Date | null)[]>([]);

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  useEffect(() => {
    generateCalendarDates();
  }, [currentMonth]);

  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates: (Date | null)[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      if (current.getMonth() === month) {
        dates.push(new Date(current));
      } else {
        dates.push(null);
      }
      current.setDate(current.getDate() + 1);
    }

    setDates(dates);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const isDateDisabled = (date: Date | null): boolean => {
    if (!date) return true;
    
    // 最小日付チェック
    if (minDate && date < minDate) return true;
    
    // 最大日付チェック
    if (maxDate && date > maxDate) return true;
    
    // 無効日付チェック
    return disabledDates.some(disabled => 
      disabled.toDateString() === date.toDateString()
    );
  };

  const isDateSelected = (date: Date | null): boolean => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };

  return (
    <div className={cn('bg-white rounded-xl shadow-soft p-4', className)}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="前の月"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold">
          {currentMonth.getFullYear()}年 {monthNames[currentMonth.getMonth()]}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="次の月"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-sm font-medium py-2',
              index === 0 && 'text-red-500',
              index === 6 && 'text-blue-500'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date, index) => {
          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          const today = isToday(date);
          const dayOfWeek = date ? date.getDay() : index % 7;

          return (
            <button
              key={index}
              onClick={() => date && !disabled && onDateSelect(date)}
              disabled={disabled || !date}
              className={cn(
                'aspect-square rounded-lg transition-all relative',
                'hover:bg-gray-100 disabled:cursor-not-allowed',
                selected && 'bg-primary text-white hover:bg-primary-600',
                today && !selected && 'ring-2 ring-primary ring-inset',
                disabled && 'text-gray-300',
                !date && 'invisible',
                dayOfWeek === 0 && !selected && 'text-red-500',
                dayOfWeek === 6 && !selected && 'text-blue-500'
              )}
            >
              <span className="text-sm">{date?.getDate()}</span>
              {today && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-primary rounded" />
          <span>選択中</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-primary rounded" />
          <span>今日</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded" />
          <span>予約不可</span>
        </div>
      </div>
    </div>
  );
};