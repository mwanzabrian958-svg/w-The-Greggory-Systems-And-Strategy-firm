import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../services/api";
import {
  Briefcase,
  Users,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Sparkles,
  FolderOpen,
  Calendar,
  CheckCircle,
  Settings,
} from "lucide-react";

export function Dashboard({ user }) {
  const userName = user?.display_name || user?.name || "Administrator";
  const [stats, setStats] = useState([
    {
      label: "Active projects",
      value: "0",
      icon: Briefcase,
      color: "from-sky-500 to-blue-600",
    },
    {
      label: "Total users",
      value: "0",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Pending approvals",
      value: "0",
      icon: ClipboardList,
      color: "from-orange-500 to-amber-600",
    },
    {
      label: "System uptime",
      value: "99.98%",
      icon: BarChart3,
      color: "from-violet-500 to-fuchsia-600",
    },
  ]);
  const [highlights, setHighlights] = useState([
    {
      title: "Loading dashboard...",
      detail: "Fetching latest data.",
      icon: Sparkles,
      badge: "Loading",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl("/api/admin/dashboard"));
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();

        if (data.success && data.dashboard) {
          const dashboard = data.dashboard;

          // Update stats with real data
          setStats([
            {
              label: "Active projects",
              value: "14",
              icon: Briefcase,
              color: "from-sky-500 to-blue-600",
            }, // TODO: Add project count from API
            {
              label: "Total users",
              value: dashboard.userCounts?.total?.toString() || "0",
              icon: Users,
              color: "from-emerald-500 to-teal-600",
            },
            {
              label: "Pending approvals",
              value: "6",
              icon: ClipboardList,
              color: "from-orange-500 to-amber-600",
            }, // TODO: Add pending approvals from API
            {
              label: "System uptime",
              value: "99.98%",
              icon: BarChart3,
              color: "from-violet-500 to-fuchsia-600",
            },
          ]);

          // Update highlights based on recent activity
          const recentActivity = dashboard.recentActivity || [];
          setHighlights([
            {
              title: "Recent activity",
              detail: `${recentActivity.length} recent logins and updates.`,
              icon: Sparkles,
              badge: "Active",
            },
            {
              title: "User management",
              detail: `${dashboard.userCounts?.admins || 0} admins, ${dashboard.userCounts?.developers || 0} developers, ${dashboard.userCounts?.users || 0} users.`,
              icon: ShieldCheck,
              badge: "System",
            },
            {
              title: "Platform status",
              detail: "All systems operational.",
              icon: Calendar,
              badge: "Online",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        setHighlights([
          {
            title: "Error loading data",
            detail: "Unable to fetch dashboard information.",
            icon: ShieldCheck,
            badge: "Error",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickLinks = [
    {
      label: "Manage users",
      icon: Users,
      route: "/admin/users",
      color: "bg-blue-600",
    },
    {
      label: "Review projects",
      icon: FolderOpen,
      route: "/admin/projects",
      color: "bg-teal-600",
    },
    {
      label: "Open applications",
      icon: ClipboardList,
      route: "/admin/applications",
      color: "bg-orange-600",
    },
    {
      label: "System settings",
      icon: Settings,
      route: "/admin/settings",
      color: "bg-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white/90 border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Admin dashboard
              </p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">
                Welcome back, {userName}
              </h1>
              <p className="mt-3 text-base text-slate-600 max-w-2xl">
                This dashboard gives you an overview of the platform, approvals,
                and project momentum.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" /> Active
                session
              </span>
              <span className="inline-flex items-center rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-sky-600 mr-2" /> 2-step
                secure access
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            <div className="grid gap-6 sm:grid-cols-2">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg"
                  >
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-6 text-3xl font-semibold">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Platform highlights
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Key items to review today.
                  </p>
                </div>
                <Briefcase className="h-7 w-7 text-slate-500" />
              </div>
              <div className="mt-6 space-y-4">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-semibold text-slate-900">
                              {item.title}
                            </p>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {item.badge}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">
              Quick actions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Access the most important admin sections directly.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.route}
                    className={`group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${link.color} text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-lg font-semibold text-slate-900">
                      {link.label}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Open the module to continue.
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
