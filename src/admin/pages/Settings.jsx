import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, RefreshCw, Bell, Shield, Database, Globe, Mail, Smartphone, Palette, Users, Lock, Key, Server, HardDrive, Wifi, Monitor, Moon, Sun, ChevronRight, AlertCircle, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function Settings({ user }) {
  const { darkMode, setDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: Database },
    { id: "integrations", label: "Integrations", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette }
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const GeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
            <input
              type="text"
              defaultValue="The-Greggory-Systems-And-Strategy-firm"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue="info@thegreggorysystemsandstrategyfirm.org"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="+254 700 000 000"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option>Africa/Nairobi (EAT)</option>
              <option>UTC</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Maintenance Mode</p>
              <p className="text-sm text-slate-600">Temporarily disable public access</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Debug Mode</p>
              <p className="text-sm text-slate-600">Enable detailed error logging</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Auto Backup</p>
              <p className="text-sm text-slate-600">Automatic daily database backups</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">New User Registration</p>
              <p className="text-sm text-slate-600">Notify when new users register</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Application Submissions</p>
              <p className="text-sm text-slate-600">Notify when applications are submitted</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">System Alerts</p>
              <p className="text-sm text-slate-600">Critical system notifications</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">SMS Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Two-Factor Authentication</p>
              <p className="text-sm text-slate-600">SMS codes for login verification</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Security Alerts</p>
              <p className="text-sm text-slate-600">SMS alerts for security events</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Password Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Length</label>
            <input
              type="number"
              defaultValue={8}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              defaultValue={30}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Two-Factor Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Enable 2FA for Admins</p>
              <p className="text-sm text-slate-600">Require two-factor for admin accounts</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Enable 2FA for All Users</p>
              <p className="text-sm text-slate-600">Require two-factor for all user accounts</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DatabaseSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Backup Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Backup Frequency</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Retention Period (days)</label>
            <input
              type="number"
              defaultValue={30}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="text-green-600 text-sm">Healthy</span>
            </div>
            <p className="text-sm text-slate-600">Connection Status</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="h-5 w-5 text-green-600" />
              <span className="text-slate-900 font-semibold">45%</span>
            </div>
            <p className="text-sm text-slate-600">Disk Usage</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Server className="h-5 w-5 text-purple-600" />
              <span className="text-slate-900 font-semibold">12ms</span>
            </div>
            <p className="text-sm text-slate-600">Query Time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const IntegrationSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Third-Party Services</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-4">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">Email Service</p>
                <p className="text-sm text-slate-600">SMTP configuration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">Connected</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-4">
              <Smartphone className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-slate-900">SMS Gateway</p>
                <p className="text-sm text-slate-600">Africa's Talking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">Connected</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-4">
              <Globe className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium text-slate-900">Payment Gateway</p>
                <p className="text-sm text-slate-600">M-Pesa Integration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-orange-600">Setup Required</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Theme Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                defaultValue="#2563EB"
                className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                defaultValue="#2563EB"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                defaultValue="#7C3AED"
                className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                defaultValue="#7C3AED"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-4">
              <Sun className="h-6 w-6 text-orange-500" />
              <p className="font-medium text-slate-900">Standard Light Theme</p>
            </div>
            <button
              onClick={() => setDarkMode(false)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-4">
              <Moon className="h-6 w-6 text-slate-700" />
              <p className="font-medium text-slate-900">Deep Space Theme (Dark)</p>
            </div>
            <button
              onClick={() => setDarkMode(true)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-amber-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general": return <GeneralSettings />;
      case "notifications": return <NotificationSettings />;
      case "security": return <SecuritySettings />;
      case "database": return <DatabaseSettings />;
      case "integrations": return <IntegrationSettings />;
      case "appearance": return <AppearanceSettings />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Configure system settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="h-4 w-4 ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}