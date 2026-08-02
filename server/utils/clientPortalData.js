function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapProjectStatus(status) {
  const normalized = String(status || "planning").toLowerCase();
  if (["completed", "done", "closed"].includes(normalized)) return "completed";
  if (["in_progress", "in progress", "active", "in-progress"].includes(normalized)) return "in-progress";
  if (["on_hold", "on hold", "paused", "blocked"].includes(normalized)) return "on-hold";
  if (["cancelled", "canceled"].includes(normalized)) return "cancelled";
  return "planning";
}

function mapInvoiceStatus(status) {
  const normalized = String(status || "draft").toLowerCase();
  if (["paid", "complete", "completed"].includes(normalized)) return "paid";
  if (["overdue", "late"].includes(normalized)) return "overdue";
  if (["sent", "submitted", "issued"].includes(normalized)) return "pending";
  return "draft";
}

function mapTaskStatus(status) {
  const normalized = String(status || "not_started").toLowerCase();
  if (["completed", "done", "closed"].includes(normalized)) return "completed";
  if (["in_progress", "in progress", "active"].includes(normalized)) return "in-progress";
  if (["blocked", "stalled"].includes(normalized)) return "blocked";
  return "planned";
}

function getPriorityLabel(priority) {
  const normalized = String(priority || "medium").toLowerCase();
  if (["urgent", "critical"].includes(normalized)) return "Critical";
  if (["high"].includes(normalized)) return "High";
  if (["low"].includes(normalized)) return "Low";
  return "Medium";
}

function formatDate(value) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

