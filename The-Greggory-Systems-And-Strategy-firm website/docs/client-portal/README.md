# Client Portal Business Blueprint

This folder documents the client portal experience for real business use.

## Objectives
- Show the client exactly what the company is doing for them.
- Surface live project, task, invoice, document, and communication data.
- Provide a professional operational view that supports trust and transparency.

## Included assets
- Backend payload builder: server/utils/clientPortalData.js
- Portal UI: src/pages/ClientPortal.jsx
- Portal verification test: server/utils/clientPortalData.test.js

## Production notes
- Ensure the database contains real rows in user_projects, project_tasks, project_invoices, project_docs, project_activities, and user_feedback.
- Link the portal to the authenticated user id so each client sees only their own records.
- Add real document uploads and invoice PDFs over time to make the portal richer.
