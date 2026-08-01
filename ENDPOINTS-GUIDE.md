# API Endpoints Guide - The-Greggory-Systems-And-Strategy-firm

## Overview
This document provides a comprehensive guide to all API endpoints in the The-Greggory-Systems-And-Strategy-firm project, including their purposes, request/response formats, and how they integrate with XAMPP MySQL database.

## Base URL
- **Development**: `http://localhost:8080`
- **Production**: (Configure in deployment)

## Database Connection
All endpoints connect to XAMPP MySQL database:
- **Database**: `the_greggory_systems_and_strategy_firm_db_main`
- **phpMyAdmin**: `http://localhost/phpmyadmin/index.php?route=/database/structure&db=the_greggory_systems_and_strategy_firm_db_main`
- **Host**: `localhost`
- **Port**: `3306` (default XAMPP MySQL port)

---

## Authentication Endpoints

### User Authentication (Regular Users)
**Table Used:** `users`

#### POST `/api/login`
Login for regular users.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "user***REMOVED***"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": "John Doe"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Database Table:** `users`

---

#### POST `/api/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "+254712345678"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "first_name": "Jane",
    "last_name": "Smith"
  }
}
```

**Database Table:** `users`

**Table Used:** `admin_users`
---

### Admin Authentication

#### POST `/api/admin/authenticate`
Login for admin users with access code.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "***REMOVED***",
  "adminCode": "***REMOVED***"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "admin_level": "admin",
    "access_level": "full"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid access code or credentials"
}
#### POST `/api/admin-verification/authenticate-enhanced`
Alternative endpoint for admin authentication (frontend compatibility).

**Request/Response:** Same as `/api/admin/authenticate`

```

**Database Tables:** `admin_
**Table Used:** `developer_users`users`, `access_codes`

---

### Developer Authentication

#### POST `/api/developer/authenticate`
Login for developer users with access code.

**Request Body:**
```json
{
  "email": "dev@example.com",
  "password": "***REMOVED***",
  "devCode": "***REMOVED***"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "developer": {
    "id": 1,
    "email": "dev@example.com",
#### POST `/api/developer-verification/authenticate`
Alternative endpoint for developer authentication (frontend compatibility).

**Request/Response:** Same as `/api/developer/authenticate`

---

## Session Validation Endpoints

#### GET `/api/admin/session`
Validate admin session token and return admin user data.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (Success):**
```json
{
  "success": true,
  "valid": true,
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "admin_level": "admin",
    "access_level": "full"
  }
}
```

**Database Table:** `admin_users`

---

## User Creation Endpoints (Admin Only)

#### POST `/api/admin/create`
Create new admin user (requires existing admin authentication).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "SecurePass123!",
  "first_name": "New",
  "last_name": "Admin",
  "admin_level": "admin",
  "role": "admin"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "id": 2,
    "email": "newadmin@example.com",
    "role": "admin"
  }
}
```

**Database Tables:** `admin_users` or `developer_users` (based on role parameter)

---

#### POST `/api/admin-verification/create`
Alternative endpoint for creating admin/developer users (frontend compatible).

**Request/Response:** Same as `/api/admin/create`

    "first_name": "Developer",
    "last_name": "User",
    "developer_level": "senior",
    "access_level": "full"
  }
}
```

**Database Tables:** `developer_users`, `access_codes`

---

## Project Management Endpoints

### Projects

#### GET `/api/projects`
Get all projects (filtered by user if authenticated).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": 1,
      "project_name": "Website Redesign",
      "project_description": "Complete overhaul of company website",
      "status": "in_progress",
      "priority": "high",
      "start_date": "2024-01-01",
      "end_date": "2024-03-31",
      "progress_percentage": 65,
      "estimated_budget": 50000.00,
      "actual_budget": 32500.00
    }
  ]
}
```

**Database Table:** `user_projects`

---

#### POST `/api/projects`
Create a new project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "project_name": "New Project",
  "project_description": "Project description",
  "project_type": "consulting",
  "status": "planning",
  "priority": "medium",
  "start_date": "2024-02-01",
  "end_date": "2024-04-30",
  "estimated_budget": 25000.00,
  "client_name": "Client Name",
  "client_email": "client@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "project": {
    "id": 2,
    "project_name": "New Project",
    "status": "planning"
  }
}
```

**Database Table:** `user_projects`

---

#### PUT `/api/projects/:id`
Update an existing project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "project_name": "Updated Project Name",
  "status": "in_progress",
  "progress_percentage": 75
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Project updated successfully"
}
```

