import React, { useState } from 'react';
import { X, Settings, Save, RefreshCw, Bell, Shield, Database, Globe, Mail, Smartphone, Palette, Users, Lock, Key, Server, HardDrive, Wifi, Monitor, Moon, Sun, ChevronRight, AlertCircle, CheckCircle, ToggleLeft, ToggleRight, Building, CreditCard, MapPin, Phone } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function SettingsModal({ isOpen, onClose }) {
  const { darkMode, setDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: Database },
    { id: "integrations", label: "Integrations", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "company", label: "Company", icon: Building },
    { id: "payment", label: "Payment", icon: CreditCard }
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">System Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-slate-50 border-r overflow-y-auto">
            <div className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">General Settings</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h4>
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
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">System Configuration</h4>
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
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Settings</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Email Notifications</h4>
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
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">SMS Notifications</h4>
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
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Password Policy</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Password Length</label>
                      <input type="number" defaultValue="8" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Require Special Characters</p>
                        <p className="text-sm text-slate-600">Passwords must include special characters</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Require Numbers</p>
                        <p className="text-sm text-slate-600">Passwords must include numbers</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Session Management</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                      <input type="number" defaultValue="30" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Remember Me</p>
                        <p className="text-sm text-slate-600">Allow users to stay logged in</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Settings</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Connection Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Database Host</label>
                      <input type="text" defaultValue="localhost" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Database Name</label>
                      <input type="text" defaultValue="the_greggory_systems_and_strategy_firm" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                        <input type="text" defaultValue="admin" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input type="password" defaultValue="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Backup Configuration</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Automatic Backups</p>
                        <p className="text-sm text-slate-600">Schedule automatic database backups</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Backup Frequency</label>
                      <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Database className="w-4 h-4" /> Backup Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Integrations</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Payment Gateways</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-slate-900">M-Pesa</p>
                          <p className="text-sm text-slate-600">Mobile money integration</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Connected</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">Stripe</p>
                          <p className="text-sm text-slate-600">Credit card processing</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Connected</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Communication Services</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="w-6 h-6 text-red-600" />
                        <div>
                          <p className="font-medium text-slate-900">Gmail API</p>
                          <p className="text-sm text-slate-600">Email sending service</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Connected</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-slate-900">Twilio SMS</p>
                          <p className="text-sm text-slate-600">SMS notification service</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Appearance Settings</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Theme</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setDarkMode(false)}
                        className={`p-4 bg-white rounded-xl border-2 transition-colors ${!darkMode ? 'border-amber-500' : 'border-slate-300 hover:border-slate-400'}`}
                      >
                        <Sun className={`w-8 h-8 mx-auto mb-2 ${!darkMode ? 'text-amber-500' : 'text-slate-400'}`} />
                        <p className={`font-medium text-center ${!darkMode ? 'text-amber-600' : 'text-slate-900'}`}>Light Theme</p>
                      </button>
                      <button
                        onClick={() => setDarkMode(true)}
                        className={`p-4 bg-white rounded-xl border-2 transition-colors ${darkMode ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-300 hover:border-slate-400'}`}
                      >
                        <Moon className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-amber-500' : 'text-slate-700'}`} />
                        <p className={`font-medium text-center ${darkMode ? 'text-amber-600' : 'text-slate-900'}`}>Deep Space Theme (Dark)</p>
                      </button>
                      <button
                        onClick={() => console.warn('System Sync protocol offline')}
                        className="p-4 bg-white rounded-xl border-2 border-slate-300 hover:border-slate-400 transition-colors opacity-50 cursor-not-allowed"
                      >
                        <Monitor className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="font-medium text-slate-900 text-center">System</p>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Accent Color</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                      <button
                        key={color}
                        className="w-12 h-12 rounded-xl border-2 border-slate-300 hover:border-slate-400 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "company" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Settings</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Business Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Business Registration Number</label>
                      <input type="text" defaultValue="BN-123456789" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Tax Identification Number</label>
                      <input type="text" defaultValue="TIN-987654321" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Physical Address</label>
                      <div className="flex gap-2">
                        <MapPin className="w-10 h-10 text-slate-400" />
                        <input type="text" defaultValue="Nairobi, Kenya" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Settings</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">M-Pesa Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Shortcode</label>
                      <input type="text" placeholder="Optional - payments use M-Pesa Send Money" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Passkey</label>
                      <input type="password" defaultValue="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Test Mode</p>
                        <p className="text-sm text-slate-600">Use sandbox environment</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Settings saved successfully</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}