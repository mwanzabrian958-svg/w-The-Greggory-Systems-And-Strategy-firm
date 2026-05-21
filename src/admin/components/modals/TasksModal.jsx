import React, { useState } from 'react';
import { X, CheckSquare, Plus, Search, Calendar, Clock, User, Flag, Filter, MoreVertical, Trash2, Edit, CheckCircle, Circle, AlertCircle, Star } from 'lucide-react';

export function TasksModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('board');
  const [filterPriority, setFilterPriority] = useState('all');

  const tasks = [
    { id: 1, title: 'Complete project proposal', description: 'Finalize the Q2 project proposal for client', priority: 'High', status: 'In Progress', assignee: 'John Doe', dueDate: '2024-05-20', project: 'Website Redesign' },
    { id: 2, title: 'Review code changes', description: 'Review pull requests from development team', priority: 'Medium', status: 'Todo', assignee: 'Jane Smith', dueDate: '2024-05-21', project: 'Mobile App' },
    { id: 3, title: 'Client meeting preparation', description: 'Prepare slides for client presentation', priority: 'High', status: 'In Progress', assignee: 'Bob Johnson', dueDate: '2024-05-19', project: 'E-Commerce' },
    { id: 4, title: 'Update documentation', description: 'Update API documentation with latest changes', priority: 'Low', status: 'Todo', assignee: 'Alice Williams', dueDate: '2024-05-25', project: 'API Development' },
    { id: 5, title: 'Fix login bug', description: 'Resolve authentication issues reported by users', priority: 'Critical', status: 'Done', assignee: 'Charlie Brown', dueDate: '2024-05-18', project: 'Platform' },
  ];

  if (!isOpen) return null;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const columns = {
    'Todo': tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done'),
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Task Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('board')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'board' ? 'bg-white border-b-2 border-violet-600 text-violet-600' : 'text-gray-600 hover:text-gray-900'}`}>Kanban Board</button>
          <button onClick={() => setActiveTab('list')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'list' ? 'bg-white border-b-2 border-violet-600 text-violet-600' : 'text-gray-600 hover:text-gray-900'}`}>Task List</button>
          <button onClick={() => setActiveTab('calendar')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'calendar' ? 'bg-white border-b-2 border-violet-600 text-violet-600' : 'text-gray-600 hover:text-gray-900'}`}>Calendar</button>
          <button onClick={() => setActiveTab('team')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'team' ? 'bg-white border-b-2 border-violet-600 text-violet-600' : 'text-gray-600 hover:text-gray-900'}`}>Team View</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'board' && (
            <div className="grid grid-cols-3 gap-4 h-full">
              {Object.entries(columns).map(([status, statusTasks]) => (
                <div key={status} className="bg-gray-100 rounded-xl p-4 min-h-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">{status}</h3>
                    <span className="text-sm text-gray-500">{statusTasks.length}</span>
                  </div>
                  <div className="space-y-3">
                    {statusTasks.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <User className="w-3 h-3" />
                            {task.assignee.split(' ')[0]}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded">{task.project}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search tasks..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                </div>
                <div className="flex gap-2">
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                    <option value="all">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                    <Plus className="w-4 h-4" /> New Task
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Task</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Assignee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              task.status === 'Done' ? 'bg-violet-600 border-violet-600' : 'border-gray-300'
                            }`}>
                              {task.status === 'Done' && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{task.title}</div>
                              <div className="text-xs text-gray-500">{task.description.substring(0, 40)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'Done' ? 'bg-green-100 text-green-800' :
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{task.assignee}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{task.dueDate}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded">{task.project}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-1 hover:bg-red-100 rounded transition-colors">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(35)].map((_, i) => (
                    <div key={i} className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer">
                      <div className="text-sm text-gray-900 mb-1">{i > 0 && i <= 31 ? i : ''}</div>
                      {i === 19 && (
                        <div className="bg-red-100 text-red-800 text-xs p-1 rounded truncate">Project proposal</div>
                      )}
                      {i === 20 && (
                        <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate">Code review</div>
                      )}
                      {i === 21 && (
                        <div className="bg-green-100 text-green-800 text-xs p-1 rounded truncate">Client meeting</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Workload</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'John Doe', tasks: 5, completed: 3, avatar: 'JD' },
                  { name: 'Jane Smith', tasks: 4, completed: 2, avatar: 'JS' },
                  { name: 'Bob Johnson', tasks: 3, completed: 1, avatar: 'BJ' },
                  { name: 'Alice Williams', tasks: 6, completed: 4, avatar: 'AW' },
                ].map((member) => (
                  <div key={member.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.tasks} tasks assigned</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-medium text-gray-900">{member.completed}/{member.tasks}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${(member.completed / member.tasks) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}