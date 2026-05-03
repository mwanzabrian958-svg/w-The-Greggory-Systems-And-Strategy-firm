import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Info, Briefcase, FolderKanban, BookOpen, FileText, 
  DollarSign, Wallet, CreditCard, TrendingUp, LogOut, Menu, X, 
  Search, Plus, Edit2, Trash2, User
} from 'lucide-react';

// Navigation items with their sections
const NAV_ITEMS = [
  { id: 'search', label: 'Project Search', icon: Search, section: 'projects' },
  { id: 'home', label: 'Home', icon: Home, section: 'content' },
  { id: 'about', label: 'About Us', icon: Info, section: 'content' },
  { id: 'services', label: 'Our Services', icon: Briefcase, section: 'content' },
  { id: 'case-studies', label: 'Case Studies', icon: FolderKanban, section: 'content' },
  { id: 'blog', label: 'Blog', icon: BookOpen, section: 'content' },
  { id: 'documentation', label: 'Documentation', icon: FileText, section: 'content' },
  { id: 'accounting', label: 'Accounting', icon: DollarSign, section: 'finance' },
  { id: 'transactions', label: 'Pesa Transactions', icon: Wallet, section: 'finance' },
  { id: 'bank', label: 'Bank Records', icon: CreditCard, section: 'finance' },
  { id: 'tracking', label: 'Project Tracking', icon: TrendingUp, section: 'projects' },
];

export function AdminLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleAdd = () => {
    console.log(`Add ${activeItem}`);
    // TODO: Open add modal/form for activeItem
  };

  const handleUpdate = () => {
    console.log(`Update ${activeItem}`);
    // TODO: Open update modal/form for activeItem
  };

  const handleDelete = () => {
    console.log(`Delete ${activeItem}`);
    // TODO: Open delete confirmation for activeItem
  };

  const getActiveItemLabel = () => {
    const item = NAV_ITEMS.find(i => i.id === activeItem);
    return item ? item.label : 'Home';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Bar - Two Rows */}
      <header className="bg-slate-900 text-white shadow-lg">
        {/* Row 1: Navigation Items + User Info */}
        <div className="w-full px-2 lg:px-4 border-b border-slate-800">
          <div className="flex items-center justify-between h-12">
            {/* Left: Navigation Items */}
            <nav className="flex items-center space-x-1 overflow-x-auto flex-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item.id)}
                    className={`flex items-center px-2 lg:px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3 h-3 mr-1 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right: User Info + Logout */}
            <div className="flex items-center shrink-0 ml-2 space-x-2">
              {/* User Info Box - Compact */}
              <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-2 py-1">
                {/* Avatar */}
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {(user?.display_name?.charAt(0) || user?.first_name?.charAt(0) || user?.email?.charAt(0))?.toUpperCase() || '?'}
                </div>
                
                {/* User Name */}
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-medium text-white truncate max-w-[80px]">{user?.display_name || `${user?.first_name} ${user?.last_name}` || user?.email}</p>
                </div>

                {/* Log Out Button */}
                <button
                  onClick={handleLogout}
                  className="ml-1 p-1 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: CRUD Buttons for Active Item */}
        <div className="w-full px-2 lg:px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Active Item Label */}
            <div className="flex items-center text-sm text-gray-400 mr-4">
              <span className="text-gray-500">Managing:</span>
              <span className="ml-2 text-white font-medium">{getActiveItemLabel()}</span>
            </div>

            {/* CRUD Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAdd}
                className="flex items-center px-3 py-1.5 text-xs font-medium bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
                title={`Add ${getActiveItemLabel()}`}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </button>
              
              <button
                onClick={handleUpdate}
                className="flex items-center px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
                title={`Update ${getActiveItemLabel()}`}
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Update
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                title={`Delete ${getActiveItemLabel()}`}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - White Screen */}
      <main className="flex-1 overflow-auto">
        <div className="h-full bg-white p-6">
          {/* Content will be displayed here based on active item */}
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">Select an action above to manage {getActiveItemLabel()}</p>
            <p className="text-sm mt-2">Click Add, Update, or Delete to interact with the database</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
