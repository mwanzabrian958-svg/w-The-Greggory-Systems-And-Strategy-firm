import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, FolderKanban, ClipboardList, Settings, Briefcase, BarChart3, FileText, MessageSquare, HelpCircle, ShieldCheck, Code2, Home, Info, BookOpen, Calculator, Building2, CheckSquare, TrendingUp, Search } from "lucide-react";
import { API_BASE_URL } from "../../services/api";
import { UsersModal } from "./modals/UsersModal";
import { ProjectsModal } from "./modals/ProjectsModal";
import { ApplicationsModal } from "./modals/ApplicationsModal";
import { SettingsModal } from "./modals/SettingsModal";
import { ContentModal } from "./modals/ContentModal";
import { AnalyticsModal } from "./modals/AnalyticsModal";
import { ReportsModal } from "./modals/ReportsModal";
import { CommunicationModal } from "./modals/CommunicationModal";
import { SupportModal } from "./modals/SupportModal";
import { SecurityModal } from "./modals/SecurityModal";
import { FinancialModal } from "./modals/FinancialModal";
import { CRMModal } from "./modals/CRMModal";
import { TasksModal } from "./modals/TasksModal";
import { DeveloperModal } from "./modals/DeveloperModal";

function AdminLayout({ user, children }) {
  const navigate = useNavigate();
  const [profilePhotoData, setProfilePhotoData] = useState(user?.profilePhotoData || user?.profile_photo_blob || null);
  
  // Modal state management
  const [modals, setModals] = useState({
    users: false,
    projects: false,
    applications: false,
    settings: false,
    content: false,
    analytics: false,
    reports: false,
    communication: false,
    support: false,
    security: false,
    financial: false,
    crm: false,
    tasks: false,
    developer: false,
  });

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const displayName =
    user?.display_name ||
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "Admin";

  const initials = displayName
    .split(" ")
    .map((segment) => segment[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Fetch profile photo if not available
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user?.id && !profilePhotoData) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;
          const response = await fetch(`${API_URL}/admin/profile-photo/admin/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.profile_photo) {
              setProfilePhotoData(data.profile_photo);
            }
          }
        } catch (error) {
          console.error('Error fetching profile photo:', error);
        }
      }
    };

    fetchProfilePhoto();
  }, [user?.id, profilePhotoData]);

  // Debug logging to check if profile photo data is available
  console.log('[AdminLayout] User data:', user);
  console.log('[AdminLayout] Profile photo data available:', !!profilePhotoData);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Minimal Header with User Info */}
      <div className="bg-blue-900 border-b border-blue-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* User Profile Photo on Left */}
            <div className="flex items-center gap-4">
              {profilePhotoData ? (
                <img
                  src={profilePhotoData}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-blue-300">
                  {initials}
                </div>
              )}
            </div>

            {/* Search Bar in Middle */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
                <input
                  type="text"
                  placeholder="Search users, projects, applications, content, analytics..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* User Name and Logout on Right */}
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30">
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-blue-200">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UsersModal isOpen={modals.users} onClose={() => closeModal('users')} />
      <ProjectsModal isOpen={modals.projects} onClose={() => closeModal('projects')} />
      <ApplicationsModal isOpen={modals.applications} onClose={() => closeModal('applications')} />
      <SettingsModal isOpen={modals.settings} onClose={() => closeModal('settings')} />
      <ContentModal isOpen={modals.content} onClose={() => closeModal('content')} />
      <AnalyticsModal isOpen={modals.analytics} onClose={() => closeModal('analytics')} />
      <ReportsModal isOpen={modals.reports} onClose={() => closeModal('reports')} />
      <CommunicationModal isOpen={modals.communication} onClose={() => closeModal('communication')} />
      <SupportModal isOpen={modals.support} onClose={() => closeModal('support')} />
      <SecurityModal isOpen={modals.security} onClose={() => closeModal('security')} />
      <FinancialModal isOpen={modals.financial} onClose={() => closeModal('financial')} />
      <CRMModal isOpen={modals.crm} onClose={() => closeModal('crm')} />
      <TasksModal isOpen={modals.tasks} onClose={() => closeModal('tasks')} />
      <DeveloperModal isOpen={modals.developer} onClose={() => closeModal('developer')} />

      {/* Horizontal Scrollable Quick Links */}
      <div className="bg-blue-900 border-b border-blue-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-900">
            <button onClick={() => openModal('users')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <Users className="h-4 w-4" />
              Manage Users
            </button>
            <button onClick={() => openModal('projects')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <FolderKanban className="h-4 w-4" />
              Projects
            </button>
            <button onClick={() => openModal('applications')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <ClipboardList className="h-4 w-4" />
              Applications
            </button>
            <button onClick={() => openModal('settings')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button onClick={() => openModal('content')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <Briefcase className="h-4 w-4" />
              Content
            </button>
            <button onClick={() => openModal('analytics')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>
            <button onClick={() => openModal('reports')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <FileText className="h-4 w-4" />
              Reports
            </button>
            <button onClick={() => openModal('communication')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <MessageSquare className="h-4 w-4" />
              Communication
            </button>
            <button onClick={() => openModal('support')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <HelpCircle className="h-4 w-4" />
              Support
            </button>
            <button onClick={() => openModal('security')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <ShieldCheck className="h-4 w-4" />
              Security
            </button>
            <button onClick={() => openModal('financial')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <Calculator className="h-4 w-4" />
              Financial
            </button>
            <button onClick={() => openModal('crm')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <Building2 className="h-4 w-4" />
              CRM
            </button>
            <button onClick={() => openModal('tasks')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </button>
            <button onClick={() => openModal('developer')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <Code2 className="h-4 w-4" />
              Developer
            </button>
            <button onClick={() => navigate('/admin/home')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <Home className="h-4 w-4" />
              Home
            </button>
            <button onClick={() => navigate('/admin/about')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <Info className="h-4 w-4" />
              About
            </button>
            <button onClick={() => navigate('/admin/blog')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <BookOpen className="h-4 w-4" />
              Blog
            </button>
            <button onClick={() => navigate('/admin/activity')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium whitespace-nowrap transition-all">
              <TrendingUp className="h-4 w-4" />
              Activity
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12">
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;