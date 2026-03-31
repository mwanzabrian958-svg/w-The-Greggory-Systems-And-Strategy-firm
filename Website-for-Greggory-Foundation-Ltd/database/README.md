# Database Schema Documentation

This directory contains the SQL schema files for each subsidiary of The Greggory Foundation Ltd.

## File Structure

### 1. `01_greggory_foundation_main.sql`
**Database Name:** `greggory_foundation_db`

This is the main database for **THE GREGGORY FOUNDATION LTD** - the parent company focused on project management consultancy.

**Key Features:**
- Team member management
- Service offerings management
- Blog articles and content management
- Case studies
- Project tracking
- Contact form submissions
- Company values and information
- Site settings and navigation

**Main Tables:**
- `users`, `roles`, `team_members` - User and team management
- `companies` - Company/subsidiary information
- `services`, `service_offerings` - Service catalog
- `blog_articles` - Blog content
- `case_studies` - Project case studies
- `projects` - Active projects
- `contact_forms` - Contact form submissions
- `site_settings` - Website configuration

---

### 2. `02_baraka_housing_agency.sql`
**Database Name:** `baraka_housing_agency`

This is the property management database for **BARAKA HOUSING AGENCY** - a subsidiary specializing in property management and rentals.

**Key Features:**
- Property and building management
- Unit/room management
- Tenant and lease management
- Rental application processing
- Payment tracking
- Maintenance request management
- Vendor management
- Expense tracking
- Document storage

**Main Tables:**
- `companies`, `properties`, `buildings`, `units` - Property structure
- `tenants`, `leases`, `payments` - Tenant management
- `applications`, `applicants` - Rental applications
- `maintenance_requests` - Maintenance tracking
- `vendors`, `expenses` - Operations management
- `documents` - Document storage
- `management_info` - Management details

---

## Installation Instructions

### Option 1: Install All Databases

To install all databases at once, run each SQL file in order:

```bash
# Install main foundation database
mysql -u your_username -p < 01_greggory_foundation_main.sql

# Install Baraka Housing Agency database
mysql -u your_username -p < 02_baraka_housing_agency.sql
```

### Option 2: Install Individual Databases

If you only need one database:

```bash
# For main foundation database only
mysql -u your_username -p < 01_greggory_foundation_main.sql

# OR for Baraka Housing Agency only
mysql -u your_username -p < 02_baraka_housing_agency.sql
```

### Option 3: Using phpMyAdmin

1. Log in to phpMyAdmin
2. Click on "Import" tab
3. Choose the SQL file you want to import
4. Click "Go"

---

## Database Connection

### Main Foundation Database
- **Database Name:** `greggory_foundation_db`
- **Connection:** Use this for the main website content, blog, case studies, etc.

### Baraka Housing Agency Database
- **Database Name:** `baraka_housing_agency`
- **Connection:** Use this for property management operations, rentals, leases, etc.

---

## Important Notes

1. **Separate Databases:** Each subsidiary has its own database for data isolation and better organization.

2. **Image Storage:** Both databases support storing images either as:
   - URLs (external/CDN storage)
   - Binary BLOBs (local storage)

3. **Foreign Keys:** All foreign key relationships are properly defined with appropriate CASCADE/SET NULL behaviors.

4. **Indexes:** Strategic indexes are created for performance on frequently queried columns.

5. **Seed Data:** Each schema includes initial seed data for testing and development.

6. **User Management:** Both databases have user and role management systems for access control.

---

## Backup Recommendations

Regular backups are essential. Use these commands:

```bash
# Backup main foundation database
mysqldump -u your_username -p greggory_foundation_db > greggory_foundation_backup.sql

# Backup Baraka Housing Agency database
mysqldump -u your_username -p baraka_housing_agency > baraka_housing_backup.sql
```

---

## Migration from Old Schema

If you're migrating from the old `greggory_foundation_db.sql` file:

1. **Backup your existing data first!**
2. Review the new schema structure
3. Create a migration script to move data to the new structure if needed
4. Test in a development environment before production

---

## Support

For questions or issues with the database schemas, refer to:
- Database administrator
- Development team
- This README file

---

**Last Updated:** 2024
**Schema Version:** 2.0

