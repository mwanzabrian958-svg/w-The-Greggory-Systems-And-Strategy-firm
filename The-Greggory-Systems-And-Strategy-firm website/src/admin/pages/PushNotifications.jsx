/**
 * Admin Dashboard — Push Notifications page
 *
 * Sends Firebase Cloud Messaging (FCM) push notifications from the Greggory
 * admin dashboard to the Android client portal app (MyFirebaseMessagingService).
 *
 * Backed by:
 *   POST /api/fcm/send        — send push (admin session token required)
 *   GET  /api/fcm/devices     — list registered Android devices
 *   GET  /api/fcm/status      — check if Firebase is configured
 *
 * Created alongside: backend/routes/fcm.js, backend/services/firebaseAdmin.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../../services/api';

/* ── helpers ─────────────────────────────────────────────────────────────── */

function getAdminToken() {
  return (
    localStorage.getItem('gf_admin_session_token') ||
    (()=>{
      try {
        const s = sessionStorage.getItem('gf_admin_session');
        return s ? JSON.parse(s).token : null;
      } catch { return null; }
    })()
  );
}

function useFcmData() {
  const [status, setStatus] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, dRes] = await Promise.all([
        apiCall('/fcm/status'),
        apiCall('/fcm/devices'),
      ]);
      setStatus(sRes);
      setDevices((dRes && dRes.devices) || []);
    } catch (err) {
      setStatus({ configured: false, error: err.message || 'Failed to load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { status, devices, loading, refetch: load };
}

/* ── component ───────────────────────────────────────────────────────────── */

export default function PushNotificationsPage() {
  const { status, devices, loading, refetch } = useFcmData();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('high');
  const [topic, setTopic] = useState('client_devices');
  const [userId, setUserId] = useState('');
  const [dataPayload, setDataPayload] = useState('');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  const deviceKey = (d) => `${d.userType || 'client'}-${d.id}`;

  const toggleDevice = (key) => {
    setSelectedDeviceIds(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedDeviceIds(checked ? devices.map(d => deviceKey(d)) : []);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const targetTokens = selectedDeviceIds.length > 0
        ? devices.filter(d => selectedDeviceIds.includes(deviceKey(d))).map(d => d.fcmToken).filter(Boolean)
        : undefined;
      const targetUserId = userId.trim() ? parseInt(userId, 10) : undefined;
      let data;
      if (dataPayload.trim()) {
        try { data = JSON.parse(dataPayload); }
        catch {
          setResult({ success: false, message: 'Custom Data must be valid JSON.' });
          setSending(false);
          return;
        }
      }

      if (!targetTokens && !targetUserId && !topic) {
        setResult({ success: false, message: 'Select a topic, a user ID, or specific devices.' });
        setSending(false);
        return;
      }

      const res = await apiCall('/fcm/send', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          fcmTokens: targetTokens,
          userId: targetUserId,
          topic: topic || undefined,
          data,
          priority: priority || 'normal',
        }),
      });
      setResult(res);
      if (res && res.success) { setTitle(''); setBody(''); }
    } catch (err) {
      setResult({ success: false, message: err.message || 'Request failed' });
    } finally {
      setSending(false);
    }
  };

  const eraseForm = () => {
    setTitle('');
    setBody('');
    setUserId('');
    setDataPayload('');
    setSelectedDeviceIds([]);
    setResult(null);
  };

  /* ── loading state ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── main layout ────────────────────────────────────────────────────── */
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Push Notifications</h1>

      {/* Firebase status banner */}
      <div
        className={`rounded-lg p-4 mb-6 flex items-start gap-3 ${
          status && status.configured
            ? 'bg-green-900/30 border border-green-700'
            : 'bg-yellow-900/30 border border-yellow-700'
        }`}
      >
        <div
          className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
            status && status.configured ? 'bg-green-500' : 'bg-yellow-500'
          }`}
        />
        <div>
          <p className="font-semibold text-white">
            Firebase FCM {status && status.configured ? '✓ Configured' : '⚠ Not Configured'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {status && status.configured
              ? `${devices.length} device(s) registered. Ready to send pushes.`
              : 'Place serviceAccountKey.json in backend/config/ and restart server.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── left: sender form ─────────────────────────────────────── */}
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Send Notification</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Invoice #INV-0042 Ready"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Body *</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Your invoice for Project Alpha is ready for review."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="high">High (immediate)</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Send via</label>
                <select
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="">Specific user / devices</option>
                  <option value="client_devices">All Clients (topic)</option>
                  <option value="admin_devices">All Admins (topic)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Or send to User ID (optional)
              </label>
              <input
                type="number"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                placeholder="e.g. 42"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Custom Data (JSON, optional)
              </label>
              <textarea
                value={dataPayload}
                onChange={e => setDataPayload(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono text-xs"
                placeholder='{"type":"invoice","invoiceId":42}'
              />
              <p className="text-xs text-gray-500 mt-1">
                The app reads the type field in MyFirebaseMessagingService
                to trigger behaviour (navigate, refresh, show dialog).
              </p>
            </div>
            {!topic && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-400">
                    Select specific devices ({devices.length} registered)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectAll(x => !x)}
                    className="text-xs text-teal-400 hover:text-teal-300"
                  >
                    {selectAll ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-800 rounded px-2 py-2">
                  {devices.length === 0 ? (
                    <p className="text-sm text-gray-500">No devices registered yet.</p>
                  ) : (
                    devices.map(device => (
                      <label
                        key={deviceKey(device)}
                        className="flex items-center gap-2 py-1 px-1 border-b border-gray-800 last:border-0 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDeviceIds.includes(deviceKey(device))}
                          onChange={() => toggleDevice(deviceKey(device))}
                          className="accent-teal-500"
                        />
                        <span className="text-sm text-gray-300 flex-1 truncate">
                          {device.displayName || device.email || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {device.deviceInfo?.model || 'Android'}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || (!title.trim() || !body.trim())}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                {sending ? 'Sending…' : 'Send Push Notification'}
              </button>
              <button
                type="button"
                onClick={eraseForm}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ── right: result + device list ───────────────────────────── */}
        <div className="space-y-4">
          {result && (
            <div
              className={`rounded-lg p-4 border mb-6 ${
                result.success
                  ? 'bg-green-900/30 border-green-700'
                  : 'bg-red-900/30 border-red-700'
              }`}
            >
              <h3 className={`font-semibold text-white mb-2 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                {result.success ? '✓ Sent' : '✗ Failed'}
              </h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Registered Devices</h2>
            {devices.length === 0 ? (
              <p className="text-gray-500 text-sm">No devices have registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left py-2 px-2">Device</th>
                      <th className="text-left py-2 px-2">User</th>
                      <th className="text-left py-2 px-2">Last Active</th>
                      <th className="text-left py-2 px-2">Token (masked)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map(device => (
                      <tr key={deviceKey(device)} className="border-b border-gray-800/50">
                        <td className="py-2 px-2 text-gray-300">
                          {device.deviceInfo?.model || 'Unknown'} ({device.userType})
                        </td>
                        <td className="py-2 px-2 text-gray-300">
                          {device.displayName || device.email || '—'}
                        </td>
                        <td className="py-2 px-2 text-gray-500">
                          {device.lastActiveAt
                            ? new Date(device.lastActiveAt).toLocaleString()
                            : '—'}
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-600 font-mono max-w-[200px] truncate">
                          {device.fcmTokenMasked || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