**Database Table:** `user_projects`

---

#### DELETE `/api/projects/:id`
Delete a project (soft delete).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Database Table:** `user_projects`

---

### Tasks

#### GET `/api/projects/:id/tasks`
Get all tasks for a specific project.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "task_name": "Design Homepage",
      "task_description": "Create homepage mockups",
      "status": "completed",
      "priority": "high",
      "due_date": "2024-01-15T00:00:00Z",
      "assigned_to": 1
    }
  ]
}
```

**Database Table:** `project_tasks`

---

#### POST `/api/projects/:id/tasks`
Create a new task for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "task_name": "New Task",
  "task_description": "Task description",
  "status": "not_started",
  "priority": "medium",
  "due_date": "2024-02-15T00:00:00Z",
  "assigned_to": 1,
  "estimated_hours": 8.0
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "id": 2,
    "task_name": "New Task"
  }
}
```

**Database Table:** `project_tasks`

---

#### PUT `/api/tasks/:id`
Update a task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "in_progress",
  "actual_hours": 4.5
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Task updated successfully"
}
```

**Database Table:** `project_tasks`

---

### Documents

#### GET `/api/projects/:id/documents`
Get all documents for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "document_name": "Project Proposal.pdf",
      "document_type": "proposal",
      "file_path": "/uploads/documents/proposal.pdf",
      "file_size": 1024000,
      "uploaded_by": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Database Table:** `project_documents`

---

#### POST `/api/projects/:id/documents`
Upload a document to a project.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <binary file>
document_type: "proposal"
description: "Project proposal document"
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": 2,
    "document_name": "document.pdf"
  }
}
```

**Database Table:** `project_documents`

---

## Database Management Endpoints

#### GET `/api/db/status`
Check database connection status.

**Response:**
```json
{
  "success": true,
  "connected": true,
  "database": "the_greggory_systems_and_strategy_firm_db_main",
  "host": "localhost",
  "message": "Database connection successful"
}
```

---

#### POST `/api/db/backup`
Trigger database backup to local file.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Database backup created",
  "backup_file": "backup-2024-01-15.sql",
  "location": "/backups/backup-2024-01-15.sql"
}
```

**Database Action:** Exports database to SQL file in `backups/` directory

---

#### POST `/api/db/restore`
Restore database from backup file.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "backup_file": "backup-2024-01-15.sql"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Database restored successfully"
}
```

**Database Action:** Imports SQL file from `backups/` directory

---

## Content Management Endpoints

### Blog Articles

#### GET `/api/blog`
Get all published blog articles.

**Response:**
```json
{
  "success": true,
  "articles": [
    {
      "id": 1,
      "title": "Project Management Best Practices",
      "excerpt": "Learn the best practices...",
      "content": "Full article content...",
      "author": "John Doe",
      "category": "Management",
      "is_published": true,
      "published_date": "2024-01-15T00:00:00Z"
    }
  ]
}
```

**Database Table:** `blog_articles`

---

#### POST `/api/blog`
Create a new blog article (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "New Article",
  "excerpt": "Article excerpt",
  "content": "Full article content",
  "author": "Author Name",
  "category": "Management",
  "is_published": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Article created successfully"
}
```

**Database Table:** `blog_articles`

---

### Case Studies

#### GET `/api/case-studies`
Get all case studies.

**Response:**
```json
{
  "success": true,
  "case_studies": [
    {
      "id": 1,
      "title": "Digital Transformation Success",
      "client": "ABC Corporation",
      "industry": "Technology",
      "challenge": "Outdated systems...",
      "solution": "Implemented new...",
      "results": "50% efficiency increase",
      "is_featured": true
    }
  ]
}
```

**Database Table:** `case_studies`

---

#### POST `/api/case-studies`
Create a new case study (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "New Case Study",
  "client": "Client Name",
  "industry": "Industry",
  "challenge": "Challenge description",
  "solution": "Solution description",
  "results": "Results description",
  "is_featured": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Case study created successfully"
}
```

**Database Table:** `case_studies`

---

## Contact & Communication Endpoints

#### POST `/api/contact`
Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254712345678",
  "company": "ABC Corp",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a project..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

**Database Table:** `contact_forms`

---

