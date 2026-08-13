import React, { useState } from 'react';
import { Modal } from './Modal';
import { FormInput, Select, Textarea } from './FormInput';
import { FolderKanban, Calendar, DollarSign, Users, Building2, MapPin, Clock } from 'lucide-react';

/**
 * Create Project Modal
 */
export function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    project_name: '',
    project_description: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    project_type: 'consulting',
    status: 'planning',
    priority: 'medium',
    estimated_budget: '',
    start_date: '',
    end_date: '',
    user_id: '',
    notes: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) fetchUsers();
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const data = await apiCall('/users');
      if (data.success) setUsers(data.users || []);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onCreate(formData);
      onClose();
      setFormData({
        project_name: '',
        project_description: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        project_type: 'consulting',
        status: 'planning',
        priority: 'medium',
        estimated_budget: '',
        start_date: '',
        end_date: '',
        user_id: '',
        notes: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initialize Mission Node" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest text-rose-600">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-50 pb-2">
            <FolderKanban size={14} className="text-teal-500" />
            Operational Parameters
          </h3>

          <div className="grid gap-4">
            <FormInput
              label="Project Name"
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              required
              placeholder="e.g. Strategic Audit 2024"
            />

            <Textarea
              label="Mission Briefing"
              value={formData.project_description}
              onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
              rows={3}
              placeholder="Detailed tactical objectives..."
            />
          </div>
        </div>

        {/* Client & Assignment */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-slate-50 pb-2">
            <Users size={14} className="text-blue-500" />
            Personnel Assignment
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Linked Client Account"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              options={users.map(u => ({ value: u.id, label: u.display_name || u.email }))}
              required
            />
            <FormInput
              label="Client Direct Label"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="Display name for project"
            />
          </div>
        </div>

        {/* Tactical Details */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Project Classification"
            value={formData.project_type}
            onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
            options={[
              { value: 'consulting', label: 'Consulting' },
              { value: 'development', label: 'Development' },
              { value: 'infrastructure', label: 'Infrastructure' }
            ]}
            required
          />
          <Select
            label="Priority Level"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
              { value: 'Critical', label: 'Critical' }
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
            <FormInput label="Start Date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
            <FormInput label="Deadline" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
            <FormInput label="Est. Budget (KSh)" type="number" value={formData.estimated_budget} onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })} />
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-50">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Abort</button>
          <button type="submit" disabled={loading} className="flex-[2] px-6 py-4 rounded-2xl bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-900/20 disabled:opacity-50 transition-all">
            {loading ? 'Synchronizing...' : 'Initialize Mission'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Edit Project Modal
 */
export function EditProjectModal({ isOpen, onClose, onUpdate, project }) {
  const [formData, setFormData] = useState({
    project_name: '',
    project_description: '',
    status: 'planning',
    priority: 'Medium',
    progress_percentage: 0,
    actual_budget: 0,
    estimated_budget: 0,
    end_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name || '',
        project_description: project.project_description || '',
        status: project.status || 'planning',
        priority: project.priority || 'Medium',
        progress_percentage: project.progress_percentage || 0,
        actual_budget: project.actual_budget || 0,
        estimated_budget: project.estimated_budget || 0,
        end_date: project.end_date ? project.end_date.split('T')[0] : ''
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onUpdate(project.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Recalibrate Node: ${project?.project_name}`} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
           <FormInput label="Project Name" value={formData.project_name} onChange={(e) => setFormData({...formData, project_name: e.target.value})} required />
           <Textarea label="Briefing" value={formData.project_description} onChange={(e) => setFormData({...formData, project_description: e.target.value})} rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <Select label="Status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} options={[
             { value: 'planning', label: 'Planning' },
             { value: 'in-progress', label: 'Active' },
             { value: 'on-hold', label: 'On Hold' },
             { value: 'completed', label: 'Solidified' }
           ]} />
           <Select label="Priority" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} options={[
             { value: 'Low', label: 'Low' },
             { value: 'Medium', label: 'Medium' },
             { value: 'High', label: 'High' },
             { value: 'Critical', label: 'Critical' }
           ]} />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress: {formData.progress_percentage}%</label>
          <input type="range" min="0" max="100" value={formData.progress_percentage} onChange={(e) => setFormData({...formData, progress_percentage: e.target.value})} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-teal-600" />
        </div>

        <div className="grid grid-cols-3 gap-4">
           <FormInput label="Est. Budget" type="number" value={formData.estimated_budget} onChange={(e) => setFormData({...formData, estimated_budget: e.target.value})} />
           <FormInput label="Actual Spent" type="number" value={formData.actual_budget} onChange={(e) => setFormData({...formData, actual_budget: e.target.value})} />
           <FormInput label="Deadline" type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-50">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">Abort</button>
          <button type="submit" disabled={loading} className="flex-[2] px-6 py-4 rounded-2xl bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-900/20">
            {loading ? 'Updating...' : 'Commit Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}