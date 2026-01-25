'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '@/lib/examUtils';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export function Timer({ duration, onTimeUp, isPaused = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;
  const isLowTime = timeLeft < 300; // Less than 5 minutes

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-3">
        <Clock className={`w-5 h-5 ${isLowTime ? 'text-red-600' : 'text-gray-600'}`} />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Time Remaining</span>
            <span
              className={`text-lg font-bold ${
                isLowTime ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isLowTime ? 'bg-red-600' : 'bg-primary-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
