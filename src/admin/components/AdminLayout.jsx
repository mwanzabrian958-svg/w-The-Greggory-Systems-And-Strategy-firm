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
          <div className="flex items-center justify-between h-14">
            {/* Left: Navigation Items */}
            <nav className="flex items-center space-x-2 overflow-x-auto flex-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item.id)}
                    className={`flex items-center px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm whitespace-nowrap ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-900' 
                        : 'bg-slate-800 text-gray-200 hover:bg-slate-700 hover:text-white hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right: User Info + Logout */}
            <div className="flex items-center shrink-0 ml-3 space-x-3">
              {/* User Info Box - Compact */}
              <div className="flex items-center space-x-3 bg-slate-800 rounded-lg px-3 py-2 shadow-md">
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {(user?.display_name?.charAt(0) || user?.first_name?.charAt(0) || user?.email?.charAt(0))?.toUpperCase() || '?'}
                </div>
                
                {/* User Name */}
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-sm font-semibold text-white truncate max-w-[100px]">{user?.display_name || `${user?.first_name} ${user?.last_name}` || user?.email}</p>
                </div>

                {/* Log Out Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 bg-slate-700 text-gray-300 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-all shadow-sm"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: CRUD Buttons for Active Item */}
        <div className="w-full px-3 lg:px-6 py-3 bg-slate-800">
          <div className="flex items-center justify-between">
            {/* Active Item Label */}
            <div className="flex items-center text-base">
              <span className="text-gray-400 font-medium">Managing:</span>
              <span className="ml-2 text-white font-bold text-lg">{getActiveItemLabel()}</span>
            </div>

            {/* CRUD Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAdd}
                className="flex items-center px-5 py-2.5 text-sm font-bold bg-green-500 text-white hover:bg-green-400 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                title={`Add ${getActiveItemLabel()}`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add
              </button>
              
              <button
                onClick={handleUpdate}
                className="flex items-center px-5 py-2.5 text-sm font-bold bg-blue-500 text-white hover:bg-blue-400 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                title={`Update ${getActiveItemLabel()}`}
              >
                <Edit2 className="w-5 h-5 mr-2" />
                Update
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center px-5 py-2.5 text-sm font-bold bg-red-500 text-white hover:bg-red-400 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                title={`Delete ${getActiveItemLabel()}`}
              >
                <Trash2 className="w-5 h-5 mr-2" />
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
