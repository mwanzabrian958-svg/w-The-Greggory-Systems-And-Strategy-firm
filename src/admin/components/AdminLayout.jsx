import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, FolderKanban, 
  ClipboardList, DollarSign, Code2, Activity, Settings,
  LogOut, Menu, X, Shield, Code, User
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

const iconMap = {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  ClipboardList,
  DollarSign,
  Code2,
  Activity,
  Settings
};

export function AdminLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { getNavigation, isAdmin, isDeveloper, isSuperAdmin } = usePermissions(user);

  // Fetch profile photo on mount
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!user?.id || !user?.role) return;
      
      try {
        // Determine role for API endpoint
        const role = user.role === 'developer' ? 'developer' : 'admin';
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/admin/profile-photo/${role}/${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.photo_url) {
            setProfilePhotoUrl(data.photo_url);
          }
        }
      } catch (error) {
        console.log('Failed to fetch profile photo:', error);
      }
    };

    fetchProfilePhoto();
  }, [user?.id, user?.role]);

  const navigation = getNavigation();

  // Show blank white page for developer role users
  if (user?.role === 'developer') {
    return <div className="min-h-screen bg-white"></div>;
  }
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (isSuperAdmin()) return 'Super Admin';
    if (isAdmin()) return user?.admin_level === 'moderator' ? 'Moderator' : 'Admin';
    if (isDeveloper()) return user?.developer_level === 'senior' ? 'Senior Dev' : user?.developer_level === 'mid' ? 'Developer' : 'Junior Dev';
    return '';
  };

  const getRoleBadge = () => {
    if (isSuperAdmin()) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          <Shield className="w-3 h-3 mr-1" />
          Super Admin
        </span>
      );
    }
    if (isAdmin()) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          <Shield className="w-3 h-3 mr-1" />
          {user?.admin_level === 'moderator' ? 'Moderator' : 'Admin'}
        </span>
      );
    }
    if (isDeveloper()) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <Code className="w-3 h-3 mr-1" />
          {user?.developer_level === 'senior' ? 'Senior Dev' : 
           user?.developer_level === 'mid' ? 'Developer' : 'Junior Dev'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Full-width Navigation Bar */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="w-full px-2 lg:px-4">
          <div className="flex items-center justify-between h-14">
            {/* Navigation Items - Full width with Settings */}
            <nav className="flex items-center space-x-0.5 overflow-x-auto flex-1">
              {navigation.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-1 lg:mr-1.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side - User Info Box (No Dropdown) */}
            <div className="flex items-center shrink-0 ml-2">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 mr-2"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* User Info Box - Compact */}
              <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-2 py-1.5">
                {/* Avatar with Profile Photo or Initial */}
                {profilePhotoUrl ? (
                  <img 
                    src={profilePhotoUrl}
                    alt={user?.name || user?.email}
                    className="w-7 h-7 rounded-full object-cover border border-gray-600"
                  />
                ) : user?.profile_photo ? (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border border-gray-600">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border border-gray-600">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                
                {/* User Name & Role */}
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-medium text-white truncate max-w-[100px]">{user?.name || user?.email}</p>
                  <p className="text-[10px] text-gray-400">{getRoleLabel()}</p>
                </div>

                {/* Log Out Button */}
                <button
                  onClick={handleLogout}
                  className="ml-1 p-1.5 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {sidebarOpen && (
          <div className="lg:hidden border-t border-slate-800">
            <nav className="px-3 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main content - Full width */}
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
