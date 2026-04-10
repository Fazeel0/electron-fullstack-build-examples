import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Flame, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000/api';

const StreakWidget = () => {
  const { data: streaks, isLoading } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await axios.get(`${API}/streak`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build last 30 days map
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const streakMap = (streaks || []).reduce((acc, s) => {
    const d = new Date(s.date).toISOString().split('T')[0];
    acc[d] = s;
    return acc;
  }, {});

  // Calculate current streak
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (streakMap[days[i]]?.coded) currentStreak++;
    else break;
  }

  const intensityClass = (day) => {
    const s = streakMap[day];
    if (!s?.coded) return 'bg-slate-700/40';
    if (s.commitCount >= 10) return 'bg-primary';
    if (s.commitCount >= 5) return 'bg-primary/70';
    return 'bg-primary/40';
  };

  return (
    <div className="glass rounded-3xl p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-xl">
            <Flame className="text-orange-400 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white leading-tight">
              {isLoading ? '—' : currentStreak} Day Streak
            </h2>
            <p className="text-slate-500 text-[10px]">Last 30 days</p>
          </div>
        </div>
        {currentStreak >= 3 && (
          <span className="text-orange-400 text-lg">🔥</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="text-primary animate-spin" size={20} />
        </div>
      ) : (
        <div className="grid grid-cols-10 gap-1">
          {days.map((day) => (
            <div
              key={day}
              title={`${day}: ${streakMap[day]?.commitCount || 0} commits`}
              className={`w-full aspect-square rounded-sm transition-all ${intensityClass(day)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StreakWidget;
