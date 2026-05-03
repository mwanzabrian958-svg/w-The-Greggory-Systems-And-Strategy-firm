import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Info, Briefcase, FolderKanban, BookOpen, FileText, 
  DollarSign, Wallet, CreditCard, TrendingUp, LogOut, Menu, X, 
  Search, Plus, Edit2, Trash2, User, Save
} from 'lucide-react';

// Navigation items with their sections (Project Search removed - now in search box)
const NAV_ITEMS = [
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
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'active'
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // TODO: Implement project search functionality
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting to database:', formData);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/${activeItem}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('gf_admin_session_token') || ''}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Successfully created:', result);
        alert('Successfully added to database!');
        // Clear form
        setFormData({ title: '', description: '', category: '', status: 'active' });
      } else {
        console.error('Failed to create:', await response.text());
        alert('Failed to add to database. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error connecting to database. Please check your connection.');
    }
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

        {/* Row 2: Project Search Box */}
        <div className="w-full px-3 lg:px-6 py-3 bg-slate-800">
          <div className="flex items-center justify-center">
            <form onSubmit={handleSearch} className="flex items-center w-full max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700 text-white placeholder-gray-400 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                type="submit"
                className="ml-3 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-lg"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area - Display content for selected item */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="h-full p-6">
          {/* Content Header with Buttons */}
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900">{getActiveItemLabel()}</h2>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-4 py-2 text-sm font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Edit2 className="w-4 h-4 mr-2" />
                Update
              </button>
              {/* Submit Button - Between Update and Delete */}
              <button 
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors shadow-md"
              >
                <Save className="w-4 h-4 mr-2" />
                Submit
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>

          {/* Sample Form for Database Input */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New {getActiveItemLabel()} Item</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter category..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </form>
          </div>

          {/* Content Display Area */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{getActiveItemLabel()} List</h3>
            <p className="text-gray-500 text-center">
              {activeItem === 'search' && 'Project search results will appear here...'}
              {activeItem === 'home' && 'Home page content items will be listed here...'}
              {activeItem === 'about' && 'About Us content will be listed here...'}
              {activeItem === 'services' && 'Our Services content will be listed here...'}
              {activeItem === 'case-studies' && 'Case Studies will be listed here...'}
              {activeItem === 'blog' && 'Blog posts will be listed here...'}
              {activeItem === 'documentation' && 'Documentation items will be listed here...'}
              {activeItem === 'accounting' && 'Accounting records will be listed here...'}
              {activeItem === 'transactions' && 'Pesa Transaction records will be listed here...'}
              {activeItem === 'bank' && 'Bank Records will be listed here...'}
              {activeItem === 'tracking' && 'Project Tracking data will be listed here...'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
