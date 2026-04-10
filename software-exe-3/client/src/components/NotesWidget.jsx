import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { StickyNote, Search, Plus, Trash2, Hash, X, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000/api';

const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'];

const NotesWidget = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [localContent, setLocalContent] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const [localTags, setLocalTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const debounceTimer = useRef(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await axios.get(`${API}/notes`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (note) => axios.post(`${API}/notes`, note),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['notes']);
      setActiveNote(res.data);
      setLocalTitle(res.data.title);
      setLocalContent(res.data.content);
      setLocalTags(res.data.tags || []);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => axios.patch(`${API}/notes/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['notes']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${API}/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      setActiveNote(null);
    },
  });

  // Debounced auto-save — 1 second after user stops typing
  const triggerAutoSave = useCallback((id, data) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateMutation.mutate({ id, data });
    }, 1000);
  }, []);

  const handleSelect = (note) => {
    setActiveNote(note);
    setLocalTitle(note.title);
    setLocalContent(note.content);
    setLocalTags(note.tags || []);
  };

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
    triggerAutoSave(activeNote._id, { title: e.target.value, content: localContent, tags: localTags });
  };

  const handleContentChange = (e) => {
    setLocalContent(e.target.value);
    triggerAutoSave(activeNote._id, { title: localTitle, content: e.target.value, tags: localTags });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTags = [...localTags, tagInput.trim().replace('#', '')];
      setLocalTags(newTags);
      setTagInput('');
      updateMutation.mutate({ id: activeNote._id, data: { tags: newTags } });
    }
  };

  const handleRemoveTag = (tag) => {
    const newTags = localTags.filter(t => t !== tag);
    setLocalTags(newTags);
    updateMutation.mutate({ id: activeNote._id, data: { tags: newTags } });
  };

  const filteredNotes = (notes || []).filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass rounded-3xl p-6 card-hover">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-xl">
            <StickyNote className="text-yellow-400 w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-white">Quick Notes</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-slate-800/60 border border-slate-700 rounded-full py-1.5 pl-8 pr-4 text-xs focus:outline-none focus:border-primary w-36 transition-colors"
            />
          </div>
          <button
            onClick={() => createMutation.mutate({ title: 'Untitled', content: '', tags: [] })}
            className="p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: '220px' }}>
        {/* Note list sidebar */}
        <div className="w-36 shrink-0 space-y-1.5 overflow-y-auto max-h-56 pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" size={20} /></div>
          ) : filteredNotes.length === 0 ? (
            <p className="text-slate-500 text-xs text-center pt-6">No notes yet.</p>
          ) : (
            filteredNotes.map((note, i) => (
              <button
                key={note._id}
                onClick={() => handleSelect(note)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all truncate border ${
                  activeNote?._id === note._id
                    ? 'bg-primary/20 border-primary/40 text-white'
                    : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <p className="font-medium truncate">{note.title}</p>
                <p className="text-slate-500 truncate mt-0.5">{note.content.slice(0, 30) || '...'}</p>
              </button>
            ))
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col gap-2">
          {activeNote ? (
            <>
              <div className="flex items-center gap-2">
                <input
                  value={localTitle}
                  onChange={handleTitleChange}
                  className="flex-1 bg-transparent text-white font-semibold text-sm focus:outline-none border-b border-slate-700/50 pb-1 focus:border-primary transition-colors"
                />
                <button onClick={() => deleteMutation.mutate(activeNote._id)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={localContent}
                onChange={handleContentChange}
                placeholder="Start typing... auto-saves in 1s"
                className="flex-1 bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                style={{ minHeight: '120px' }}
              />
              <div className="flex flex-wrap gap-1.5 items-center">
                {localTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-md border border-slate-600/30">
                    <Hash size={8} />{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400 ml-0.5"><X size={8} /></button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ tag"
                  className="bg-transparent text-[10px] text-slate-500 focus:outline-none w-12"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <StickyNote className="text-slate-700" size={32} />
              <p className="text-slate-500 text-xs">Select or create a note</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesWidget;