#### GET `/api/contact`
Get all contact form submissions (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "submissions": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Project Inquiry",
      "message": "I would like to discuss...",
      "is_read": false,
      "created_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

**Database Table:** `contact_forms`

---

## User Management Endpoints

#### GET `/api/users/profile`
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": "John Doe",
    "phone_number": "+254712345678",
    "job_id": 1,
    "primary_role": "user",
    "last_login_at": "2024-01-15T10:30:00Z"
  }
}
```

**Database Table:** `users`

---

#### PUT `/api/users/profile`
Update current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "display_name": "John Smith",
  "phone_number": "+254798765432"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Database Table:** `users`

---

#### POST `/api/users/profile/photo`
Upload profile photo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
photo: <binary image file>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "photo_url": "/uploads/photos/user-1.jpg"
}
```

**Database Tables:** `users`, `images`

---

## Access Code Management Endpoints (Admin Only)

#### GET `/api/access-codes`
Get all access codes.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "codes": [
    {
      "id": 1,
      "code_type": "admin",
      "code_value": "***REMOVED***",
      "is_active": true,
      "max_uses": null,
      "current_uses": 5,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Database Table:** `access_codes`

---

#### POST `/api/access-codes`
Create a new access code.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "code_type": "admin",
  "code_value": "NEWCODE2024",
  "expires_at": "2024-12-31T23:59:59Z",
  "max_uses": 10
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Access code created successfully"
}
```

**Database Table:** `access_codes`

---

#### PUT `/api/access-codes/:id`
Update an access code.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "is_active": false,
  "max_uses": 5
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Access code updated successfully"
}
```

**Database Table:** `access_codes`

---

#### DELETE `/api/access-codes/:id`
Delete an access code (soft delete).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Access code deleted successfully"
}
```

**Database Table:** `access_codes`

---

## Payment & Invoice Endpoints

#### GET `/api/invoices`
Get all invoices for a user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "invoices": [
    {
      "id": 1,
      "invoice_number": "INV-2024-001",
      "amount": 5000.00,
      "status": "paid",
      "due_date": "2024-01-31T00:00:00Z",
      "paid_date": "2024-01-25T00:00:00Z"
    }
  ]
}
```

**Database Table:** (Create if needed)

---

#### POST `/api/mpesa/payment`
Initiate M-Pesa payment.

**Request Body:**
```json
{
  "phone_number": "+254712345678",
  "amount": 1000.00,
  "account_reference": "INV-2024-001"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment initiated",
  "transaction_id": "MPESA123456",
  "merchant_request_id": "merchant-123",
  "checkout_request_id": "ws_co_123456"
}
```

**Database Table:** `mpesa_transactions`

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing Endpoints

### Using cURL

**Test Database Connection:**
```bash
curl http://localhost:8080/api/db/status
```

**Test User Login:**
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"***REMOVED***"}'
```

**Test Admin Login:**
```bash
curl -X POST http://localhost:8080/api/admin/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"***REMOVED***","adminCode":"***REMOVED***"}'
```

### Using Postman
1. Import endpoints from collection (if available)
2. Set base URL to `http://localhost:8080`
3. Add Authorization header with Bearer token for protected routes
4. Use appropriate request body formats

---

## Security Notes

1. **Always use HTTPS in production**
2. **Never expose .env file in git**
3. **Use strong JWT secrets**
4. **Implement rate limiting** (already configured)
5. **Validate all input data**
6. **Use prepared statements** (mysql2 handles this)
7. **Implement CORS properly** (already configured)
8. **Log all authentication attempts** (already implemented)

---

## Database Schema Reference

All endpoints interact with the following main tables:
- `users` - Regular user accounts
- `admin_users` - Admin accounts
- `developer_users` - Developer accounts
- `access_codes` - Authentication codes
- `user_projects` - Project management
- `project_tasks` - Task management
- `project_documents` - Document storage
- `blog_articles` - Blog content
- `case_studies` - Case studies
- `contact_forms` - Contact submissions
- `mpesa_transactions` - Payment records
- `images` - Image storage

Full schema available in: `database/the_greggory_systems_and_strategy_firm_db_main.sql`

---

## Support

For endpoint issues:
1. Check XAMPP MySQL is running
2. Verify database exists in phpMyAdmin
3. Check .env configuration
4. Review server logs
5. Test database connection: `node test-db-connection.js`

---

**Last Updated:** 2024
**Project:** The-Greggory-Systems-And-Strategy-firm Website
**Version:** 1.0.0
