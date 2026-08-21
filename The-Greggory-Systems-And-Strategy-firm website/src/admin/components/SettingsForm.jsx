import React, { useState } from 'react';
import { Globe, Shield, Bell, Mail, Database, Lock, Users, Clock } from 'lucide-react';
import { ToggleSwitch, ToggleGroup } from './ToggleSwitch';
import { FormInput, EmailInput, Select } from './FormInput';

/**
 * Settings Form Component
 * Comprehensive settings management for the admin panel
 */
export function SettingsForm({ settings, onSave, user }) {
  const [formData, setFormData] = useState(settings || {
    siteName: 'The-Greggory-Systems-And-Strategy-firm.',
    siteEmail: 'admin@thegreggorysystemsandstrategyfirm.org',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    activityLogging: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireEmailVerification: true,
    enableTwoFactor: false,
    defaultUserRole: 'user',
    timezone: 'UTC',
    locale: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    backupFrequency: 'daily',
    retentionDays: 30,
    apiRateLimit: 1000
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await onSave(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT)' },
    { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' }
  ];

  const localeOptions = [
    { value: 'en-US', label: 'English (United States)' },
    { value: 'en-GB', label: 'English (United Kingdom)' },
    { value: 'fr-FR', label: 'French (France)' },
    { value: 'de-DE', label: 'German (Germany)' },
    { value: 'es-ES', label: 'Spanish (Spain)' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'MMMM D, YYYY', label: 'January 1, 2024' }
  ];

  const timeFormatOptions = [
    { value: '12h', label: '12-hour (AM/PM)' },
    { value: '24h', label: '24-hour' }
  ];

  const backupFrequencyOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const defaultRoleOptions = [
    { value: 'user', label: 'Regular User' },
    { value: 'admin', label: 'Admin' }
  ];

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'User Settings', icon: Users },
    { id: 'system', label: 'System', icon: Database }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage system configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : saved ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Site Name"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  icon={Globe}
                />
                <EmailInput
                  label="Site Email"
                  value={formData.siteEmail}
                  onChange={(e) => setFormData({ ...formData, siteEmail: e.target.value })}
                  icon={Mail}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Select
                  label="Timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  options={timezoneOptions}
                />
                <Select
                  label="Locale"
                  value={formData.locale}
                  onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                  options={localeOptions}
                />
                <Select
                  label="Date Format"
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  options={dateFormatOptions}
                />
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <h2 className="text-lg font-medium text-gray-900">Appearance</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Time Format"
                  value={formData.timeFormat}
                  onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
                  options={timeFormatOptions}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              </div>
              
              <ToggleGroup>
                <ToggleSwitch
                  checked={formData.maintenanceMode}
                  onChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                  label="Maintenance Mode"
                  description="Put the site in maintenance mode (Super Admin only)"
                  disabled={!user?.admin_level || user?.admin_level !== 'super_admin'}
                />
                <ToggleSwitch
                  checked={formData.allowRegistration}
                  onChange={(checked) => setFormData({ ...formData, allowRegistration: checked })}
                  label="Allow Registration"
                  description="Allow new user registrations"
                />
                <ToggleSwitch
                  checked={formData.requireEmailVerification}
                  onChange={(checked) => setFormData({ ...formData, requireEmailVerification: checked })}
                  label="Require Email Verification"
                  description="Require users to verify their email address"
                />
                <ToggleSwitch
                  checked={formData.enableTwoFactor}
                  onChange={(checked) => setFormData({ ...formData, enableTwoFactor: checked })}
                  label="Enable Two-Factor Authentication"
                  description="Allow users to enable 2FA on their accounts"
                />
              </ToggleGroup>
            </div>

            {/* Password Policy */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">Password Policy</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Minimum Password Length"
                  type="number"
                  value={formData.passwordMinLength}
                  onChange={(e) => setFormData({ ...formData, passwordMinLength: parseInt(e.target.value) })}
                  min="6"
                  max="32"
                  icon={Lock}
                />
                <FormInput
                  label="Max Login Attempts"
                  type="number"
                  value={formData.maxLoginAttempts}
                  onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) })}
                  min="3"
                  max="10"
                  icon={Shield}
                />
              </div>
            </div>

            {/* Session Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">Session Settings</h2>
              </div>
              
              <FormInput
                label="Session Timeout (minutes)"
                type="number"
                value={formData.sessionTimeout}
                onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
                min="5"
                max="1440"
                icon={Clock}
                helperText="Users will be logged out after this period of inactivity"
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
              </div>
              
              <ToggleGroup>
                <ToggleSwitch
                  checked={formData.emailNotifications}
                  onChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                  label="Email Notifications"
                  description="Enable email notifications for system events"
                />
              </ToggleGroup>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">User Settings</h2>
              </div>
              
              <Select
                label="Default User Role"
                value={formData.defaultUserRole}
                onChange={(e) => setFormData({ ...formData, defaultUserRole: e.target.value })}
                options={defaultRoleOptions}
                helperText="Role assigned to new users upon registration"
              />
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
              </div>
              
              <ToggleGroup>
                <ToggleSwitch
                  checked={formData.activityLogging}
                  onChange={(checked) => setFormData({ ...formData, activityLogging: checked })}
                  label="Activity Logging"
                  description="Log user activities for audit trail"
                />
              </ToggleGroup>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Select
                  label="Backup Frequency"
                  value={formData.backupFrequency}
                  onChange={(e) => setFormData({ ...formData, backupFrequency: e.target.value })}
                  options={backupFrequencyOptions}
                />
                <FormInput
                  label="Data Retention (days)"
                  type="number"
                  value={formData.retentionDays}
                  onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) })}
                  min="7"
                  max="365"
                  icon={Database}
                />
              </div>
              
              <FormInput
                label="API Rate Limit (requests/minute)"
                type="number"
                value={formData.apiRateLimit}
                onChange={(e) => setFormData({ ...formData, apiRateLimit: parseInt(e.target.value) })}
                min="100"
                max="10000"
                className="mt-4"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsForm;