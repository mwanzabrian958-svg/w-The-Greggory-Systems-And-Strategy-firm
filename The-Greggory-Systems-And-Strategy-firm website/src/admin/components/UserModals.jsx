import React, { useState } from 'react';
import { Modal } from './Modal';
import { FormInput, EmailInput, PasswordInput, Select, Textarea } from './FormInput';
import { ROLES, PERMISSIONS } from '../utils/permissions';
import { User, Shield, Building2 } from 'lucide-react';

/**
 * Create User Modal
 */
export function CreateUserModal({ isOpen, onClose, onCreate, user }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'user',
    admin_level: 'admin',
    department: '',
    phone_number: '',
    is_active: true
  });
  const [showPassword, setShowPassword] = useState(false);
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
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'user',
        admin_level: 'admin',
        department: '',
        phone_number: '',
        is_active: true
      });
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'user', label: 'Regular User' }
  ];

  const adminLevelOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' }
  ];

  const departmentOptions = [
    { value: 'Administration', label: 'Administration' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Projects', label: 'Projects' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' },
    { value: 'General', label: 'General' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User" size="lg">
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
            icon={User}
          />
          <FormInput
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            icon={User}
          />
        </div>

        <EmailInput
          label="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <PasswordInput
          label="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          required
          helperText="Minimum 8 characters"
        />

        <Select
          label="User Type"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={roleOptions}
          required
        />

        {formData.role === 'admin' || formData.role === 'super_admin' || formData.role === 'moderator' ? (
          <Select
            label="Admin Level"
            value={formData.admin_level}
            onChange={(e) => setFormData({ ...formData, admin_level: e.target.value })}
            options={adminLevelOptions}
            icon={Shield}
          />

        ) : null}

        <Select
          label="Department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          options={departmentOptions}
          icon={Building2}
        />

        <FormInput
          label="Phone Number"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          placeholder="+254 7XX XXX XXX"
        />

        <div className="flex gap-3 justify-end pt-4">
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
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Edit User Modal
 */
export function EditUserModal({ isOpen, onClose, onUpdate, user, currentUser }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    role: user?.primary_role || user?.admin_level || 'user',
    admin_level: user?.admin_level || 'admin',
    department: user?.department || '',
    phone_number: user?.phone_number || '',
    is_active: user?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onUpdate(user.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'user', label: 'Regular User' }
  ];

  const adminLevelOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' }
  ];

  const departmentOptions = [
    { value: 'Administration', label: 'Administration' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Projects', label: 'Projects' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' },
    { value: 'General', label: 'General' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${user?.display_name || user?.email}`} size="lg">
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
            icon={User}
          />
          <FormInput
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            icon={User}
          />
        </div>

        <EmailInput
          label="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled
          helperText="Email cannot be changed"
        />

        <Select
          label="User Type"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={roleOptions}
          required
          disabled={user?.id === currentUser?.id}
          helperText={user?.id === currentUser?.id ? 'Cannot change your own role' : ''}
        />

        {formData.role === 'admin' || formData.role === 'super_admin' || formData.role === 'moderator' ? (
          <Select
            label="Admin Level"
            value={formData.admin_level}
            onChange={(e) => setFormData({ ...formData, admin_level: e.target.value })}
            options={adminLevelOptions}
            icon={Shield}
          />
        ) : null}

        <Select
          label="Department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          options={departmentOptions}
          icon={Building2}
        />

        <FormInput
          label="Phone Number"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          placeholder="+254 7XX XXX XXX"
        />

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="font-medium text-gray-900">Account Status</label>
            <p className="text-sm text-gray-500">Enable or disable this user account</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
            disabled={user?.id === currentUser?.id}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.is_active ? 'bg-blue-600' : 'bg-gray-300'
            } ${user?.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.is_active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex gap-3 justify-end pt-4">
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