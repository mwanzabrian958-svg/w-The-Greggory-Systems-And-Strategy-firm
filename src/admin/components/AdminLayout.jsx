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
  { id: 'projects', label: 'Projects', icon: FolderKanban, section: 'projects', hasSubmenu: true },
];

// Sub-items for Projects section
const PROJECT_SUB_ITEMS = [
  { id: 'documentation', label: 'Documentation', icon: FileText },
  { id: 'accounting', label: 'Accounting', icon: DollarSign },
  { id: 'transactions', label: 'M-pesa', icon: Wallet },
  { id: 'bank', label: 'Bank Records', icon: CreditCard },
  { id: 'tracking', label: 'Project Tracking', icon: TrendingUp },
];

// Sample data for Projects sub-items
const DOCUMENTATION_DATA = [
  { id: 1, title: 'API Reference v1.0', type: 'API Documentation', version: 'v1.0.0', date: '2024-12-01', status: 'Active', project: 'Website Redesign' },
  { id: 2, title: 'User Setup Guide', type: 'User Guide', version: 'v2.1.0', date: '2024-11-15', status: 'Active', project: 'Mobile App' },
  { id: 3, title: 'Database Schema', type: 'Technical Doc', version: 'v1.5.0', date: '2024-10-20', status: 'Archived', project: 'E-Commerce Platform' },
  { id: 4, title: 'Security Protocols', type: 'Policy', version: 'v3.0.0', date: '2024-12-10', status: 'Active', project: 'Banking System' },
  { id: 5, title: 'Deployment Guide', type: 'Setup Guide', version: 'v1.2.0', date: '2024-09-05', status: 'Active', project: 'Cloud Migration' },
];

const ACCOUNTING_DATA = [
  { id: 1, account: 'Operating Expenses', type: 'Expense', amount: 45000, date: '2024-12-01', project: 'Website Redesign' },
  { id: 2, account: 'Software Licenses', type: 'Asset', amount: 120000, date: '2024-11-20', project: 'Mobile App' },
  { id: 3, account: 'Client Payment', type: 'Revenue', amount: 350000, date: '2024-11-15', project: 'E-Commerce Platform' },
  { id: 4, account: 'Server Costs', type: 'Expense', amount: 28000, date: '2024-10-30', project: 'Cloud Migration' },
  { id: 5, account: 'Consulting Fees', type: 'Expense', amount: 75000, date: '2024-12-05', project: 'Banking System' },
];

const MPESA_DATA = [
  { id: 1, type: 'PayBill', phone: '254712345678', amount: 5000, code: 'QK7X8Y9Z', recipient: 'Safaricom', date: '2024-12-01 10:30', project: 'Website Redesign' },
  { id: 2, type: 'Send Money', phone: '254723456789', amount: 15000, code: 'AB3CD4EF', recipient: 'John Doe', date: '2024-11-28 14:15', project: 'Mobile App' },
  { id: 3, type: 'Buy Goods', phone: '254734567890', amount: 8500, code: 'GH5IJ6KL', recipient: 'Supermarket', date: '2024-11-25 09:45', project: 'E-Commerce Platform' },
  { id: 4, type: 'Receive Money', phone: '254745678901', amount: 25000, code: 'MN7OP8QR', recipient: 'Client A', date: '2024-11-20 16:20', project: 'Banking System' },
  { id: 5, type: 'PayBill', phone: '254756789012', amount: 12000, code: 'ST9UV0WX', recipient: 'KPLC', date: '2024-11-18 11:00', project: 'Cloud Migration' },
];

const BANK_DATA = [
  { id: 1, bank: 'Equity Bank', account: '1234567890', type: 'Deposit', amount: 500000, reference: 'EQ001234', date: '2024-12-01', project: 'E-Commerce Platform' },
  { id: 2, bank: 'KCB Bank', account: '0987654321', type: 'Withdrawal', amount: 75000, reference: 'KCB005678', date: '2024-11-25', project: 'Mobile App' },
  { id: 3, bank: 'Co-operative Bank', account: '1122334455', type: 'Transfer', amount: 200000, reference: 'COOP009012', date: '2024-11-20', project: 'Banking System' },
  { id: 4, bank: 'Stanbic Bank', account: '5566778899', type: 'Payment', amount: 125000, reference: 'STAN003456', date: '2024-11-15', project: 'Website Redesign' },
  { id: 5, bank: 'Absa Bank', account: '9988776655', type: 'Deposit', amount: 300000, reference: 'ABSA007890', date: '2024-11-10', project: 'Cloud Migration' },
];

