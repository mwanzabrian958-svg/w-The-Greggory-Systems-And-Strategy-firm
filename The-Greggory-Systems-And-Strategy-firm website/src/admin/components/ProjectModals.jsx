import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormInput, Select, Textarea } from './FormInput';
import { FolderKanban, Calendar, DollarSign, Users, Building2, MapPin, Clock, Plus, Trash2 } from 'lucide-react';
import { apiCall } from '../../services/api';

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
    client_id_number: '',
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

  const handleClientChange = (e) => {
    const selectedUserId = e.target.value;
    const selectedUser = users.find(u => String(u.id) === String(selectedUserId));

    if (selectedUser) {
      setFormData({
        ...formData,
        user_id: selectedUserId,
        client_name: selectedUser.display_name || `${selectedUser.first_name} ${selectedUser.last_name}`,
        client_email: selectedUser.email || '',
        client_phone: selectedUser.phone_number || '',
        client_id_number: selectedUser.id_number || ''
      });
    } else {
      setFormData({ ...formData, user_id: selectedUserId });
    }
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
              onChange={handleClientChange}
              options={users.map(u => ({ value: u.id, label: u.display_name || u.email }))}
              required
            />
            <FormInput
              label="Client Name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="Full Name"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Client ID Number"
              value={formData.client_id_number}
              onChange={(e) => setFormData({ ...formData, client_id_number: e.target.value })}
              placeholder="ID/Passport"
              required
            />
            <FormInput
              label="Client Email"
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              placeholder="Email Relay"
              required
            />
            <FormInput
              label="Client Phone"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              placeholder="Contact Line"
              required
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
            <FormInput label="Est. Budget (KSH)" type="number" value={formData.estimated_budget} onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })} />
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
    user_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_id_number: '',
    status: 'planning',
    priority: 'Medium',
    progress_percentage: 0,
    actual_budget: 0,
    estimated_budget: 0,
    end_date: '',
    crew_template_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [team, setTeam] = useState([]);
  const [crewTemplates, setCrewTemplates] = useState([]);
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeRole, setAssigneeRole] = useState('team_member');

  React.useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchCrewTemplates();
      if (project?.id) fetchTeam(project.id);
    }
  }, [isOpen, project]);

  const fetchCrewTemplates = async () => {
    try {
      const data = await apiCall('/api/admin/team-templates');
      if (data.success) setCrewTemplates(data.templates || []);
    } catch (e) { console.error(e); }
  };

  const fetchTeam = async (projectId) => {
    try {
      const data = await apiCall(`/api/admin/project-team/${projectId}`);
      if (data.success) setTeam(data.team || []);
    } catch (e) { console.error(e); }
  };

  const handleAssign = async () => {
    if (!assigneeId || !project?.id) return;
    try {
      await apiCall(`/api/admin/project-team/${project.id}`, {
        method: 'POST',
        body: JSON.stringify({ user_id: Number(assigneeId), role: assigneeRole })
      });
      setAssigneeId('');
      fetchTeam(project.id);
    } catch (e) { console.error(e); }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this team member?')) return;
    try {
      await apiCall(`/api/admin/project-team/${memberId}`, { method: 'DELETE' });
      fetchTeam(project.id);
    } catch (e) { console.error(e); }
  };

  React.useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name || '',
        project_description: project.project_description || '',
        user_id: project.user_id || '',
        client_name: project.client_name || '',
        client_email: project.client_email || '',
        client_phone: project.client_phone || '',
        client_id_number: project.client_id_number || '',
        status: project.status || 'planning',
        priority: project.priority || 'Medium',
        progress_percentage: project.progress_percentage || 0,
        actual_budget: project.actual_budget || 0,
        estimated_budget: project.estimated_budget || 0,
        end_date: project.end_date ? project.end_date.split('T')[0] : '',
        crew_template_id: project.crew_template_id || ''
      });
      // Also update client fields from the linked user if user_id exists
      if (project.user_id) {
        const linkedUser = users.find(u => String(u.id) === String(project.user_id));
        if (linkedUser) {
          setFormData(f => ({
            ...f,
            client_name: linkedUser.display_name || `${linkedUser.first_name} ${linkedUser.last_name}`,
            client_email: linkedUser.email || '',
            client_phone: linkedUser.phone_number || '',
            client_id_number: linkedUser.id_number || ''
          }));
        }
      }
    }
  }, [project, users]);

  const handleClientChange = (e) => {
    const selectedUserId = e.target.value;
    const selectedUser = users.find(u => String(u.id) === String(selectedUserId));

    if (selectedUser) {
      setFormData({
        ...formData,
        user_id: selectedUserId,
        client_name: selectedUser.display_name || `${selectedUser.first_name} ${selectedUser.last_name}`,
        client_email: selectedUser.email || '',
        client_phone: selectedUser.phone_number || '',
        client_id_number: selectedUser.id_number || ''
      });
    } else {
      setFormData({ ...formData, user_id: selectedUserId });
    }
  };

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
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid gap-4">
           <FormInput label="Project Name" value={formData.project_name} onChange={(e) => setFormData({...formData, project_name: e.target.value})} required />
           <Textarea label="Briefing" value={formData.project_description} onChange={(e) => setFormData({...formData, project_description: e.target.value})} rows={3} />
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
           <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Client Parameters</h4>
           <div className="grid grid-cols-2 gap-4">
              <Select
                 label="Linked Client Account"
                 value={formData.user_id}
                 onChange={handleClientChange}
                 options={[{ value: '', label: '— Select client...' }, ...users.map(u => ({ value: u.id, label: u.display_name || u.email }))]}
              />
              <Select
                 label="Assigned Crew"
                 value={formData.crew_template_id}
                 onChange={(e) => setFormData({...formData, crew_template_id: e.target.value})}
                 options={[{ value: '', label: '— No crew assigned...' }, ...crewTemplates.map(ct => ({ value: ct.id, label: ct.name }))]}
              />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <FormInput label="Client Name" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} required />
              <FormInput label="ID Number" value={formData.client_id_number} onChange={(e) => setFormData({...formData, client_id_number: e.target.value})} required />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <FormInput label="Email" type="email" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} required />
              <FormInput label="Phone" value={formData.client_phone} onChange={(e) => setFormData({...formData, client_phone: e.target.value})} required />
           </div>
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

        {/* Team Assignment */}
        <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
          <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Team Assignment</h4>
          <div className="space-y-2">
            {team.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-[8px] font-black">
                    {(m.user_name || m.display_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-900">{m.user_name || m.display_name}</p>
                    <p className="text-[7px] text-slate-500 uppercase font-bold">{m.role}</p>
                  </div>
                </div>
                <button onClick={() => handleRemove(m.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={12} className="text-rose-600" /></button>
              </div>
            ))}
            {team.length === 0 && <p className="text-[7px] text-slate-500 uppercase font-bold text-center py-2">No team members assigned</p>}
          </div>
          <div className="grid grid-cols-[1fr_120px_auto] gap-2 pt-2">
            <Select
              label=""
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              options={[{ value: '', label: 'Select member...' }, ...users.filter(u => !team.find(t => t.user_id === u.id)).map(u => ({ value: u.id, label: u.display_name || u.email }))]}
            />
            <Select
              label=""
              value={assigneeRole}
              onChange={(e) => setAssigneeRole(e.target.value)}
              options={[
                { value: 'project_manager', label: 'Manager' },
                { value: 'team_member', label: 'Member' },
                { value: 'consultant', label: 'Consultant' },
                { value: 'developer', label: 'Developer' },
                { value: 'designer', label: 'Designer' }
              ]}
            />
            <button type="button" onClick={handleAssign} className="mt-4 p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"><Plus size={14} /></button>
          </div>
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