import React, { useState } from 'react';
import { Modal } from './Modal';
import { FormInput, Textarea, Select } from './FormInput';
import { UserPlus, FolderKanban, FileText, MessageSquare, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Quick Action Modal - Dashboard quick actions
 */
export function QuickActionModal({ isOpen, onClose, actionType, onAction }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const renderContent = () => {
    switch (actionType) {
      case 'add_user':
        return <AddUserQuickForm onSubmit={onAction} onCancel={onClose} loading={loading} setLoading={setLoading} error={error} setError={setError} />;
      case 'new_project':
        return <NewProjectQuickForm onSubmit={onAction} onCancel={onClose} loading={loading} setLoading={setLoading} error={error} setError={setError} />;
      case 'send_message':
        return <SendMessageQuickForm onSubmit={onAction} onCancel={onClose} loading={loading} setLoading={setLoading} error={error} setError={setError} />;
      case 'create_content':
        return <CreateContentQuickForm onSubmit={onAction} onCancel={onClose} loading={loading} setLoading={setLoading} error={error} setError={setError} />;
      default:
        return null;
    }
  };

  const titles = {
    add_user: 'Add New User',
    new_project: 'Create New Project',
    send_message: 'Send Message',
    create_content: 'Create Content'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[actionType]} size="md">
      {renderContent()}
    </Modal>
  );
}

/**
 * Add User Quick Form
 */
function AddUserQuickForm({ onSubmit, onCancel, loading, setLoading, error, setError }) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'user', label: 'Regular User' },
    { value: 'developer', label: 'Developer' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          required
          icon={UserPlus}
        />
        <FormInput
          label="Last Name"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          required
          icon={UserPlus}
        />
      </div>

      <FormInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <Select
        label="Role"
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        options={roleOptions}
        required
      />

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
        >
          {loading ? 'Adding...' : 'Add User'}
        </button>
      </div>
    </form>
  );
}

/**
 * New Project Quick Form
 */
function NewProjectQuickForm({ onSubmit, onCancel, loading, setLoading, error, setError }) {
  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    project_type: 'consulting',
    priority: 'medium'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
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
    { value: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <FormInput
        label="Project Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        icon={FolderKanban}
      />

      <FormInput
        label="Client Name"
        value={formData.client_name}
        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
        required
      />

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

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
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
  );
}

/**
 * Send Message Quick Form
 */
function SendMessageQuickForm({ onSubmit, onCancel, loading, setLoading, error, setError }) {
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <FormInput
        label="Recipient"
        value={formData.recipient}
        onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
        placeholder="Email or user name"
        required
        icon={MessageSquare}
      />

      <FormInput
        label="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        required
      />

      <Textarea
        label="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        rows={4}
        required
        placeholder="Type your message here..."
      />

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}

/**
 * Create Content Quick Form
 */
function CreateContentQuickForm({ onSubmit, onCancel, loading, setLoading, error, setError }) {
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'blog',
    summary: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  const contentTypeOptions = [
    { value: 'blog', label: 'Blog Post' },
    { value: 'news', label: 'News Article' },
    { value: 'case_study', label: 'Case Study' },
    { value: 'page', label: 'Page Content' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <FormInput
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        icon={FileText}
      />

      <Select
        label="Content Type"
        value={formData.content_type}
        onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
        options={contentTypeOptions}
        required
      />

      <Textarea
        label="Summary"
        value={formData.summary}
        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
        rows={3}
        placeholder="Brief summary of the content..."
      />

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
        >
          {loading ? 'Creating...' : 'Create Content'}
        </button>
      </div>
    </form>
  );
}

/**
 * Stat Card Detail Modal
 */
export function StatDetailModal({ isOpen, onClose, stat, data }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={stat.label} size="lg">
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Count</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {stat.change && (
            <div className={`mt-4 text-sm font-medium ${
              stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} {stat.change}
            </div>
          )}
        </div>

        {/* Data List */}
        {data && data.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Recent Items</h3>
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.name || item.title || 'Untitled'}</p>
                    <p className="text-sm text-gray-500">{item.email || item.description || 'No description'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{item.count || item.value || '-'}</p>
                    <p className="text-xs text-gray-500">{item.date || item.time || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No detailed data available
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
            Export Data
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default QuickActionModal;