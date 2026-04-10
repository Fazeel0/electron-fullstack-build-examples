import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, KeyRound, CloudSun, Clock, Timer } from 'lucide-react';

const Settings = ({ onClose }) => {
  const [githubToken, setGithubToken] = useState('');
  const [city, setCity] = useState(localStorage.getItem('devpulse_city') || 'London');
  const [focusDuration, setFocusDuration] = useState(
    parseInt(localStorage.getItem('devpulse_focus') || '25', 10)
  );
  const [breakDuration, setBreakDuration] = useState(
    parseInt(localStorage.getItem('devpulse_break') || '5', 10)
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('devpulse_city', city);
    localStorage.setItem('devpulse_focus', focusDuration);
    localStorage.setItem('devpulse_break', breakDuration);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, children }) => (
    <div>
      <label className="text-xs text-slate-400 block mb-1.5">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass rounded-3xl p-8 w-full max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <SettingsIcon className="text-primary w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        <Section icon={KeyRound} title="GitHub">
          <Field label="Personal Access Token">
            <input
              type="password"
              value={githubToken}
              onChange={e => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">Add this to your <code className="text-primary">.env</code> file as <code className="text-primary">GITHUB_TOKEN</code> and restart the server.</p>
          </Field>
        </Section>

        <Section icon={CloudSun} title="Weather">
          <Field label="City">
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="London"
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-primary transition-colors"
            />
          </Field>
        </Section>

        <Section icon={Timer} title="Pomodoro">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Focus Duration (minutes)">
              <input
                type="number"
                value={focusDuration}
                onChange={e => setFocusDuration(Number(e.target.value))}
                min="1" max="90"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-primary transition-colors"
              />
            </Field>
            <Field label="Break Duration (minutes)">
              <input
                type="number"
                value={breakDuration}
                onChange={e => setBreakDuration(Number(e.target.value))}
                min="1" max="30"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-primary transition-colors"
              />
            </Field>
          </div>
        </Section>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            saved ? 'bg-green-500/30 text-green-400 border border-green-500/40' : 'bg-primary text-slate-900 hover:bg-primary/90'
          }`}
        >
          <Save size={16} />
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
