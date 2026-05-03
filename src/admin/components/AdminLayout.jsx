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
  { id: 'transactions', label: 'M-pesa', icon: Wallet, section: 'finance' },
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

          {/* Sample Form for Database Input - Unique per item */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New {getActiveItemLabel()} Item</h3>
            
            {/* HOME - Hero Banner Form */}
            {activeItem === 'home' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Hero Title</label>
                  <input type="text" name="heroTitle" placeholder="Enter hero banner title..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Hero Subtitle</label>
                  <input type="text" name="heroSubtitle" placeholder="Enter subtitle..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Banner Image URL</label>
                  <input type="text" name="bannerImage" placeholder="Image URL..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Display Order</label>
                  <input type="number" name="displayOrder" placeholder="1, 2, 3..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}

            {/* ABOUT US - Company Info Form */}
            {activeItem === 'about' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Section Title</label>
                  <input type="text" name="sectionTitle" placeholder="e.g., Our Mission, Our Vision..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Section Type</label>
                  <select name="sectionType" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Mission</option>
                    <option>Vision</option>
                    <option>Values</option>
                    <option>History</option>
                    <option>Team</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Content</label>
                  <textarea name="content" placeholder="Enter about us content..." rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}

            {/* SERVICES - Service Offering Form */}
            {activeItem === 'services' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Service Name</label>
                  <input type="text" name="serviceName" placeholder="e.g., Web Development..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Price (KES)</label>
                  <input type="number" name="price" placeholder="Enter price..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Service Description</label>
                  <textarea name="description" placeholder="Describe the service..." rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
                  <input type="text" name="duration" placeholder="e.g., 2 weeks, 1 month..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Icon/Logo URL</label>
                  <input type="text" name="iconUrl" placeholder="Service icon URL..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}

            {/* CASE STUDIES - Project Form */}
            {activeItem === 'case-studies' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Project Title</label>
                  <input type="text" name="projectTitle" placeholder="Enter project name..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Client Name</label>
                  <input type="text" name="clientName" placeholder="Client company..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Project Summary</label>
                  <textarea name="summary" placeholder="Brief project overview..." rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Industry</label>
                  <select name="industry" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Retail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Completion Date</label>
                  <input type="date" name="completionDate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}

            {/* BLOG - Article Form */}
            {activeItem === 'blog' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Article Title</label>
                  <input type="text" name="articleTitle" placeholder="Enter blog post title..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Author</label>
                  <input type="text" name="author" placeholder="Author name..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                  <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Tutorial</option>
                    <option>News</option>
                    <option>Opinion</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Article Content</label>
                  <textarea name="content" placeholder="Write your blog post..." rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Featured Image (Upload from Local Storage)</label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="file" 
                      name="featuredImage" 
                      accept="image/*"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    />
                    <span className="text-xs text-gray-500">Max 5MB (JPG, PNG, GIF)</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Tags (comma separated)</label>
                  <input type="text" name="tags" placeholder="tech, coding, web..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}

            {/* DOCUMENTATION - Doc Form */}
            {activeItem === 'documentation' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Document Title</label>
                  <input type="text" name="docTitle" placeholder="e.g., API Reference..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Doc Type</label>
                  <select name="docType" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>API Documentation</option>
                    <option>User Guide</option>
                    <option>Setup Guide</option>
                    <option>FAQ</option>
                    <option>Changelog</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Version</label>
                  <input type="text" name="version" placeholder="e.g., v1.0.0..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">File URL (PDF/DOC)</label>
                  <input type="text" name="fileUrl" placeholder="Document file URL..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Document Content/Summary</label>
                  <textarea name="docContent" placeholder="Document content or summary..." rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}

            {/* ACCOUNTING - Financial Record Form */}
            {activeItem === 'accounting' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Name</label>
                  <input type="text" name="accountName" placeholder="e.g., Operating Expenses..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Type</label>
                  <select name="accountType" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Asset</option>
                    <option>Liability</option>
                    <option>Equity</option>
                    <option>Revenue</option>
                    <option>Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Amount (KES)</label>
                  <input type="number" name="amount" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Transaction Date</label>
                  <input type="date" name="transactionDate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description/Narrative</label>
                  <textarea name="description" placeholder="Transaction details..." rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}

            {/* M-PESA - Mobile Money Form */}
            {activeItem === 'transactions' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Transaction Type</label>
                  <select name="transactionType" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>PayBill</option>
                    <option>Buy Goods</option>
                    <option>Send Money</option>
                    <option>Receive Money</option>
                    <option>Withdraw</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                  <input type="tel" name="phoneNumber" placeholder="2547XX XXX XXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Amount (KES)</label>
                  <input type="number" name="amount" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Transaction Code</label>
                  <input type="text" name="transactionCode" placeholder="e.g., QK7X8Y9Z..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Recipient/Business</label>
                  <input type="text" name="recipient" placeholder="Recipient name or business..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Transaction Date</label>
                  <input type="datetime-local" name="transactionDate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}

            {/* BANK RECORDS - Bank Transaction Form */}
            {activeItem === 'bank' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
                  <input type="text" name="bankName" placeholder="e.g., Equity Bank..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
                  <input type="text" name="accountNumber" placeholder="Enter account number..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Transaction Type</label>
                  <select name="bankTransactionType" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Deposit</option>
                    <option>Withdrawal</option>
                    <option>Transfer</option>
                    <option>Payment</option>
                    <option>Check</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Amount (KES)</label>
                  <input type="number" name="amount" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Reference Number</label>
                  <input type="text" name="reference" placeholder="Transaction reference..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Transaction Date</label>
                  <input type="date" name="transactionDate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}

            {/* PROJECT TRACKING - Project Status Form */}
            {activeItem === 'tracking' && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Project Name</label>
                  <input type="text" name="projectName" placeholder="Enter project name..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Project Manager</label>
                  <input type="text" name="projectManager" placeholder="Manager name..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <select name="projectStatus" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>On Hold</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Progress %</label>
                  <input type="number" name="progress" min="0" max="100" placeholder="0-100" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                  <input type="date" name="startDate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
                  <input type="date" name="dueDate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Project Notes</label>
                  <textarea name="notes" placeholder="Latest updates and notes..." rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </form>
            )}
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
