import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../services/api";
import {
  LogOut,
  User,
  Code,
  Terminal,
  Zap,
  FileText,
  CheckCircle,
  Calendar,
  Layers,
  ShieldCheck,
} from "lucide-react";

export function Developer() {
  const [developerName, setDeveloperName] = useState("Developer's Dashboard");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [focusItems, setFocusItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDeveloperData = async () => {
      try {
        setLoading(true);

        // Get user data from session
        const rawSession =
          sessionStorage.getItem("gf_admin_user") ||
          sessionStorage.getItem("gf_admin_session");
        if (rawSession) {
          // gf_admin_session wraps { token, user, expiresAt }; gf_admin_user is the user object directly
          let parsed = JSON.parse(rawSession);
          const userData = parsed.user || parsed;
          setDeveloperName(
            userData.display_name ||
              (userData.first_name && userData.last_name
                ? `${userData.first_name} ${userData.last_name}`
                : userData.first_name) ||
              userData.name ||
              "Developer's Dashboard",
          );
          // Use a relative path so the Vite proxy forwards it to the backend.
          // Works on both localhost and network IP.
          if (userData.id) {
            setProfilePhoto(`/api/admin/profile-photo/developer/${userData.id}`);
          }
        }

        // Fetch developer dashboard data
        const response = await fetch(
          getApiUrl("/api/admin/developer-dashboard"),
        );
        if (!response.ok) {
          throw new Error("Failed to fetch developer dashboard data");
        }
        const data = await response.json();

        if (data.success && data.dashboard) {
          const dashboard = data.dashboard;

          // Set notifications
          setNotifications(dashboard.notifications || []);

          // Set tasks with progress calculation
          const totalTasks = dashboard.tasks?.total || 0;
          const completedTasks = dashboard.tasks?.completed || 0;
          const inProgressTasks = dashboard.tasks?.inProgress || 0;

          setTasks([
            {
              id: 1,
              name: "Completed Tasks",
              progress:
                totalTasks > 0
                  ? Math.round((completedTasks / totalTasks) * 100)
                  : 0,
            },
            {
              id: 2,
              name: "In Progress Tasks",
              progress:
                totalTasks > 0
                  ? Math.round((inProgressTasks / totalTasks) * 100)
                  : 0,
            },
            {
              id: 3,
              name: "Pending Tasks",
              progress:
                totalTasks > 0
                  ? Math.round(
                      ((dashboard.tasks?.pending || 0) / totalTasks) * 100,
                    )
                  : 0,
            },
          ]);

          // Set focus items based on recent activity
          setFocusItems([
            {
              id: 1,
              title: "Task Progress",
              detail: `${completedTasks} of ${totalTasks} tasks completed.`,
            },
            {
              id: 2,
              title: "Recent Activity",
              detail: `${dashboard.recentActivity?.length || 0} recent updates.`,
            },
          ]);
        }
      } catch (err) {
        console.error("Error loading developer data:", err);
        setError(err.message);

        // Fallback data
        setNotifications([
          {
            id: 1,
            title: "Error loading data",
            description: "Unable to fetch developer dashboard.",
            icon: ShieldCheck,
          },
        ]);
        setTasks([{ id: 1, name: "Data loading failed", progress: 0 }]);
        setFocusItems([
          {
            id: 1,
            title: "Connection issue",
            detail: "Please check your internet connection.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDeveloperData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("gf_admin_session_token");
    sessionStorage.removeItem("gf_admin_user");
    sessionStorage.removeItem("gf_admin_session");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white px-6 py-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-800 p-3 shadow-inner">
              <Terminal className="h-6 w-6 text-teal-300" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Developer portal
              </p>
              <h1 className="text-2xl font-semibold">{developerName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Profile avatar: photo → initials → humanoid icon */}
            <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-slate-600 shadow"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Initials fallback — always rendered, hidden when photo loads */}
              <div
                className="h-10 w-10 rounded-full bg-teal-600 items-center justify-center text-white text-sm font-bold shadow"
                style={{ display: profilePhoto ? 'none' : 'flex' }}
              >
                {developerName
                  ? developerName.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
                  : <User className="h-5 w-5" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white">{developerName}</p>
                <p className="text-xs text-teal-400 uppercase tracking-wider">Developer</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-slate-200">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Developer workspace
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                    Continue the development workflow
                  </h2>
                  <p className="mt-3 text-sm text-slate-600 max-w-2xl">
                    Your personal development dashboard puts task progress,
                    deployment notes, and release actions within reach.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-slate-700 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm text-slate-500">Active sprint</p>
                      <p className="text-lg font-semibold text-slate-900">
                        2 items remaining
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-white p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">In progress</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">
                      Active tasks
                    </h3>
                  </div>
                  <CheckCircle className="h-7 w-7 text-emerald-600" />
                </div>
                <div className="mt-6 space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-3xl bg-slate-50 p-4 border border-slate-200"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">
                          {task.name}
                        </p>
                        <span className="text-sm text-slate-500">
                          {task.progress}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Focus items</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">
                      Next priorities
                    </h3>
                  </div>
                  <Layers className="h-7 w-7 text-slate-600" />
                </div>
                <div className="mt-6 space-y-4">
                  {focusItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl bg-slate-50 p-4 border border-slate-200"
                    >
                      <p className="font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Quick actions</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">
                    Developer tools
                  </h3>
                </div>
                <FileText className="h-7 w-7 text-slate-600" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Open code review",
                    subtitle: "View pull requests",
                    icon: Code,
                  },
                  {
                    title: "Deployment notes",
                    subtitle: "Review latest release",
                    icon: Calendar,
                  },
                  {
                    title: "Access docs",
                    subtitle: "Project specifications",
                    icon: ShieldCheck,
                  },
                  {
                    title: "System board",
                    subtitle: "See current sprint",
                    icon: Briefcase,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition"
                    >
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-lg font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Notifications</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Recent
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Release status</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">
                    Deployment readiness
                  </h3>
                </div>
                <Zap className="h-7 w-7 text-amber-500" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Next deploy window</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Tomorrow, 09:00
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Current branch</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    main
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Developer;
