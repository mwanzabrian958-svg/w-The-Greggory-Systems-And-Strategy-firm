# Website for The Greggory Foundation Ltd

[![Build and Deploy](https://github.com/Brianmwanza-bit/Website-for-the-Greggory-Foundation-Ltd/actions/workflows/deploy.yml/badge.svg)](https://github.com/Brianmwanza-bit/Website-for-the-Greggory-Foundation-Ltd/actions/workflows/deploy.yml)

A modern, professional website for The Greggory Foundation Ltd, a consultancy that uses expert project management principles to drive business management, innovation, improvement, and successful project delivery.

## ⚡ Quick Start

```bash
cd "c:\Users\Lydia mwanza\Website-for-Greggory-Foundation-Ltd"
npm install    # First time only
npm run dev    # Starts at http://localhost:5173
```

**New to this project?** Start with [SUPER_QUICK_START.md](SUPER_QUICK_START.md) 📖

## Features

- ✅ **Responsive Design**: Optimized for all devices
- ✅ **Modern UI**: Built with React, TailwindCSS, and Lucide icons
- ✅ **Professional Branding**: Navy blue, charcoal grey, with teal and gold accents
- ✅ **User Authentication**: Login, signup, password reset
- ✅ **Admin Dashboard**: Manage blog posts and case studies
- ✅ **Housing Agency**: BARAKA housing management system
- ✅ **Multi-role Support**: Employee, Developer, Admin roles
- ✅ **Protected Routes**: Pages that require authentication
- ✅ **Full-stack**: React frontend + Express.js backend

## 📁 Project Structure

```
src/
  components/       # Reusable UI components
  pages/            # Full-page components
  context/          # State management (Auth, Tasks)
  services/         # API calls to backend
  utils/            # Helper functions
  App.jsx           # Main app with routing
  main.jsx          # React entry point
  index.css         # Global styles

backend/
  server.js         # Express API server
  routes/           # API endpoints
  controllers/      # Business logic
  config/           # Database config
  middleware/       # Authentication, etc.

database/
  greggory_foundation_db.sql    # Main database
  baraka_housing_agency.sql     # Housing database
```

## Technologies Used

- **Frontend**: React 18, Vite, React Router v6, TailwindCSS
- **Backend**: Express.js, MySQL2, JWT
- **Icons**: Lucide React
- **Security**: Helmet, CORS, bcryptjs
- **Build**: Vite (Lightning fast!)

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SUPER_QUICK_START.md](SUPER_QUICK_START.md) | Start here! 2-minute overview |
| [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) | Detailed frontend explanation |
| [PROJECT_COMPLETE_GUIDE.md](PROJECT_COMPLETE_GUIDE.md) | Full project architecture |
| [AUTHENTICATION_README.md](AUTHENTICATION_README.md) | Login system details |
| [ADMIN_SETUP_SUMMARY.md](ADMIN_SETUP_SUMMARY.md) | Admin dashboard features |
| [WEBMASTER_GUIDE.md](WEBMASTER_GUIDE.md) | Content management |
| [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) | Deploy to production |

## Getting Started

### Prerequisites
- Node.js (v16 or higher) - [Download](https://nodejs.org)
- npm (comes with Node.js)
- MySQL (optional, for database)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173 in your browser
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 🔧 Backend Setup

```bash
# Install backend dependencies
cd backend
npm install

# Start backend server
npm start
# Server runs on http://localhost:8080
```

## 📋 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run preview      # Preview production build
```

### Backend
```bash
cd backend
npm start            # Start backend server
```

## 🔐 Authentication

The app includes:
- ✅ Login/Signup pages
- ✅ Password reset
- ✅ Google OAuth integration
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Protected routes

See [AUTHENTICATION_README.md](AUTHENTICATION_README.md) for details.

## 🏠 Pages

| Page | Path | Public | Features |
|------|------|--------|----------|
| Home | `/` | ✅ | Homepage, hero, testimonials |
| About | `/about` | ✅ | Company info, team |
| Services | `/services` | 🔒 | Services (requires login) |
| Projects | `/projects` | 🔒 | Projects (requires employee/dev) |
| Blog | `/blog` | ✅ | Blog posts, news |
| Case Studies | `/case-studies` | ✅ | Success stories |
| Contact | `/contact` | ✅ | Contact form |
| Login | `/login` | ✅ | User login |
| Signup | `/signup` | ✅ | User registration |
| Forgot Password | `/forgot-password` | ✅ | Password reset |
| Admin Dashboard | `/admin` | 🔒 | Manage content |
| Housing Agency | `/companies/housing` | ✅ | BARAKA housing |
| Terms | `/terms` | ✅ | Terms of service |
| Privacy | `/privacy` | ✅ | Privacy policy |

🔒 = Requires authentication
✅ = Public page

## 🎨 Styling

Built with **TailwindCSS** - utility-first CSS framework.

Key colors:
- Navy blue (primary)
- Teal (accent)
- Gold (highlights)
- Charcoal grey (secondary)

Edit `tailwind.config.js` to customize.

## 🗄️ Database

### Setup

```bash
# Create database
mysql -u root -p < database/greggory_foundation_db.sql

# Or for housing module
mysql -u root -p < database/baraka_housing_agency.sql
```

### Configuration

Create `.env` file in backend folder:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=greggory_foundation_db
PORT=8080
JWT_SECRET=your_secret_key
```

## 🚀 Deployment

See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for:
- Building for production
- Deploying frontend to Netlify/Vercel
- Deploying backend to Heroku/AWS
- Setting up environment variables
- Database migration

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Clear and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Backend connection error
Check `backend/.env` has correct database credentials

### Styling not working
TailwindCSS classes might be incorrect. See [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md#styling-tailwindcss)

## 📞 Support

1. Check the relevant guide (see Documentation section)
2. Look for similar components in `/src` for examples
3. Check browser console (F12) for error messages
4. Check terminal for backend errors

## 🤝 Contributing

Want to add features or fix bugs? Great!

1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 📄 License

© 2024 The Greggory Foundation Ltd. All rights reserved.

---

**Ready to start?** → [SUPER_QUICK_START.md](SUPER_QUICK_START.md)  
**Need help?** → [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md)  
**Full details?** → [PROJECT_COMPLETE_GUIDE.md](PROJECT_COMPLETE_GUIDE.md)
