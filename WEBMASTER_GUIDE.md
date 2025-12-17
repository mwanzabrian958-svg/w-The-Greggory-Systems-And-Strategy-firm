# Webmaster Guide - Content Management System

This guide explains how to manage and update the Greggory Foundation website content using the Admin Dashboard.

## Accessing the Admin Dashboard

1. Navigate to: **http://localhost:5173/admin** (or your deployed URL + `/admin`)
2. You'll be prompted to enter your **Admin Key**
3. Enter the admin key that's configured in your backend `.env` file

### Setting Up the Admin Key

The admin key is set in your backend environment variables:

1. In the `backend` folder, create or edit `.env` file
2. Add: `ADMIN_KEY=your-secure-admin-key-here`
3. Restart your backend server

**Important:** Keep this key secure and never commit it to version control!

## Features

### 1. Blog Posts Management

The admin dashboard allows you to:
- **View** all blog posts (published and drafts)
- **Create** new blog posts
- **Edit** existing posts
- **Delete** posts
- **Publish/Unpublish** posts

#### Creating a Blog Post

1. Go to Admin Dashboard → Blog Posts tab
2. Click "New Post" button
3. Fill in the form:
   - **Title*** (required)
   - **Excerpt** - Short description (shown in listings)
   - **Content*** (required) - Full blog post content
   - **Author** - Author name
   - **Read Time** - e.g., "5 min"
   - **Category** - Post category
   - **Image URL** - URL to featured image
   - **Icon Class** - Icon identifier (optional)
   - **Publish immediately** - Checkbox to publish right away
4. Click "Save"

#### Editing a Blog Post

1. Click the "Edit" icon (pencil) next to any post
2. Modify the fields as needed
3. Click "Save"

### 2. Case Studies Management

Manage your project case studies:
- **View** all case studies
- **Create** new case studies
- **Edit** existing case studies
- **Delete** case studies
- **Feature** case studies (mark as featured)

#### Creating a Case Study

1. Go to Admin Dashboard → Case Studies tab
2. Click "New Case Study" button
3. Fill in the form:
   - **Title*** (required)
   - **Client** - Client name
   - **Industry** - Industry sector
   - **Duration** - Project duration (e.g., "6 months")
   - **Challenge** - Description of the challenge
   - **Solution** - Description of the solution
   - **Results** - Project results and outcomes
   - **Image URLs** - One URL per line for images
   - **Feature this case study** - Checkbox to feature it
4. Click "Save"

### 3. Contact Forms Viewer

View and manage contact form submissions:
- **View** all form submissions
- **Read** full message details
- **Delete** submissions

#### Viewing Contact Submissions

1. Go to Admin Dashboard → Contact Forms tab
2. Click on any submission in the left panel
3. View full details in the right panel including:
   - Name, Email, Phone
   - Company (if provided)
   - Subject
   - Full message
   - Submission timestamp

## Backend Setup

Make sure your backend server is running:

```bash
cd backend
npm install
npm start
```

The backend should run on `http://localhost:5000` by default.

## Database Management

The admin dashboard connects to your MySQL database. Make sure:

1. Your database is set up (run the SQL schema files in `database/` folder)
2. Database connection is configured in `backend/config/database.js`
3. The `ADMIN_KEY` environment variable is set

### Direct Database Access (Alternative)

For advanced users, you can also directly access the database using:
- phpMyAdmin
- MySQL Workbench
- Command line MySQL client

Key tables:
- `blog_articles` - Blog posts
- `case_studies` - Case studies
- `contact_forms` - Contact form submissions
- `properties` - Property listings (for housing agency)
- `applications` - Rental applications

## Security Best Practices

1. **Never share your admin key** publicly
2. **Use HTTPS** in production
3. **Keep your admin key strong** (long, random string)
4. **Regular backups** of your database
5. **Limit admin access** to trusted personnel only

## Troubleshooting

### "Failed to load data. Check your admin key"

- Verify your admin key is correct
- Check that backend server is running
- Verify `ADMIN_KEY` in backend `.env` file matches what you entered

### "Failed to save" errors

- Check backend server logs
- Verify database connection
- Ensure all required fields are filled

### Connection refused errors

- Make sure backend is running on port 5000
- Check `API_BASE_URL` in `src/services/api.js` matches your backend URL
- For production, update the API URL to your deployed backend

## Support

For technical issues, contact your development team. For content-related questions, refer to your organization's content guidelines.

