const test = require('node:test');
const assert = require('node:assert/strict');
const { buildClientPortalPayload } = require('./clientPortalData');

test('buildClientPortalPayload derives business metrics from project rows', () => {
  const payload = buildClientPortalPayload({
    user: { id: 7, email: 'client@example.com', first_name: 'Ada', last_name: 'Lovelace', display_name: 'Ada Lovelace' },
    projects: [
      { id: 1, project_name: 'Digital Operations', project_description: 'Build a management dashboard', status: 'in_progress', progress_percentage: 65, end_date: '2026-08-15', estimated_budget: 100000, actual_budget: 70000, project_manager_id: 3, manager_name: 'Moses Ngugi', created_at: '2026-07-01' },
      { id: 2, project_name: 'CRM rollout', project_description: 'Implement client intake workflow', status: 'completed', progress_percentage: 100, end_date: '2026-07-20', estimated_budget: 20000, actual_budget: 18000, project_manager_id: 4, manager_name: 'Njeri Wambui', created_at: '2026-06-01' }
    ],
    tasks: [
      { id: 1, project_id: 1, task_name: 'Stakeholder review', status: 'in_progress', priority: 'high', due_date: '2026-08-05', assignee_name: 'Moses Ngugi' },
      { id: 2, project_id: 2, task_name: 'Training materials', status: 'completed', priority: 'medium', due_date: '2026-07-18', assignee_name: 'Njeri Wambui' }
    ],
    activities: [
      { id: 1, project_id: 1, activity_type: 'milestone', message: 'Design sprint complete', created_at: '2026-07-25 10:00:00' },
      { id: 2, project_id: 2, activity_type: 'status_change', message: 'Project finalized', created_at: '2026-07-20 09:00:00' }
    ],
    invoices: [
      { id: 101, project_id: 1, invoice_number: 'INV-1001', amount: 35000, status: 'sent', issue_date: '2026-07-01', due_date: '2026-07-31', project_name: 'Digital Operations' },
      { id: 102, project_id: 2, invoice_number: 'INV-1002', amount: 20000, status: 'paid', issue_date: '2026-06-01', due_date: '2026-06-30', project_name: 'CRM rollout' }
    ],
    documents: [
      { id: 1, project_id: 1, name: 'Statement of work', category: 'contract', created_at: '2026-07-02' },
      { id: 2, project_id: 1, name: 'Project report', category: 'report', created_at: '2026-07-10' },
      { id: 3, project_id: 2, name: 'Training guide', category: 'document', created_at: '2026-06-15' }
    ],
    feedback: [
      { id: 1, title: 'Client satisfaction', rating: 5, status: 'responded' }
    ],
    summary: { total_projects: 2, active_projects: 1, completed_projects: 1, total_budget: 120000, total_spent: 88000, average_project_duration: 45, client_rating: 4.8 }
  });

  assert.equal(payload.projects.length, 2);
  assert.equal(payload.budgetOverview.planned, 120000);
  assert.equal(payload.budgetOverview.spent, 88000);
  assert.equal(payload.documentSummary[0].value, 1);
  assert.equal(payload.kpiMetrics[0].label, 'On-time Delivery');
  assert.equal(payload.messages.length, 3);
  assert.equal(payload.resourceAllocations.length, 2);
});