const TRACKING_DATA = [
  { id: 1, name: 'Website Redesign', manager: 'Alice Johnson', status: 'In Progress', progress: 65, start: '2024-09-01', due: '2024-12-31' },
  { id: 2, name: 'Mobile App', manager: 'Bob Smith', status: 'Planning', progress: 25, start: '2024-11-01', due: '2025-03-15' },
  { id: 3, name: 'E-Commerce Platform', manager: 'Carol Williams', status: 'Completed', progress: 100, start: '2024-06-01', due: '2024-10-30' },
  { id: 4, name: 'Banking System', manager: 'David Brown', status: 'In Progress', progress: 45, start: '2024-10-15', due: '2025-02-28' },
  { id: 5, name: 'Cloud Migration', manager: 'Emma Davis', status: 'On Hold', progress: 30, start: '2024-08-01', due: '2025-01-15' },
];

// Hard-coded blog posts data
const BLOG_POSTS = [
  {
    id: 1,
    title: 'Latest Tech Trends 2024',
    category: 'Technology',
    author: 'John Doe',
    date: 'Dec 15, 2024',
    image: '/images/blog/tech-trends.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
    excerpt: 'Exploring the cutting-edge technologies shaping our future in web development and AI.',
    content: 'In this comprehensive article, we dive deep into the latest technology trends that are transforming the digital landscape in 2024. From artificial intelligence and machine learning to advanced web frameworks and cloud computing, discover how these innovations are reshaping how we build and interact with technology. We explore practical applications, emerging tools, and provide insights on how businesses can leverage these trends to stay competitive in the rapidly evolving tech ecosystem.'
  },
  {
    id: 2,
    title: 'Business Strategy Essentials',
    category: 'Business',
    author: 'Jane Smith',
    date: 'Dec 10, 2024',
    image: '/images/business-strategy.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    excerpt: 'Key strategies for growing your business in the Kenyan market and beyond.',
    content: 'Building a successful business requires more than just a great idea. In this detailed guide, we cover the essential strategies that entrepreneurs and business leaders need to master. From market analysis and competitive positioning to financial planning and team building, learn the proven frameworks that have helped countless businesses thrive. Special focus is given to the unique opportunities and challenges present in the East African market, with actionable insights for both startups and established enterprises.'
  },
  {
    id: 3,
    title: 'Modern Web Development',
    category: 'Tutorial',
    author: 'Mike Johnson',
    date: 'Dec 5, 2024',
    image: '/images/web-development.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
    excerpt: 'A comprehensive guide to building responsive websites with React and Tailwind.',
    content: 'This step-by-step tutorial takes you through modern web development practices using the latest technologies. Learn how to build fast, responsive, and accessible websites using React, Tailwind CSS, and modern JavaScript. We cover everything from setting up your development environment to deploying your application. Includes practical examples, best practices for component design, state management techniques, and tips for optimizing performance. Perfect for developers looking to upgrade their skills or transition to modern web development.'
  },
  {
    id: 4,
    title: 'Digital Marketing Tips',
    category: 'Marketing',
    author: 'Sarah Williams',
    date: 'Nov 28, 2024',
    image: '/images/digital-marketing.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop',
    excerpt: 'Effective strategies for reaching your target audience online in Kenya.',
    content: 'Digital marketing continues to evolve, and staying ahead requires understanding both global best practices and local market nuances. This article explores effective strategies specifically tailored for the Kenyan market, including social media marketing, search engine optimization, content marketing, and paid advertising. Learn how to identify your target audience, create engaging content, and measure your success with meaningful metrics. Real case studies demonstrate how businesses have successfully grown their online presence and increased revenue through strategic digital marketing.'
  },
  {
    id: 5,
    title: 'Mobile App Development',
    category: 'Technology',
    author: 'David Brown',
    date: 'Nov 20, 2024',
    image: '/images/mobile-apps.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
    excerpt: 'Building cross-platform mobile applications that users love.',
    content: 'Mobile applications have become essential for businesses looking to engage with customers on-the-go. This comprehensive guide covers the entire mobile app development lifecycle, from ideation and wireframing to development and deployment. We explore both native and cross-platform development approaches, helping you choose the right technology stack for your project. Learn about user experience design principles, performance optimization, app store optimization, and strategies for maintaining and updating your app post-launch.'
  },
  {
    id: 6,
    title: 'E-Commerce Success',
    category: 'Business',
    author: 'Emily Chen',
    date: 'Nov 15, 2024',
    image: '/images/ecommerce.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    excerpt: 'How to set up and grow your online store in the Kenyan market.',
    content: 'The e-commerce landscape in Kenya is rapidly growing, presenting enormous opportunities for entrepreneurs and established businesses alike. This detailed guide walks you through every aspect of building a successful online store, from choosing the right platform and payment gateways to inventory management and customer service. We cover logistics challenges specific to the Kenyan market, strategies for building trust with online shoppers, and techniques for driving traffic and converting visitors into customers. Includes a checklist for launching your e-commerce business.'
  }
];

