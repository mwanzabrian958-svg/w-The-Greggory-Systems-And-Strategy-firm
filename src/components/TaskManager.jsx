import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { Plus, Check, Trash2, Edit, X, ChevronDown, ChevronUp } from 'lucide-react';

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
};

const TaskItem = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={() => onToggleStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'completed' ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}
          >
            {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
          </button>
          <span className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <button
            onClick={() => onEdit(task)}
            className="text-gray-500 hover:text-teal-600"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 ml-1"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {task.description && <p className="text-gray-600 text-sm mb-2">{task.description}</p>}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded-full ${statusColors[task.status]}`}>
              {task.status.replace('_', ' ')}
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
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="font-medium mb-3">{isEditing ? 'Edit Task' : 'Add New Task'}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
          >
            {isEditing ? 'Update Task' : 'Add Task'}
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
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
    }
  };

  const handleToggleStatus = (id, newStatus) => {
    updateTask(id, { status: newStatus });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Task Manager</h2>
        <button
          onClick={() => {
            setEditingTask(null);
            setIsAdding(!isAdding);
          }}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
        >
          <Plus size={18} className="mr-1" />
          {isAdding ? 'Cancel' : 'Add Task'}
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
      
      <div className="mb-4 flex space-x-2 overflow-x-auto pb-2">
        {['all', 'pending', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
              filter === status
                ? 'bg-teal-100 text-teal-800 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All Tasks' : status.replace('_', ' ')}
            {status !== 'all' && (
              <span className="ml-1 bg-white bg-opacity-30 px-2 py-0.5 rounded-full text-xs">
                {tasks.filter(t => status === 'all' ? true : t.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>
      
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filter === 'all' 
              ? 'No tasks yet. Add your first task!' 
              : `No ${filter.replace('_', ' ')} tasks.`}
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
