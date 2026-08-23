# XAMPP Setup Guide for The-Greggory-Systems-And-Strategy-firm Project

## Overview
This guide explains how to set up XAMPP (Apache, MySQL, PHP) for the The-Greggory-Systems-And-Strategy-firm website project and ensure all data is backed up to GitHub for safety.

## Prerequisites
- XAMPP installed (Download from: https://www.apachefriends.org/download.html)
- Node.js installed (v16 or higher)
- Git installed
- This project cloned from GitHub

## Quick Setup Steps

### 1. Start XAMPP Services
1. Open XAMPP Control Panel
2. Click **Start** next to **Apache** (for phpMyAdmin web interface)
3. Click **Start** next to **MySQL** (for database)
4. Both services should show green status

### 2. Access phpMyAdmin
- Open browser and go to: `http://localhost/phpmyadmin`
- Default credentials:
  - Username: `root`
  - Password: (leave empty)
- Or directly access your database: `http://localhost/phpmyadmin/index.php?route=/database/structure&db=the_greggory_systems_and_strategy_firm_db_main`

### 3. Import Database Schema
1. In phpMyAdmin, click on the **Import** tab
2. Choose file: `database/the-greggory-systems-and-strategy-firm-db-main.sql`
3. Click **Go** to import
4. Database `the_greggory_systems_and_strategy_firm_db_main` will be created with all tables

### 4. Configure Environment Variables
Create or update `.env` file in project root:

```env
# Database Configuration (XAMPP MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=the_greggory_systems_and_strategy_firm_db_main

# App Configuration
NODE_ENV=development
PORT=8080

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRES_IN=7d

# Admin Session Secret
ADMIN_SESSION_SECRET=your_long_random_admin_session_secret_change_this

# Admin Access Code (for admin panel login)
ADMIN_CODE=<YOUR_ADMIN_CODE>

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=your_session_secret_here_change_this

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Africa's Talking SMS (optional)
AFRICASTALKING_USERNAME=your_africastalking_username
AFRICASTALKING_API_KEY=your_africastalking_api_key

# Company Phone Number
COMPANY_PHONE_NUMBER=+254799789956
COMPANY_WHATSAPP_NUMBER=+254799789956
```

### 5. Install Dependencies and Start Project
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- phpMyAdmin: `http://localhost/phpmyadmin`

## Database Backup & Restore for GitHub Safety

### Automatic Backup Setup
The project includes automated backup scripts to ensure your data is safe in GitHub.

#### Backup Database to GitHub
```bash
# Run backup script
node scripts/backup-db-github.js
```

This will:
1. Export database to SQL file
2. Save to `backups/` directory
3. Create timestamped backup file
4. You can then commit to GitHub

#### Manual Backup via phpMyAdmin
1. Go to `http://localhost/phpmyadmin`
2. Select database: `the_greggory_systems_and_strategy_firm_db_main`
3. Click **Export** tab
4. Choose **Quick** export method
5. Format: **SQL**
6. Click **Go**
7. Save the `.sql` file to `backups/` directory
8. Commit to GitHub

### Restore Database from GitHub
```bash
# Run restore script
node scripts/restore-db-github.js
```

Or manually via phpMyAdmin:
1. Go to `http://localhost/phpmyadmin`
2. Select database: `the_greggory_systems_and_strategy_firm_db_main`
3. Click **Import** tab
4. Choose file from `backups/` directory
5. Click **Go**

## XAMPP Configuration Files (Included in Project)

The following XAMPP configuration files are included in this project for easy restoration:

### Project Structure
```
Website-for-The-Greggory-Systems-And-Strategy-Firm/
├── xampp-config/              # XAMPP configuration backups
│   ├── my.ini                 # MySQL configuration
│   ├── php.ini                # PHP configuration
│   └── httpd.conf             # Apache configuration
├── database/                  # Database schemas
│   └── the_greggory_systems_and_strategy_firm_db_main.sql
├── backups/                   # Database backups (git tracked)
│   ├── backup-2024-01-15.sql
│   └── backup-2024-01-16.sql
├── scripts/                   # Backup/restore scripts
│   ├── backup-db-github.js    # Backup to GitHub
│   └── restore-db-github.js   # Restore from GitHub
└── .env                       # Environment configuration
```

## Endpoint Configuration

### Backend API Endpoints
The backend server runs on port 8080 (configurable via PORT in .env)

**Authentication Endpoints:**
- `POST /api/login` - User login
- `POST /api/signup` - User registration
- `POST /api/admin/authenticate` - Admin login
- `POST /api/developer/authenticate` - Developer login

**Database Endpoints:**
- `GET /api/db/status` - Check database connection
- `GET /api/db/backup` - Trigger database backup
- `POST /api/db/restore` - Restore database from backup

**Project Management Endpoints:**
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

See `ENDPOINTS-GUIDE.md` for complete endpoint documentation.

## Troubleshooting

### MySQL Won't Start
1. Check if port 3306 is already in use:
   ```bash
   netstat -ano | findstr :3306
   ```
2. If another service is using port 3306, either:
   - Stop that service
   - Change MySQL port in `xampp-config/my.ini`

### Can't Access phpMyAdmin
1. Ensure Apache is running in XAMPP Control Panel
2. Check if port 80 is available:
   ```bash
   netstat -ano | findstr :80
   ```
3. Try accessing: `http://localhost:8080/phpmyadmin` (if Apache port changed)

### Database Connection Failed
1. Verify MySQL is running in XAMPP
2. Check .env file credentials match XAMPP MySQL settings
3. Test connection:
   ```bash
   node test-db-connection.js
   ```

### Database Not Found
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Import schema: `database/the_greggory_systems_and_strategy_firm_db_main.sql`
3. Verify database name in .env matches: `the_greggory_systems_and_strategy_firm_db_main`

## Security Notes

### Production Deployment
For production, change these security settings in `.env`:
- Set a strong MySQL password (not empty)
- Change JWT_SECRET to a random string
- Change ADMIN_SESSION_SECRET to a random string
- Change ADMIN_CODE to a unique code
- Use HTTPS (not HTTP)
- Enable firewall rules

### Never Commit to GitHub
- `.env` file (contains sensitive data)
- Real passwords or API keys
- Personal user data
- Session tokens

### Always Commit to GitHub
- Database schema files (.sql)
- Database backups (.sql in backups/ folder)
- Configuration templates (.env.example)
- XAMPP configuration files
- Backup and restore scripts

## Regular Maintenance

### Weekly Tasks
1. Run database backup: `node scripts/backup-db-github.js`
2. Commit backup to GitHub
3. Test restore procedure on test environment

### Monthly Tasks
1. Review and clean old backups (keep last 3 months)
2. Update XAMPP to latest version
3. Review security settings
4. Test all endpoints

### After Major Changes
1. Backup database before changes
2. Test changes on development environment
3. Backup after successful changes
4. Document any schema changes

## Quick Reference

### Start Everything
```bash
# 1. Start XAMPP (Apache + MySQL)
# Open XAMPP Control Panel and click Start

# 2. Start project
npm run dev

# 3. Access services
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
# phpMyAdmin: http://localhost/phpmyadmin
```

### Backup Everything
```bash
# 1. Backup database
node scripts/backup-db-github.js

# 2. Commit to GitHub
git add .
git commit -m "Database backup"
git push
```

### Restore Everything
```bash
# 1. Clone from GitHub (if needed)
git clone https://github.com/Brianmwanza-bit/Website-for-The-Greggory-Systems-And-Strategy-Firm

# 2. Install dependencies
npm install

# 3. Restore database
node scripts/restore-db-github.js

# 4. Start project
npm run dev
```

## Support
For issues or questions:
- GitHub Repository: https://github.com/Brianmwanza-bit/Website-for-The-Greggory-Systems-And-Strategy-Firm
- XAMPP Documentation: https://www.apachefriends.org/index.html
- phpMyAdmin Documentation: https://docs.phpmyadmin.net/

---

**Last Updated:** 2024
**Project:** The-Greggory-Systems-And-Strategy-firm Website
**Version:** 1.0.0
