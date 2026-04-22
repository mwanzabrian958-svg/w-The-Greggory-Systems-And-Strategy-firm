import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, FolderKanban, ClipboardList, 
  TrendingUp, TrendingDown, Activity, DollarSign 
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/permissions';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function Dashboard({ user }) {
  const { can } = usePermissions(user);
  const [stats, setStats] = useState({
    users: { total: 0, newThisMonth: 0 },
    projects: { total: 0, active: 0 },
    applications: { total: 0, pending: 0 },
    content: { total: 0, published: 0 },
    revenue: { total: 0, growth: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats based on permissions
      const promises = [];
      
      if (can(PERMISSIONS.VIEW_USERS)) {
        promises.push(
          fetch(`${API_URL}/users/stats`).then(r => r.json()).catch(() => ({ total: 0, newThisMonth: 0 }))
        );
      }
      
      if (can(PERMISSIONS.VIEW_PROJECTS)) {
        promises.push(
          fetch(`${API_URL}/projects/stats`).then(r => r.json()).catch(() => ({ total: 0, active: 0 }))
        );
      }
      
      if (can(PERMISSIONS.VIEW_APPLICATIONS)) {
        promises.push(
          fetch(`${API_URL}/applications/stats`).then(r => r.json()).catch(() => ({ total: 0, pending: 0 }))
        );
      }
      
      if (can(PERMISSIONS.VIEW_CONTENT)) {
        promises.push(
          fetch(`${API_URL}/content/stats`).then(r => r.json()).catch(() => ({ total: 0, published: 0 }))
        );
      }
      
      if (can(PERMISSIONS.VIEW_FINANCIAL)) {
        promises.push(
          fetch(`${API_URL}/financial/stats`).then(r => r.json()).catch(() => ({ total: 0, growth: 0 }))
        );
      }

      const results = await Promise.all(promises);
      
      // Update stats based on what we got
      let idx = 0;
      const newStats = { ...stats };
      
      if (can(PERMISSIONS.VIEW_USERS)) newStats.users = results[idx++] || stats.users;
      if (can(PERMISSIONS.VIEW_PROJECTS)) newStats.projects = results[idx++] || stats.projects;
      if (can(PERMISSIONS.VIEW_APPLICATIONS)) newStats.applications = results[idx++] || stats.applications;
      if (can(PERMISSIONS.VIEW_CONTENT)) newStats.content = results[idx++] || stats.content;
      if (can(PERMISSIONS.VIEW_FINANCIAL)) newStats.revenue = results[idx++] || stats.revenue;
      
      setStats(newStats);

      // Fetch recent activity
      const activityRes = await fetch(`${API_URL}/admin/activity?limit=5`).catch(() => null);
      if (activityRes?.ok) {
        const activity = await activityRes.json();
        setRecentActivity(activity);
      }
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendUp, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center mt-1 text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Bar - User Info & Quick Actions Combined */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{user?.name || user?.email}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Quick Actions - Horizontal */}
          <div className="flex flex-wrap gap-2">
            {can(PERMISSIONS.CREATE_CONTENT) && (
              <a href="/admin/content/new" className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                <FileText className="w-4 h-4 mr-1.5" />
                New Content
              </a>
            )}
            {can(PERMISSIONS.CREATE_PROJECTS) && (
              <a href="/admin/projects/new" className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                <FolderKanban className="w-4 h-4 mr-1.5" />
                New Project
              </a>
            )}
            {can(PERMISSIONS.MANAGE_APPLICATIONS) && (
              <a href="/admin/applications" className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors">
                <ClipboardList className="w-4 h-4 mr-1.5" />
                Applications
              </a>
            )}
            {can(PERMISSIONS.VIEW_SETTINGS) && (
              <a href="/admin/settings" className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                Settings
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {can(PERMISSIONS.VIEW_USERS) && (
          <StatCard
            title="Total Users"
            value={stats.users.total.toLocaleString()}
            subtitle={`${stats.users.newThisMonth} new this month`}
            icon={Users}
            color="blue"
          />
        )}
        
        {can(PERMISSIONS.VIEW_PROJECTS) && (
          <StatCard
            title="Active Projects"
            value={stats.projects.active}
            subtitle={`${stats.projects.total} total projects`}
            icon={FolderKanban}
            color="green"
          />
        )}
        
        {can(PERMISSIONS.VIEW_APPLICATIONS) && (
          <StatCard
            title="Pending Applications"
            value={stats.applications.pending}
            subtitle={`${stats.applications.total} total applications`}
            icon={ClipboardList}
            color="yellow"
          />
        )}
        
        {can(PERMISSIONS.VIEW_FINANCIAL) && (
          <StatCard
            title="Total Revenue"
            value={`$${stats.revenue.total.toLocaleString()}`}
            trend={stats.revenue.growth}
            trendUp={stats.revenue.growth >= 0}
            icon={DollarSign}
            color="purple"
          />
        )}
      </div>

      {/* Secondary Stats - Inline */}
      {can(PERMISSIONS.VIEW_CONTENT) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Content Items</p>
                <p className="text-xl font-bold text-gray-900">{stats.content.total} <span className="text-sm font-normal text-gray-500">({stats.content.published} published)</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          {can(PERMISSIONS.VIEW_ACTIVITY_LOGS) && (
            <a href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </a>
          )}
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <Activity className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No recent activity to display</p>
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                    <p className="text-xs text-gray-500">
                      {activity.admin_name || activity.admin_email} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  activity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {activity.success ? 'Success' : 'Failed'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
