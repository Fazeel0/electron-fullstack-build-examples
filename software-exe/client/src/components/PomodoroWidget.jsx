import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Timer, Play, Pause, RotateCcw, Coffee } from 'lucide-react';

const API = 'http://localhost:5000/api';

const PomodoroWidget = () => {
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [label, setLabel] = useState('');

  const totalSeconds = mode === 'focus' ? focusDuration * 60 : breakDuration * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const logSessionMutation = useMutation({
    mutationFn: (session) => axios.post(`${API}/pomodoro`, session),
    onSuccess: () => setSessionsToday(prev => prev + 1),
  });

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      // Log the completed session
      logSessionMutation.mutate({
        duration: mode === 'focus' ? focusDuration : breakDuration,
        type: mode,
        label: label || undefined,
      });
      // Auto-switch modes
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      setMode(nextMode);
      setSecondsLeft((nextMode === 'focus' ? focusDuration : breakDuration) * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass rounded-3xl p-6 h-full card-hover flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${mode === 'focus' ? 'bg-red-500/20' : 'bg-teal-500/20'}`}>
            {mode === 'focus'
              ? <Timer className="text-red-400 w-5 h-5" />
              : <Coffee className="text-teal-400 w-5 h-5" />
            }
          </div>
          <h2 className="text-xl font-semibold text-white">Focus Timer</h2>
        </div>
        <span className="text-xs text-slate-500">{sessionsToday} sessions today</span>
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-xl bg-slate-800/50 p-1 mb-5 gap-1">
        {['focus', 'break'].map(m => (
          <button
            key={m}
            onClick={() => { if (!isActive) { setMode(m); setSecondsLeft((m === 'focus' ? focusDuration : breakDuration) * 60); } }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              mode === m ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {m === 'focus' ? `Focus (${focusDuration}m)` : `Break (${breakDuration}m)`}
          </button>
        ))}
      </div>

      {/* SVG Ring Timer */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
          <svg width="140" height="140" className="-rotate-90">
            <circle cx="70" cy="70" r="54" fill="none" stroke="#1e293b" strokeWidth="8" />
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke={mode === 'focus' ? '#f87171' : '#2dd4bf'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold text-white tracking-wider">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`text-xs mt-1 capitalize ${mode === 'focus' ? 'text-red-400' : 'text-teal-400'}`}>
              {mode}
            </span>
          </div>
        </div>

        {/* Task label */}
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="What are you working on?"
          className="mt-4 w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary/50 text-center"
        />

        {/* Controls */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-primary text-slate-900 hover:bg-primary/90'
            }`}
          >
            {isActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:text-white hover:bg-slate-700 transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroWidget;
