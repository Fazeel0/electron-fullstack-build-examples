import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, CheckCircle, Circle, Trash2, ListTodo } from 'lucide-react';

const TodoWidget = () => {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  // Fetch todos
  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/api/todos');
      return res.data;
    },
  });

  // Create todo
  const addMutation = useMutation({
    mutationFn: (newTodo) => axios.post('http://localhost:5000/api/todos', newTodo),
    onSuccess: () => queryClient.invalidateQueries(['todos']),
  });

  // Toggle toggle todo
  const toggleMutation = useMutation({
    mutationFn: (todo) => axios.patch(`http://localhost:5000/api/todos/${todo._id}`, { completed: !todo.completed }),
    onSuccess: () => queryClient.invalidateQueries(['todos']),
  });

  // Delete todo
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`http://localhost:5000/api/todos/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['todos']),
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addMutation.mutate({ text, priority: 'medium' });
    setText('');
  };

  return (
    <div className="glass rounded-3xl p-6 h-full card-hover">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/20 rounded-lg">
          <ListTodo className="text-primary w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-white">Daily Tasks</h2>
      </div>

      <form onSubmit={handleAdd} className="relative mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors pr-12"
        />
        <button type="submit" className="absolute right-2 top-2 p-1.5 bg-primary rounded-lg text-slate-900 hover:bg-primary/80 transition-colors">
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-secondary text-center py-4">Loading tasks...</p>
        ) : todos?.length === 0 ? (
          <p className="text-secondary text-center py-4 text-sm">No tasks for today. Chill out!</p>
        ) : (
          todos?.map((todo) => (
            <div key={todo._id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 group">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleMutation.mutate(todo)} className="text-secondary hover:text-primary transition-colors">
                  {todo.completed ? <CheckCircle className="text-primary w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`text-sm ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {todo.text}
                </span>
              </div>
              <button onClick={() => deleteMutation.mutate(todo._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoWidget;
