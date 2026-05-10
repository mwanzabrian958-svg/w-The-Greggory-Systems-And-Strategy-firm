# Website for The Greggory Foundation Ltd

[![Build and Deploy](https://github.com/Brianmwanza-bit/Website-for-the-Greggory-Foundation-Ltd/actions/workflows/deploy.yml/badge.svg)](https://github.com/Brianmwanza-bit/Website-for-the-Greggory-Foundation-Ltd/actions/workflows/deploy.yml)

A modern, professional website for The Greggory Foundation Ltd, a consultancy that uses expert project management principles to drive business management, innovation, improvement, and successful project delivery.

## Features

- **Responsive Design**: Optimized for all devices
- **Modern UI**: Built with React, TailwindCSS, and Lucide icons
- **Professional Branding**: Navy blue, charcoal grey, with teal and gold accents
- **Complete Site Structure**: Home, About, Services, Case Studies, Blog, Contact
- **XAMPP Integration**: Full MySQL database with phpMyAdmin
- **GitHub Backup**: Automated database backup to GitHub for disaster recovery

## Documentation

- **[XAMPP Setup Guide](XAMPP-SETUP-GUIDE.md)** - Complete XAMPP and database setup instructions
- **[API Endpoints Guide](ENDPOINTS-GUIDE.md)** - Comprehensive API endpoint documentation
- **[Deployment Guide](DEPLOYMENT-GUIDE.md)** - Deployment instructions for production
- **[Database Access Codes](DATABASE_ACCESS_CODES.md)** - Authentication system documentation
- **[Authentication Changes](AUTHENTICATION_CHANGES.md)** - Authentication protocol details

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- XAMPP (for local database)
- Git (for version control)

### Quick Setup (Windows)

Run the automated setup script:
```powershell
.\setup-xampp-project.ps1
```

This will:
1. Install all dependencies
2. Create .env file
3. Check XAMPP services
4. Test database connection
5. Create backups directory
6. Optional: Create initial database backup

### Manual Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Start XAMPP (Apache + MySQL) via XAMPP Control Panel

# Import database schema via phpMyAdmin
# Open: http://localhost/phpmyadmin
# Import: database/greggory_foundation_db_main.sql

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  components/       # Reusable components
  pages/            # Page components
  App.jsx           # Main app component
  main.jsx          # Entry point
  index.css         # Global styles

database/           # Database schemas and migrations
  greggory_foundation_db_main.sql

scripts/            # Utility scripts
  backup-db-github.js    # Backup database to GitHub
  restore-db-github.js   # Restore database from GitHub

xampp-config/       # XAMPP configuration backups
  my.ini            # MySQL configuration
  php.ini           # PHP configuration
  httpd.conf        # Apache configuration

backups/            # Database backups (tracked in GitHub)
```

## Technologies Used

- React 18
- Vite
- TailwindCSS
- React Router DOM
- Lucide React Icons
- MySQL (via XAMPP)
- Express.js
- Node.js

## Database Management

### Access phpMyAdmin
- **URL**: http://localhost/phpmyadmin/index.php?route=/database/structure&db=greggory_foundation_db_main
- **Username**: root
- **Password**: (empty by default)

### Backup Database
```bash
# Backup to GitHub-safe format
node scripts/backup-db-github.js
```

### Restore Database
```bash
# Restore from GitHub backup
node scripts/restore-db-github.js
```

### Import Initial Schema
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click "Import" tab
3. Select file: `database/greggory_foundation_db_main.sql`
4. Click "Go"

## Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **phpMyAdmin**: http://localhost/phpmyadmin

## GitHub Safety

This project includes automated database backup to GitHub to ensure data safety:
- Database backups are stored in `backups/` directory
- XAMPP configurations are in `xampp-config/` directory
- All critical configurations are version-controlled
- Easy disaster recovery if PC is lost or corrupted

**Important**: Regularly commit your database backups to GitHub:
```bash
git add backups/
git commit -m "Database backup"
git push
```

## License

© 2024 The Greggory Foundation Ltd. All rights reserved.
