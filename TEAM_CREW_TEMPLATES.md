# Team Crew Templates — Technical Reference

## Overview

Team Crew Templates allow admins to group team members under a project with a
designated team leader. Clients see only the crew assigned to their project.

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Dashboard (/admin/team)                              │
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │ Crews tab    │  │ Members tab                      │    │
│  │              │  │                                  │    │
│  │ ┌──────────┐ │  │ ┌──────────────────────────────┐ │    │
│  │ │ Leader   │ │  │ │ Name | Role | Dept | Status   │ │    │
│  │ │ Photo    │ │  │ │ John | Designer | Creative   │ │    │
│  │ ├──────────┤ │  │ │ Jane | Developer | Tech      │ │    │
│  │ │ Group    │ │  │ │ ...                          │ │    │
│  │ │ Name     │ │  │ └──────────────────────────────┘ │    │
│  │ │ Project  │ │  └──────────────────────────────────┘    │
│  │ │ ▼ Expand│ │                                           │
│  │ ├──────────┤ │                                           │
│  │ │ Member 1 │ │                                           │
│  │ │ Member 2 │ │                                           │
│  │ │ ...      │ │                                           │
│  │ └──────────┘ │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Client Portal (/client-portal → Team)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ┌────┐  Alpha Design Squad                          │   │
│  │  │IMG │  Alex Johnson — Team Lead                    │   │
│  │  └────┘  3 members                                  │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  ○ John Doe       Designer     Creative              │   │
│  │  ○ Jane Smith     Developer    Tech                  │   │
│  │  ○ Mike Brown     PM           Operations            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### team_templates

| Column | Type | Description |
|---|---|---|
| id | BIGINT(20) PK AUTO_INCREMENT | Template ID |
| name | VARCHAR(255) NOT NULL | Crew/group name |
| description | TEXT | Optional description |
| project_id | BIGINT(20) FK → user_projects.id | Linked project (nullable) |
| team_leader_id | BIGINT(20) FK → team_members.id | Leader (nullable) |
| team_leader_image | LONGBLOB | Leader photo binary |
| team_leader_image_mime | VARCHAR(100) | MIME type |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### team_template_members

| Column | Type | Description |
|---|---|---|
| id | BIGINT(20) PK AUTO_INCREMENT | Link ID |
| template_id | BIGINT(20) FK → team_templates.id | Parent template |
| team_member_id | BIGINT(20) FK → team_members.id | Member |
| role | VARCHAR(100) DEFAULT 'member' | Role in this crew |
| created_at | DATETIME | Assignment timestamp |

**Foreign keys**: Both `template_id` and `team_member_id` use `ON DELETE CASCADE`.

---

## API Endpoints

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/team-templates` | Admin | List all templates with leader, project, member count |
| GET | `/api/admin/team-templates/:id` | Admin | Get one template with members |
| POST | `/api/admin/team-templates` | Admin | Create template (+ optional member_ids) |
| PUT | `/api/admin/team-templates/:id` | Admin | Update template (replaces members if sent) |
| DELETE | `/api/admin/team-templates/:id` | Admin | Delete template + member links |

### Client Endpoint

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/project-team-template/:projectId` | User | Get crew for a project (ownership-checked) |

---

## Request/Response Shapes

### GET /api/admin/team-templates (List)

```json
{
  "success": true,
  "templates": [
    {
      "id": 1,
      "name": "Alpha Design Squad",
      "description": "Frontend redesign team",
      "project_id": 5,
      "team_leader_id": 3,
      "team_leader_image": "base64encodedstring...",
      "team_leader_image_mime": "image/jpeg",
      "leader_name": "Alex Johnson",
      "leader_role": "Creative Director",
      "project_name": "Website Redesign",
      "member_count": 3
    }
  ]
}
```

### POST /api/admin/team-templates (Create)

```json
{
  "name": "Alpha Design Squad",
  "description": "Frontend redesign team",
  "project_id": 5,
  "team_leader_id": 3,
  "team_leader_image": "data:image/jpeg;base64,/9j/4AAQ...",
  "team_leader_image_mime": "image/jpeg",
  "member_ids": [1, 2, 4]
}
```

**Response:**
```json
{ "success": true, "id": 1, "message": "Team template created" }
```

### GET /api/users/project-team-template/:projectId (Client)

**With crew:**
```json
{
  "success": true,
  "template": {
    "id": 1,
    "name": "Alpha Design Squad",
    "team_leader_image": "base64...",
    "team_leader_image_mime": "image/jpeg",
    "leader_name": "Alex Johnson",
    "members": [{ "id": 1, "name": "John Doe", "member_role": "member" }]
  }
}
```

**Without crew:**
```json
{ "success": true, "template": null }
```

---

## Frontend Components

### Admin: Team Page (`src/admin/pages/Team.jsx`)

| Tab | Content |
|---|---|
| **Crews** | Template cards with leader image, group name, project, member count. Click to expand → member list + Edit/Delete |
| **Members** | Existing team member CRUD (name, role, department, description) |

**State:**
- `team` — list of team members
- `templates` — list of crew templates
- `projects` — list of user projects (for dropdown)
- `activeTab` — 'templates' | 'members'
- `showTemplateForm`, `editingTemplate`, `templateForm` — form state
- `templateImagePreview` — local photo preview
- `expandedTemplate` — which template card is open

### Client: Client Portal (`src/pages\ClientPortal.jsx`)

| Location | Purpose |
|---|---|
| Line 110 | `crewTemplates` state (`{ projectId: template }`) |
| Lines 327-340 | `useEffect` to fetch crew per project |
| Lines 806-859 | Team section JSX with crew display |

---

## How to Create a Crew (Admin)

1. **Admin → Team → Members** → Add team members
2. **Admin → Team → Crews** → Click **New Crew**
3. Fill the form:
   - **Crew/Group Name** — e.g. "Alpha Design Squad"
   - **Assigned Project** — dropdown of client projects
   - **Team Leader** — dropdown of active members
   - **Leader Photo** — upload image (max 3MB)
   - **Description** — optional notes
   - **Crew Members** — multi-select from active members
4. Click **Save Crew**

---

## What Clients See

**Client → Projects → Team:**

- Crew card with **leader image** (or initials fallback)
- **Group name**
- **Leader name** with "— Team Lead" label
- **Member count**
- **Crew members** listed below with name, department, role

Clients can only see the crew assigned to **their own project** (ownership enforced
by the API: `WHERE project_id = ? AND user_id = ?`).

---

## File Reference

| File | Purpose |
|---|---|
| `server.js:4432-4620` | Team template API endpoints |
| `src/admin/pages/Team.jsx` | Admin team management UI |
| `src/pages/ClientPortal.jsx` | Client portal team section |
| `scripts/create-team-tables.js` | Migration script |

---

## Verification

```bash
# Create tables (run once)
node scripts/create-team-tables.js

# Verify tables
node -e "const db=require('./backend/config/database'); db.promise().query('SHOW TABLES LIKE \"team_t%\"').then(r=>console.log(r[0]))"
```

---

## Known Behaviors

- Leader photo: stored as `LONGBLOB`, sent as base64 to frontend
- Removing a member from Members tab does NOT remove them from existing crews
- Deleting a project sets `team_templates.project_id` to NULL (no cascade)
- Deleting a template cascades to `team_template_members` (FK constraint)
- Image uploads capped at 3MB client-side
- Migration uses `BIGINT(20)` to match `team_members.id` type (required for FK)