function buildClientPortalPayload({
  user,
  projects = [],
  tasks = [],
  activities = [],
  invoices = [],
  documents = [],
  feedback = [],
  resources = [],
  summary = null,
}) {
  const normalizedProjects = projects.map((project) => ({
    id: project.id,
    name: project.project_name || project.name || "Untitled engagement",
    description: project.project_description || project.description || "Operational delivery in progress.",
    type: project.project_type || project.type || "consulting",
    status: mapProjectStatus(project.status),
    priority: getPriorityLabel(project.priority),
    progress: toNumber(project.progress_percentage || project.progress, 0),
    deadline: project.end_date || project.deadline || null,
    plannedBudget: toNumber(project.estimated_budget || project.plannedBudget || project.budget, 0),
    actualBudget: toNumber(project.actual_budget || project.actualBudget || project.spent, 0),
    manager: project.manager_name || project.manager || "Assigned team lead",
    createdAt: project.created_at || project.createdAt || null,
  }));

  const normalizedTasks = tasks.map((task) => ({
    id: task.id,
    title: task.task_name || task.title || "Project activity",
    project: task.project_name || task.project || "Delivery stream",
    assignee: task.assignee_name || task.assignee || "Assigned team",
    priority: getPriorityLabel(task.priority),
    progress: toNumber(task.progress_percentage || task.progress, 0),
    status: mapTaskStatus(task.status),
    dueDate: task.due_date || task.dueDate || null,
  }));

  const derivedResources = [];
  const resourceSeen = new Set();
  const addResource = (name, role, availability, utilization) => {
    if (!name) return;
    const key = String(name).toLowerCase();
    if (resourceSeen.has(key)) return;
    resourceSeen.add(key);
    derivedResources.push({
      id: `${String(name).toLowerCase().replace(/\s+/g, "-")}-${derivedResources.length + 1}`,
      name,
      role,
      availability,
      utilization,
    });
  };

  normalizedProjects.forEach((project) => {
    addResource(project.manager, "Project Manager", project.status === "completed" ? "Ready" : "Engaged", Math.max(55, Math.min(95, project.progress)));
  });

  normalizedTasks.forEach((task) => {
    addResource(task.assignee, "Delivery Lead", task.status === "completed" ? "Ready" : "On track", Math.max(40, Math.min(95, task.progress)));
  });

  const normalizedResources = (resources.length > 0 ? resources : derivedResources).map((resource) => ({
    id: resource.id,
    name: resource.name || resource.resource_name || "Team member",
    role: resource.role || resource.title || "Delivery Lead",
    availability: resource.availability || "Engaged",
    utilization: toNumber(resource.utilization || resource.capacity_percent, 70),
  }));

  const normalizedInvoices = invoices.map((invoice) => ({
    id: invoice.id,
    project: invoice.project_name || invoice.project || "Engagement",
    amount: toNumber(invoice.amount || invoice.total_amount || invoice.totalAmount, 0),
    status: mapInvoiceStatus(invoice.status),
    dueDate: invoice.due_date || invoice.dueDate || null,
    invoiceNumber: invoice.invoice_number || invoice.invoiceNumber || null,
  }));

  const normalizedMessages = [
    ...activities.map((activity) => ({
      id: activity.id,
      sender: activity.sender_name || activity.sender || "Company team",
      subject: String(activity.activity_type || "update").replace(/_/g, " "),
      unread: true,
      time: activity.created_at || activity.time || null,
      message: activity.message || "Project activity update shared for your portal.",
    })),
    ...feedback.map((item) => ({
      id: `feedback-${item.id}`,
      sender: "Company Admin",
      subject: item.title || "Service feedback",
      unread: item.status === "new",
      time: item.created_at || item.time || null,
      message: item.message || "Client note captured in the operational portal.",
      feedback: true,
    })),
  ]
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
    .slice(0, 8);

  const plannedBudget = normalizedProjects.reduce((sum, project) => sum + project.plannedBudget, 0);
  const spentBudget = normalizedProjects.reduce((sum, project) => sum + project.actualBudget, 0);
  const completedProjects = normalizedProjects.filter((project) => project.status === "completed").length;
  const activeProjects = normalizedProjects.filter((project) => project.status === "in-progress").length;
  const documentsByType = documents.reduce(
    (acc, document) => {
      const category = String(document.category || "general").toLowerCase();
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {},
  );

  const averageRating = feedback.length > 0
    ? feedback.reduce((sum, entry) => sum + toNumber(entry.rating, 0), 0) / feedback.length
    : toNumber(summary?.client_rating, 0);

  const onTimeDelivery = normalizedTasks.length > 0
    ? Math.round((normalizedTasks.filter((task) => task.status === "completed").length / normalizedTasks.length) * 100)
    : 100;

  const budgetVariance = plannedBudget > 0 ? Math.round(((spentBudget / plannedBudget) * 100)) : 0;

  const documentSummary = [
    { id: 1, label: "Signed Contracts", value: documentsByType.contract || 0 },
    { id: 2, label: "Deliverables", value: (documentsByType.report || 0) + (documentsByType.document || 0) + (documentsByType.proposal || 0) + (documentsByType.final || 0) },
    { id: 3, label: "Pending Approvals", value: normalizedInvoices.filter((invoice) => !["paid"].includes(invoice.status)).length },
  ];

  const kpiMetrics = [
    { id: 1, label: "On-time Delivery", value: `${onTimeDelivery}%`, trend: "up" },
    { id: 2, label: "Client Satisfaction", value: `${averageRating.toFixed(1)}/5`, trend: "up" },
    { id: 3, label: "Budget Variance", value: `${budgetVariance}%`, trend: budgetVariance > 90 ? "up" : "neutral" },
  ];

  const roleUpdates = {
    admin: [
      { title: "Project oversight", description: "Live status, invoices, and approvals are synced for your engagement." },
      { title: "Executive reporting", description: "Portfolio summaries and delivery notes are shared directly through this portal." },
    ],
    developer: [
      { title: "Delivery updates", description: "Implementation milestones and task progress are visible in real time." },
      { title: "Quality assurance", description: "Testing checkpoints and completion notes are published as work progresses." },
    ],
  };

  return {
    user: user
      ? {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: user.display_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Client",
          role: user.role || user.primary_role || "user",
          profilePhotoData: user.profilePhotoData || null,
        }
      : null,
    projects: normalizedProjects,
    invoices: normalizedInvoices,
    messages: normalizedMessages,
    tasks: normalizedTasks,
    resourceAllocations: normalizedResources,
    budgetOverview: {
      planned: plannedBudget,
      spent: spentBudget,
      forecast: plannedBudget > 0 ? Math.max(0, plannedBudget - spentBudget) : 0,
      variance: plannedBudget > 0 ? Math.round(((spentBudget - plannedBudget) / plannedBudget) * 100) : 0,
    },
    documentSummary,
    kpiMetrics,
    roleUpdates,
    businessSummary: {
      activeProjects,
      completedProjects,
      openInvoices: normalizedInvoices.filter((invoice) => invoice.status !== "paid").length,
      openMessages: normalizedMessages.filter((message) => message.unread).length,
      nextMilestone: normalizedTasks.find((task) => task.status !== "completed")?.title || "Portal synced",
    },
  };
}

module.exports = {
  buildClientPortalPayload,
};
