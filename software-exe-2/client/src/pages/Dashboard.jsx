import React from 'react';
import GithubWidget from '../components/GithubWidget';
import TodoWidget from '../components/TodoWidget';
import PomodoroWidget from '../components/PomodoroWidget';
import NotesWidget from '../components/NotesWidget';
import WeatherWidget from '../components/WeatherWidget';
import StreakWidget from '../components/StreakWidget';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* GitHub Activity */}
      <div className="lg:col-span-2">
        <GithubWidget />
      </div>

      {/* Focus Timer */}
      <div>
        <PomodoroWidget />
      </div>

      {/* Daily Tasks */}
      <div>
        <TodoWidget />
      </div>

      {/* Quick Notes */}
      <div className="md:col-span-2">
        <NotesWidget />
      </div>

      {/* Small Weather & Streak info */}
      <div className="flex flex-col gap-6">
        <WeatherWidget />
        <StreakWidget />
      </div>
    </div>
  );
};

export default Dashboard;
