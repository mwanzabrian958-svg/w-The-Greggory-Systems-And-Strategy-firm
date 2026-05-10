# XAMPP Configuration Files

This directory contains XAMPP configuration file backups for the Greggory Foundation Ltd project.

## Purpose
These configuration files are stored in the GitHub repository to ensure that:
- XAMPP settings can be easily restored after PC deletion or corruption
- Team members can replicate the exact XAMPP setup
- Database and server configurations are version-controlled
- Disaster recovery is simplified

## Files Included

### my.ini (MySQL Configuration)
- MySQL server configuration
- Character set and collation settings
- Connection limits and timeouts
- Storage engine settings
- Query cache settings

**Location in XAMPP:** `C:\xampp\mysql\bin\my.ini`

### php.ini (PHP Configuration)
- PHP runtime configuration
- Error reporting settings
- File upload limits
- Memory limits
- Extension settings

**Location in XAMPP:** `C:\xampp\php\php.ini`

### httpd.conf (Apache Configuration)
- Apache web server configuration
- Virtual host settings
- SSL/TLS settings
- Module loading
- Security settings

**Location in XAMPP:** `C:\xampp\apache\conf\httpd.conf`

## How to Use These Files

### Initial Setup
1. Install XAMPP on your system
2. Stop Apache and MySQL services in XAMPP Control Panel
3. Backup your existing XAMPP configuration files
4. Copy the files from this directory to their respective XAMPP locations
5. Restart Apache and MySQL services
6. Import the database schema from `database/greggory_foundation_db_main.sql`

### After PC Deletion/Corruption
1. Install XAMPP on the new/repair system
2. Clone this repository: `git clone https://github.com/Brianmwanza-bit/Website-for-Greggory-Foundation-Ltd`
3. Copy configuration files from `xampp-config/` to XAMPP directories
4. Start XAMPP services (Apache + MySQL)
5. Import database: `node scripts/restore-db-github.js`
6. Install dependencies: `npm install`
7. Start the project: `npm run dev`

## Important Notes

- **Never edit these files directly** unless you understand the implications
- **Always backup XAMPP** before making configuration changes
- **Test changes** in a development environment first
- **Document any customizations** in this README
- **Keep these files in sync** with your actual XAMPP configuration

## Customization

If you need to customize XAMPP settings:
1. Edit the actual XAMPP configuration files
2. Test the changes
3. Copy the updated files back to this directory
4. Commit to GitHub with a descriptive message

## Security

These files may contain sensitive information:
- Database credentials (if stored in config)
- API keys (if configured)
- Server paths
- Security settings

**Review before committing** and ensure no sensitive data is exposed.

## Version Control

Track changes to these files:
```bash
git add xampp-config/
git commit -m "Updated XAMPP configuration for [reason]"
git push
```

## Support

For XAMPP configuration issues:
- XAMPP Documentation: https://www.apachefriends.org/index.html
- Apache Docs: https://httpd.apache.org/docs/
- PHP Docs: https://www.php.net/docs.php
- MySQL Docs: https://dev.mysql.com/doc/

---

**Last Updated:** 2024
**Project:** Greggory Foundation Ltd Website
