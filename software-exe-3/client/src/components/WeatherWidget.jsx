import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CloudRain, Cloud, Sun, CloudSnow, CloudLightning, MapPin, Droplets, Wind, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000/api';

const weatherIcon = (code) => {
  if (!code) return <Cloud size={40} className="text-slate-400" />;
  if (code.startsWith('01')) return <Sun size={40} className="text-yellow-300" />;
  if (code.startsWith('09') || code.startsWith('10')) return <CloudRain size={40} className="text-blue-400" />;
  if (code.startsWith('11')) return <CloudLightning size={40} className="text-yellow-400" />;
  if (code.startsWith('13')) return <CloudSnow size={40} className="text-blue-200" />;
  return <Cloud size={40} className="text-slate-400" />;
};

const WeatherWidget = () => {
  const city = localStorage.getItem('devpulse_city') || 'London';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      const res = await axios.get(`${API}/weather?city=${encodeURIComponent(city)}`);
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const iconCode = data?.weather?.[0]?.icon;

  return (
    <div className="glass rounded-3xl p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <MapPin size={11} />
            <span>{data?.name || city}</span>
          </div>
          {isLoading ? (
            <Loader2 className="text-primary animate-spin mt-2" size={24} />
          ) : isError ? (
            <p className="text-slate-500 text-xs mt-2">Set city in Settings</p>
          ) : (
            <>
              <div className="text-4xl font-bold text-white">{Math.round(data?.main?.temp)}°C</div>
              <p className="text-slate-400 text-sm mt-0.5 capitalize">{data?.weather?.[0]?.description}</p>
              <div className="flex gap-4 mt-3">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Droplets size={12} className="text-blue-400" />{data?.main?.humidity}%
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Wind size={12} className="text-slate-400" />{Math.round(data?.wind?.speed)} m/s
                </span>
              </div>
            </>
          )}
        </div>
        <div className="opacity-80">
          {!isLoading && !isError && weatherIcon(iconCode)}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
