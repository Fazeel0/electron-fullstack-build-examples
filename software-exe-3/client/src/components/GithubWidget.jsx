import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Code2, GitCommit, GitPullRequest, AlertCircle, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000/api';

const eventIcon = (type) => {
  if (type === 'PushEvent') return <GitCommit size={14} className="text-green-400" />;
  if (type === 'PullRequestEvent') return <GitPullRequest size={14} className="text-purple-400" />;
  return <AlertCircle size={14} className="text-yellow-400" />;
};

const eventLabel = (event) => {
  if (event.type === 'PushEvent') {
    const count = event.payload?.commits?.length || 0;
    return `Pushed ${count} commit${count !== 1 ? 's' : ''} to ${event.repo?.name?.split('/')[1]}`;
  }
  if (event.type === 'PullRequestEvent') return `PR ${event.payload?.action} on ${event.repo?.name?.split('/')[1]}`;
  if (event.type === 'IssuesEvent') return `Issue ${event.payload?.action} on ${event.repo?.name?.split('/')[1]}`;
  return event.type.replace('Event', '') + ' on ' + event.repo?.name?.split('/')[1];
};

const GithubWidget = () => {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['github-profile'],
    queryFn: async () => {
      const res = await axios.get(`${API}/github/profile`);
      return res.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['github-activity'],
    queryFn: async () => {
      const res = await axios.get(`${API}/github/activity`);
      return res.data;
    },
    enabled: !profileError,
    staleTime: 2 * 60 * 1000,
  });

  const todayCommits = activity?.filter(e => e.type === 'PushEvent')
    .reduce((acc, e) => acc + (e.payload?.commits?.length || 0), 0) || 0;

  const recentEvents = activity?.slice(0, 5) || [];

  return (
    <div className="glass rounded-3xl p-6 h-full card-hover bg-gradient-to-br from-card to-slate-800/60">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Code2 className="text-white w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-white">GitHub Activity</h2>
        </div>
        {todayCommits > 0 && (
          <span className="flex items-center gap-1.5 text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            {todayCommits} commits today
          </span>
        )}
      </div>

      {profileLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="text-primary animate-spin" size={28} />
        </div>
      ) : profileError ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-700/50 flex items-center justify-center">
            <Code2 className="text-slate-500 w-7 h-7" />
          </div>
          <p className="text-secondary text-sm">Add your GitHub token in <span className="text-primary">.env</span> to see activity.</p>
        </div>
      ) : (
        <div>
          {/* Profile Row */}
          <div className="flex items-center gap-4 mb-5">
            <img
              src={profile?.avatar_url}
              alt="avatar"
              className="w-12 h-12 rounded-full ring-2 ring-primary/40"
            />
            <div>
              <p className="font-semibold text-white">{profile?.name || profile?.login}</p>
              <p className="text-slate-500 text-xs">@{profile?.login}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-primary">{profile?.public_repos}</p>
              <p className="text-slate-500 text-xs">repos</p>
            </div>
          </div>

          {/* Recent Events */}
          <div className="space-y-2">
            {activityLoading ? (
              <p className="text-secondary text-xs text-center py-2">Loading events...</p>
            ) : recentEvents.length === 0 ? (
              <p className="text-secondary text-xs text-center py-2">No activity yet today.</p>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-2.5 p-2.5 bg-slate-800/40 rounded-xl text-xs text-slate-300">
                  {eventIcon(event.type)}
                  <span className="truncate">{eventLabel(event)}</span>
                  <span className="ml-auto shrink-0 text-slate-500">
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GithubWidget;
