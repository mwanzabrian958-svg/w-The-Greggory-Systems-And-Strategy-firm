# Project Database Isolation Guide

This guide explains how to set up isolated databases for each project so that when you run `npm run dev`, each project uses its own designated database and phpMyAdmin only shows that specific database.

## Overview

Each project will have:
- Its own MySQL database
- A dedicated MySQL user with access ONLY to that database
- Isolated phpMyAdmin access (user sees only their project's database)
- No cross-contamination between projects

## Quick Setup for New Projects

### Step 1: Create the Setup Script

Copy the `setup-restricted-db-user.js` script from this project to your new project:

```bash
# From this project
cp scripts/setup-restricted-db-user.js /path/to/new-project/scripts/
```

### Step 2: Configure Database Name

Edit the script to use your project's database name:

```javascript
const RESTRICTED_USER = {
  username: 'your_project_user',        // Unique username
  password: '***REMOVED***',   // Strong password
  database: 'your_project_db'           // Your database name
};
```

### Step 3: Run the Setup Script

```bash
# Make sure XAMPP MySQL is running first
node scripts/setup-restricted-db-user.js
```

This will:
- Create a new MySQL user
- Grant access ONLY to the specified database
- Revoke all global privileges for isolation
- Display the credentials to add to your `.env` file

### Step 4: Update .env File

Add the database credentials to your project's `.env`:

```env
DB_HOST=localhost
DB_USER=your_project_user
DB_PASSWORD=***REMOVED***
DB_NAME=your_project_db
```

### Step 5: Access phpMyAdmin

When accessing phpMyAdmin, use the restricted user credentials:
- **Username:** `your_project_user`
- **Password:** `***REMOVED***`

You will ONLY see your project's database, not others.

## Example: Setting Up Multiple Projects

### Project 1: The-Greggory-Systems-And-Strategy-firm
```javascript
// scripts/setup-restricted-db-user.js
const RESTRICTED_USER = {
  username: 'the_greggory_systems_and_strategy_firm_user',
  password: '***REMOVED***',
  database: 'the_greggory_systems_and_strategy_firm_db_main'
};
```

```env
# .env
DB_HOST=localhost
DB_USER=the_greggory_systems_and_strategy_firm_user
DB_PASSWORD=***REMOVED***
DB_NAME=the_greggory_systems_and_strategy_firm_db_main
```

### Project 2: E-commerce Site
```javascript
// scripts/setup-restricted-db-user.js
const RESTRICTED_USER = {
  username: 'ecommerce_user',
  password: 'Shop2024!Secure',
  database: 'ecommerce_db'
};
```

```env
# .env
DB_HOST=localhost
DB_USER=ecommerce_user
DB_PASSWORD=Shop2024!Secure
DB_NAME=ecommerce_db
```

### Project 3: Blog Platform
```javascript
// scripts/setup-restricted-db-user.js
const RESTRICTED_USER = {
  username: 'blog_user',
  password: 'Blog2024!Secure',
  database: 'blog_db'
};
```

```env
# .env
DB_HOST=localhost
DB_USER=blog_user
DB_PASSWORD=Blog2024!Secure
DB_NAME=blog_db
```

## How It Works

### Database Isolation
- Each MySQL user is granted privileges on ONLY one database
- Global privileges are revoked to prevent access to other databases
- phpMyAdmin respects these MySQL permissions

### Security Benefits
- **Compartmentalization:** If one project is compromised, others remain safe
- **Accidental Prevention:** Can't accidentally modify wrong database
- **Clear Separation:** Each project has its own dedicated resources

### Development Workflow
1. Start XAMPP MySQL
2. Run project-specific setup script
3. Update .env with restricted credentials
4. Run `npm run dev` - project connects to its own database
5. Access phpMyAdmin with restricted credentials - see only that database

## Managing Existing Projects

### To Add Isolation to an Existing Project

1. **Backup current database:**
   ```bash
   node scripts/backup-db-github.js
   ```

2. **Create the restricted user:**
   ```bash
   node scripts/setup-restricted-db-user.js
   ```

3. **Update .env with new credentials**

4. **Test the connection:**
   ```bash
   node test-db-connection.js
   ```

### To Remove a Project's Database

```sql
-- Connect as root in phpMyAdmin or MySQL CLI
DROP DATABASE your_project_db;
DROP USER your_project_user@localhost;
FLUSH PRIVILEGES;
```

## Troubleshooting

### "Access denied for user"
- Ensure XAMPP MySQL is running
- Check that the user was created successfully
- Verify password in .env matches setup script

### "Can't see database in phpMyAdmin"
- Make sure you're logging in with the restricted user, not root
- Verify the user has privileges on that database
- Check that the database exists

### "User already exists"
- The script uses `CREATE USER IF NOT EXISTS` so it's safe to run again
- To reset: Drop the user first, then run the script again

## Best Practices

1. **Use strong passwords** for each project's database user
2. **Keep credentials in .env** and never commit to git
3. **Document database names** in your project README
4. **Backup regularly** using the backup script
5. **Test connections** after setup changes

## Advanced: Virtual Hosts (Optional)

For cleaner URLs, you can set up Apache virtual hosts:

```
http://greggory.local/    → the-greggory-systems-and-strategy-firm project
http://shop.local/       → e-commerce project  
http://blog.local/       → blog project
```

Each virtual host can point to a different project in `htdocs` with its own database configuration.

## Summary

By following this guide, each project will:
- ✅ Have its own isolated database
- ✅ Use a dedicated MySQL user with restricted access
- ✅ Show only its database in phpMyAdmin
- ✅ Run independently with `npm run dev`
- ✅ Remain secure from other projects

This ensures complete database isolation for all your projects!
