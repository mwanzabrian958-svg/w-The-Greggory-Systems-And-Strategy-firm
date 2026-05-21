import React, { useState } from "react";
import { CheckSquare, Plus, Calendar, User, AlertCircle, Filter } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../utils/permissions";

const TASKS_BY_COLUMN = {
  todo: [
    { id: 1, title: "Review grant applications", assignee: "Amaka", dueDate: "2024-05-18", priority: "high" },
    { id: 2, title: "Prepare quarterly report", assignee: "David", dueDate: "2024-05-20", priority: "medium" },
    { id: 3, title: "Update volunteer database", assignee: "Susan", dueDate: "2024-05-25", priority: "medium" },
    { id: 4, title: "Schedule partnership calls", assignee: "Amaka", dueDate: "2024-05-22", priority: "high" },
    { id: 5, title: "Audit financial records", assignee: "Finance Team", dueDate: "2024-05-28", priority: "medium" },
  ],
  inProgress: [
    { id: 6, title: "Redesign volunteer portal", assignee: "Dev Team", dueDate: "2024-05-19", priority: "high" },
    { id: 7, title: "Update website content", assignee: "Content", dueDate: "2024-05-21", priority: "medium" },
    { id: 8, title: "Implement CRM system", assignee: "IT", dueDate: "2024-05-30", priority: "high" },
  ],
  completed: [
    { id: 9, title: "Send donor thank-you emails", assignee: "Amaka", dueDate: "2024-05-15", priority: "low" },
    { id: 10, title: "Process May donations", assignee: "Finance", dueDate: "2024-05-15", priority: "medium" },
    { id: 11, title: "Host webinar on impact", assignee: "Events", dueDate: "2024-05-15", priority: "medium" },
  ],
};

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
};

export function Tasks({ user }) {
  const { can } = usePermissions(user);
  const [activeColumn, setActiveColumn] = useState("todo");

  const getTaskCount = () => {
    const todo = TASKS_BY_COLUMN.todo.length;
    const inProgress = TASKS_BY_COLUMN.inProgress.length;
    const completed = TASKS_BY_COLUMN.completed.length;
    return { todo, inProgress, completed };
  };

  const counts = getTaskCount();
  const columns = [
    { id: "todo", title: "To Do", count: counts.todo, color: "bg-blue-50" },
    { id: "inProgress", title: "In Progress", count: counts.inProgress, color: "bg-amber-50" },
    { id: "completed", title: "Completed", count: counts.completed, color: "bg-emerald-50" },
  ];

  const renderTaskCard = (task) => (
    <div key={task.id} className="rounded-3xl bg-white p-4 border border-slate-200 hover:shadow-md transition cursor-grab">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-slate-900 text-sm flex-1">{task.title}</h4>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {task.assignee}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {task.dueDate}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Task Overview Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.id} className={`rounded-3xl p-6 border border-slate-200 ${col.color}`}>
            <h3 className="text-lg font-semibold text-slate-900">{col.title}</h3>
            <p className="mt-2 text-3xl font-bold text-slate-700">{col.count}</p>
            <p className="mt-1 text-sm text-slate-600">Tasks</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Task Kanban Board</h3>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {columns.map((col) => (
            <div key={col.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-200 min-h-96">
              <h4 className="font-semibold text-slate-900 text-sm mb-4">{col.title}</h4>
              <div className="space-y-3">
                {TASKS_BY_COLUMN[col.id].map((task) => renderTaskCard(task))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      <div className="rounded-3xl bg-red-50 p-6 border border-red-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900">Overdue Tasks</h3>
            <p className="mt-1 text-sm text-red-700">You have 2 tasks overdue. Review urgent items and update timelines.</p>
            <button className="mt-3 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              View Overdue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