export function AdminLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [activeProjectSubItem, setActiveProjectSubItem] = useState('documentation');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [filteredProject, setFilteredProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'active'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    
    // Filter projects based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      // Check if any project name matches
      const allProjects = [...new Set([
        ...DOCUMENTATION_DATA.map(d => d.project),
        ...ACCOUNTING_DATA.map(d => d.project),
        ...MPESA_DATA.map(d => d.project),
        ...BANK_DATA.map(d => d.project),
        ...TRACKING_DATA.map(d => d.name)
      ])];
      
      const matchedProject = allProjects.find(p => p.toLowerCase().includes(query));
      setFilteredProject(matchedProject || null);
      
      if (matchedProject) {
        console.log('Found project:', matchedProject);
      } else {
        console.log('No project found matching:', searchQuery);
      }
    } else {
      setFilteredProject(null);
    }
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

  const handleBlogClick = (blog) => {
    setSelectedBlog(blog);
  };

  const handleBackToList = () => {
    setSelectedBlog(null);
  };

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    setSelectedBlog(null);
    setFilteredProject(null);
    // Reset project sub-item when switching main items
    if (itemId !== 'projects') {
      setActiveProjectSubItem('documentation');
    }
  };

  const getActiveItemLabel = () => {
    const item = NAV_ITEMS.find(i => i.id === activeItem);
    if (activeItem === 'projects') {
      const subItem = PROJECT_SUB_ITEMS.find(i => i.id === activeProjectSubItem);
      return subItem ? subItem.label : 'Projects';
    }
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
                    onClick={() => handleItemClick(item.id)}
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
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  showAddForm 
                    ? 'bg-green-700 text-white shadow-inner' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showAddForm ? 'Hide Form' : 'Add'}
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

          {/* Projects Sub-Menu Buttons - Show when Projects is selected */}
          {activeItem === 'projects' && (
            <div className="mb-6 bg-slate-100 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Project Management Options:</h3>
              <div className="flex flex-wrap gap-3">
                {PROJECT_SUB_ITEMS.map((subItem) => {
                  const Icon = subItem.icon;
                  const isSubActive = activeProjectSubItem === subItem.id;
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveProjectSubItem(subItem.id)}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                        isSubActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${isSubActive ? 'text-white' : 'text-slate-500'}`} />
                      {subItem.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sample Form for Database Input - Unique per item - Only visible when Add clicked */}
          {showAddForm && (
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
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Publish Date</label>
                  <input type="date" name="publishDate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
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
            {activeItem === 'projects' && activeProjectSubItem === 'documentation' && (
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
            {activeItem === 'projects' && activeProjectSubItem === 'accounting' && (
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
            {activeItem === 'projects' && activeProjectSubItem === 'transactions' && (
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
            {activeItem === 'projects' && activeProjectSubItem === 'bank' && (
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
            {activeItem === 'projects' && activeProjectSubItem === 'tracking' && (
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
          )}

          {/* Content Display Area */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{getActiveItemLabel()} List</h3>
            
            {/* Blog Posts List with Images - Clickable Cards */}
            {activeItem === 'blog' && !selectedBlog && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {BLOG_POSTS.map((blog) => (
                  <div 
                    key={blog.id}
                    onClick={() => handleBlogClick(blog)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                  >
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = blog.fallbackImage;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mb-2 ${
                        blog.category === 'Technology' ? 'bg-blue-100 text-blue-800' :
                        blog.category === 'Business' ? 'bg-green-100 text-green-800' :
                        blog.category === 'Tutorial' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.category}
                      </span>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{blog.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{blog.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {blog.author}</span>
                        <span>{blog.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Detailed Blog View */}
            {activeItem === 'blog' && selectedBlog && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Back Button */}
                <div className="p-4 border-b border-gray-200">
                  <button 
                    onClick={handleBackToList}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Blog List
                  </button>
                </div>
                
                {/* Blog Header Image */}
                <div className="h-64 md:h-96 bg-gray-200">
                  <img 
                    src={selectedBlog.image} 
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = selectedBlog.fallbackImage;
                    }}
                  />
                </div>
                
                {/* Blog Content */}
                <div className="p-6 md:p-8">
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded mb-4 ${
                    selectedBlog.category === 'Technology' ? 'bg-blue-100 text-blue-800' :
                    selectedBlog.category === 'Business' ? 'bg-green-100 text-green-800' :
                    selectedBlog.category === 'Tutorial' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedBlog.category}
                  </span>
                  
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{selectedBlog.title}</h1>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <span className="font-medium">By {selectedBlog.author}</span>
                    <span className="mx-2">•</span>
                    <span>{selectedBlog.date}</span>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed">{selectedBlog.content}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Other Items - Placeholder Text */}
            {activeItem !== 'blog' && activeItem !== 'projects' && (
              <p className="text-gray-500 text-center">
                {activeItem === 'home' && 'Home page content items will be listed here...'}
                {activeItem === 'about' && 'About Us content will be listed here...'}
                {activeItem === 'services' && 'Our Services content will be listed here...'}
                {activeItem === 'case-studies' && 'Case Studies will be listed here...'}
              </p>
            )}
            
            {/* Projects Sub-item Content - Searchable Data Tables */}
            {activeItem === 'projects' && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">{getActiveItemLabel()} Records</h3>
                  {filteredProject && (
                    <span className="text-sm text-blue-600 font-medium">
                      Showing results for: {filteredProject}
                    </span>
                  )}
                </div>
                
                {/* Documentation List */}
                {activeProjectSubItem === 'documentation' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {DOCUMENTATION_DATA
                          .filter(item => !filteredProject || item.project === filteredProject)
                          .map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{item.title}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.type}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.version}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.date}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 text-xs rounded ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.project}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredProject && DOCUMENTATION_DATA.filter(item => item.project === filteredProject).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No documentation found for {filteredProject}</p>
                    )}
                  </div>
                )}

                {/* Accounting List */}
                {activeProjectSubItem === 'accounting' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount (KES)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ACCOUNTING_DATA
                          .filter(item => !filteredProject || item.project === filteredProject)
                          .map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{item.account}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.type}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">{item.amount.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.date}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.project}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredProject && ACCOUNTING_DATA.filter(item => item.project === filteredProject).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No accounting records found for {filteredProject}</p>
                    )}
                  </div>
                )}

                {/* M-Pesa List */}
                {activeProjectSubItem === 'transactions' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {MPESA_DATA
                          .filter(item => !filteredProject || item.project === filteredProject)
                          .map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{item.type}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.phone}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">KES {item.amount.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.recipient}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.date}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.project}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredProject && MPESA_DATA.filter(item => item.project === filteredProject).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No M-pesa transactions found for {filteredProject}</p>
                    )}
                  </div>
                )}

                {/* Bank Records List */}
                {activeProjectSubItem === 'bank' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {BANK_DATA
                          .filter(item => !filteredProject || item.project === filteredProject)
                          .map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{item.bank}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.account}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.type}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">KES {item.amount.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.reference}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.date}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.project}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredProject && BANK_DATA.filter(item => item.project === filteredProject).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No bank records found for {filteredProject}</p>
                    )}
                  </div>
                )}

                {/* Project Tracking List */}
                {activeProjectSubItem === 'tracking' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {TRACKING_DATA
                          .filter(item => !filteredProject || item.name === filteredProject)
                          .map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">{item.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.manager}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 text-xs rounded ${
                                item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                item.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      item.progress === 100 ? 'bg-green-500' :
                                      item.progress >= 50 ? 'bg-blue-500' :
                                      'bg-yellow-500'
                                    }`}
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs">{item.progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.start}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.due}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredProject && TRACKING_DATA.filter(item => item.name === filteredProject).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No tracking data found for {filteredProject}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
