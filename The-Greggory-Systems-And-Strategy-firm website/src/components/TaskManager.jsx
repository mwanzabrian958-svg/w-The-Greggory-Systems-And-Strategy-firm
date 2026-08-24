import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { Plus, Check, Trash2, Edit, X, ChevronDown, ChevronUp, Calendar, Layers } from 'lucide-react';

const priorityColors = {
  high: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
  medium: 'bg-gold-500/10 text-gold-500 border border-gold-500/20',
  low: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
};

const statusColors = {
  pending: 'bg-white/5 text-slate-400 border border-white/10',
  in_progress: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
};

const TaskItem = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white/5 backdrop-blur-2xl rounded-[24px] border border-white/10 p-6 mb-4 group hover:bg-white/[0.08] transition-all shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={() => onToggleStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
            className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-white/20 hover:border-gold-500'}`}
          >
            {task.status === 'completed' && <Check className="w-4 h-4 text-slate-950" />}
          </button>
          <span className={`text-sm font-black uppercase tracking-wider transition-all ${task.status === 'completed' ? 'line-through text-slate-600' : 'text-white'}`}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-slate-500 hover:text-gold-500 transition-colors"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-white/5 animate-fade-in">
          {task.description && <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-6">{task.description}</p>}
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
            <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> REGISTERED: {new Date(task.createdAt).toLocaleDateString()}</span>
            <span className={`px-3 py-1 rounded-md ${statusColors[task.status]}`}>
              PROTOCOL: {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskForm = ({ task, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    ...task
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-3xl rounded-[32px] p-8 border border-white/10 shadow-2xl mb-10 animate-fade-in">
      <h3 className="text-sm font-black text-gold-500 uppercase tracking-[0.4em] mb-8">{isEditing ? 'Modify Protocol' : 'Initialize New Protocol'}</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Objective Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
            required
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Strategic Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all resize-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Priority Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
            >
              <option value="high" className="bg-slate-900">HIGH TIER</option>
              <option value="medium" className="bg-slate-900">MID TIER</option>
              <option value="low" className="bg-slate-900">BASELINE</option>
            </select>
          </div>
          
          {isEditing && (
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Status Protocol</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
              >
                <option value="pending" className="bg-slate-900">QUEUED</option>
                <option value="in_progress" className="bg-slate-900">SYNCHRONIZING</option>
                <option value="completed" className="bg-slate-900">VALIDATED</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5"
          >
            Abort
          </button>
          <button
            type="submit"
            className="px-10 py-4 text-[10px] font-black text-slate-950 uppercase tracking-widest bg-gold-500 rounded-2xl hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20"
          >
            {isEditing ? 'Confirm Protocol' : 'Initialize Protocol'}
          </button>
        </div>
      </div>
    </form>
  );
};

const TaskManager = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return task.status !== 'completed';
    return task.status === filter;
  });

  const handleAddTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      addTask(taskData);
    }
    setIsAdding(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsAdding(true);
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Initialize protocol deletion? Data will be unrecoverable.')) {
      deleteTask(id);
    }
  };

  const handleToggleStatus = (id, newStatus) => {
    updateTask(id, { status: newStatus });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
        <div>
           <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2 text-center sm:text-left">Module Control</p>
           <h2 className="text-4xl font-black text-white uppercase tracking-tight text-center sm:text-left">Execution Manager</h2>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setIsAdding(!isAdding);
          }}
          className="flex items-center gap-3 px-8 py-4 bg-gold-500 text-slate-950 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20"
        >
          <Plus size={18} />
          {isAdding ? 'Abort Initialization' : 'Initialize Module'}
        </button>
      </div>
      
      {isAdding && (
        <TaskForm
          task={editingTask || {}}
          onSave={handleAddTask}
          onCancel={() => {
            setIsAdding(false);
            setEditingTask(null);
          }}
          isEditing={!!editingTask}
        />
      )}
      
      <div className="mb-10 flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {['all', 'pending', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
              filter === status
                ? 'bg-gold-500 text-slate-950 border-gold-500 shadow-lg shadow-gold-500/20'
                : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {status === 'all' ? 'Total Matrix' : status.replace('_', ' ')}
            {status !== 'all' && (
              <span className={`ml-3 px-2 py-0.5 rounded-md text-[8px] font-black border ${filter === status ? 'bg-slate-950/20 border-slate-950/20' : 'bg-white/5 border-white/5'}`}>
                {tasks.filter(t => status === 'all' ? true : t.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>
      
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border-2 border-dashed border-white/5">
            <div className="mb-6 p-8 bg-white/5 rounded-[32px] inline-block">
               <Layers className="w-12 h-12 text-slate-700" />
            </div>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">
              {filter === 'all'
                ? 'Null Modules Detected. Initialize First Deployment.'
                : `No ${status.replace('_', ' ').toUpperCase()} Protocols Found.`}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;
