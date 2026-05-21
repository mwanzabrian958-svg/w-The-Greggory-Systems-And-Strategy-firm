import React, { useState } from 'react';
import { Modal } from './Modal';
import { FormInput, Select, Textarea } from './FormInput';
import { FolderKanban, Calendar, DollarSign, Users, Building2, MapPin, Clock } from 'lucide-react';

/**
 * Create Project Modal
 */
export function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    project_type: 'consulting',
    status: 'planning',
    priority: 'medium',
    budget: '',
    start_date: '',
    end_date: '',
    team_members: [],
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onCreate(formData);
      onClose();
      setFormData({
        title: '',
        description: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        project_type: 'consulting',
        status: 'planning',
        priority: 'medium',
        budget: '',
        start_date: '',
        end_date: '',
        team_members: [],
        location: '',
        notes: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const projectTypeOptions = [
    { value: 'consulting', label: 'Consulting' },
    { value: 'development', label: 'Development' },
    { value: 'design', label: 'Design' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'research', label: 'Research' },
    { value: 'training', label: 'Training' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'review', label: 'Under Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            Basic Information
          </h3>
          
          <FormInput
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            icon={FolderKanban}
          />
          
          <Textarea
            label="Project Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Describe the project objectives and scope..."
          />
        </div>

        {/* Client Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Client Information
          </h3>
          
          <FormInput
            label="Client Name"
            value={formData.client_name}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            required
            icon={Building2}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Client Email"
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
            />
            <FormInput
              label="Client Phone"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              placeholder="+254 7XX XXX XXX"
            />
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Project Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Project Type"
              value={formData.project_type}
              onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
              options={projectTypeOptions}
              required
            />
            
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorityOptions}
              required
            />
          </div>
          
          <Select
            label="Initial Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statusOptions}
            required
          />
        </div>

        {/* Timeline & Budget */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Timeline & Budget
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              icon={Calendar}
            />
            
            <FormInput
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              icon={Calendar}
            />
          </div>
          
          <FormInput
            label="Budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="Enter project budget"
            icon={DollarSign}
          />
        </div>

        {/* Additional Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Additional Information
          </h3>
          
          <FormInput
            label="Project Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Physical location if applicable"
            icon={MapPin}
          />
          
          <Textarea
            label="Project Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            placeholder="Any additional notes or special requirements..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
          >
            {loading ? 'Creating...' : 'Create Project'}
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
    title: project?.title || '',
    description: project?.description || '',
    client_name: project?.client_name || '',
    client_email: project?.client_email || '',
    client_phone: project?.client_phone || '',
    project_type: project?.project_type || 'consulting',
    status: project?.status || 'planning',
    priority: project?.priority || 'medium',
    budget: project?.budget || '',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    location: project?.location || '',
    notes: project?.notes || '',
    completion_percentage: project?.completion_percentage || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const projectTypeOptions = [
    { value: 'consulting', label: 'Consulting' },
    { value: 'development', label: 'Development' },
    { value: 'design', label: 'Design' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'research', label: 'Research' },
    { value: 'training', label: 'Training' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'review', label: 'Under Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Project: ${project?.title}`} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            Basic Information
          </h3>
          
          <FormInput
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            icon={FolderKanban}
          />
          
          <Textarea
            label="Project Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Describe the project objectives and scope..."
          />
        </div>

        {/* Client Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Client Information
          </h3>
          
          <FormInput
            label="Client Name"
            value={formData.client_name}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            required
            icon={Building2}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Client Email"
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
            />
            <FormInput
              label="Client Phone"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              placeholder="+254 7XX XXX XXX"
            />
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Project Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Project Type"
              value={formData.project_type}
              onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
              options={projectTypeOptions}
              required
            />
            
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorityOptions}
              required
            />
          </div>
          
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statusOptions}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Completion Percentage</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.completion_percentage}
              onChange={(e) => setFormData({ ...formData, completion_percentage: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-semibold">{formData.completion_percentage}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Timeline & Budget */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Timeline & Budget
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              icon={Calendar}
            />
            
            <FormInput
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              icon={Calendar}
            />
          </div>
          
          <FormInput
            label="Budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="Enter project budget"
            icon={DollarSign}
          />
        </div>

        {/* Additional Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Additional Information
          </h3>
          
          <FormInput
            label="Project Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Physical location if applicable"
            icon={MapPin}
          />
          
          <Textarea
            label="Project Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            placeholder="Any additional notes or special requirements..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}