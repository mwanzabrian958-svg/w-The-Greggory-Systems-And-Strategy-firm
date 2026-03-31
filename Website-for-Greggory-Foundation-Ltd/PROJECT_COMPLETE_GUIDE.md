# Complete Project Guide - Greggory Foundation Ltd Website

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: ✅ Development Ready

---

## 📋 Quick Start (5 Minutes)

### For Frontend Development
```bash
cd "c:\Users\Lydia mwanza\Website-for-Greggory-Foundation-Ltd"
npm install          # Install once only
npm run dev          # Starts at http://localhost:5173
```

### For Backend Development
```bash
cd "c:\Users\Lydia mwanza\Website-for-Greggory-Foundation-Ltd\backend"
npm install          # Install once only
npm start            # Starts at http://localhost:8080
```

---

## 🏗️ Project Overview

This is a **full-stack web application** with:

- **Frontend**: React + Vite (runs on port 5173)
- **Backend**: Express.js + MySQL (runs on port 8080)
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **Routing**: React Router v6

### What the project does:
1. Professional website for Greggory Foundation Ltd
2. Housing agency management system (BARAKA)
3. Admin dashboard for managing content
4. User authentication and authorization
5. Blog and case study management
6. Housing applications and property management

---

## 📁 Directory Structure

```
Website-for-Greggory-Foundation-Ltd/
│
├── 📂 src/                    # FRONTEND CODE (React app)
│   ├── App.jsx               # Main app with routing
│   ├── main.jsx              # Entry point
│   ├── index.css             # Global styles
│   ├── components/           # Reusable UI components
│   ├── pages/                # Full page components
│   ├── context/              # State management
│   ├── services/             # API calls to backend
│   ├── utils/                # Helper functions
│   └── data/                 # Static data
│
├── 📂 backend/               # BACKEND CODE (Express.js)
│   ├── server.js             # Main server file
│   ├── config/               # Configuration files
│   │   ├── database.js       # MySQL connection
│   │   └── db.js             # (alternative DB config)
│   ├── controllers/          # Business logic
│   ├── routes/               # API endpoints
│   ├── middleware/           # Authentication, etc.
│   └── package.json          # Backend dependencies
│
├── 📂 database/              # Database files
│   ├── greggory_foundation_db.sql
│   └── baraka_housing_agency.sql
│
├── 📂 public/                # Static files (served by frontend)
│   ├── images/
│   └── 404.html, dashboard.html, etc.
│
├── 📂 scripts/               # Utility scripts
│   ├── backup-db.js
│   └── test-backup.js
│
├── index.html                # HTML template (Vite)
├── package.json              # Frontend dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # TailwindCSS config
├── postcss.config.js         # PostCSS config
├── env.example               # Example environment variables
│
└── 📄 Documentation
    ├── README.md
    ├── FRONTEND_GUIDE.md         # How frontend works
    ├── QUICK_START.md
    ├── ADMIN_SETUP_SUMMARY.md
    ├── AUTHENTICATION_README.md
    ├── WEBMASTER_GUIDE.md
    └── DEPLOYMENT-GUIDE.md
```

---

## 🚀 How Everything Works

### Step 1: You Visit the Website

```
1. Browser requests http://localhost:5173
   ↓
2. Vite development server responds with index.html
   ↓
3. index.html loads React from main.jsx
   ↓
4. React renders App.jsx
```

### Step 2: React App Starts

```
App.jsx
├── Wraps with AuthProvider (manages login state)
├── Wraps with Router (enables page navigation)
├── Layout component
│   ├── Navbar (header with nav links)
│   ├── SiteTagline
│   ├── Routes (determines which page to show)
│   └── Footer
└── FloatingWhatsApp widget
```

### Step 3: You Navigate Pages

```
User clicks "About Us" link
   ↓
React Router detects URL change to /about
   ↓
Router shows the About.jsx component
   ↓
About.jsx renders and displays content
```

### Step 4: You Try to Access Protected Content

```
User clicks "Services" link (requires login)
   ↓
Routes wrapped with <PrivateRoute>
   ↓
PrivateRoute checks: Is user logged in?
   ├─ YES → Shows Services page ✓
   └─ NO  → Redirects to login page ✗
```

### Step 5: You Submit Form Data

```
User fills form on Contact page
   ↓
Form onSubmit calls API function
   ↓
API function (in src/services/api.js) sends:
POST http://localhost:8080/api/contact
with user data in JSON format
   ↓
Backend Express server receives request
   ↓
Backend validates and processes data
   ↓
Backend saves to MySQL database
   ↓
Backend returns response to frontend
   ↓
Frontend displays success/error message
```

---

## 💻 Frontend Explained

### What is React?
A JavaScript library for building interactive user interfaces.

**Key concepts:**
- **Components**: Reusable UI building blocks
- **State**: Data that can change
- **Props**: Data passed to components
- **Hooks**: Functions that let you "hook into" React features (useState, useEffect, etc.)

### What is Vite?
A fast build tool for development.

- Runs on port 5173
- Hot reload (auto-refreshes when you edit files)
- Very fast!

### What is TailwindCSS?
CSS utility classes for styling without writing CSS files.

**Example:**
```jsx
// This creates a blue button with padding
<button className="bg-blue-600 px-4 py-2 rounded text-white">
  Click Me
</button>
```

### Project Structure

```
src/components/
  ├── Navbar.jsx         - Navigation bar (top of page)
  ├── Footer.jsx         - Footer (bottom of page)
  ├── PrivateRoute.jsx   - Protects routes with login requirement
  ├── RoleRoute.jsx      - Protects routes with role requirement
  └── ... other components

src/pages/
  ├── Home.jsx           - Homepage
  ├── Login.jsx          - Login page
  ├── Blog.jsx           - Blog posts
  ├── AdminDashboard.jsx - Admin panel
  └── ... other pages

src/context/
  ├── AuthContext.jsx    - Login state (who is logged in)
  └── TaskContext.jsx    - Task management state

src/services/
  └── api.js             - Sends requests to backend

src/App.jsx              - Main component with routing
src/main.jsx             - Loads React
src/index.css            - Global styles
```

### Important Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Defines all routes and page structure |
| `src/components/Navbar.jsx` | Navigation menu |
| `src/context/AuthContext.jsx` | Login/logout state |
| `src/services/api.js` | Talks to backend |
| `vite.config.js` | Dev server settings |
| `tailwind.config.js` | Styling configuration |

### Common Component Patterns

**Functional Component:**
```jsx
export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1>Welcome Home</h1>
    </div>
  )
}
```

**Component with State:**
```jsx
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}
```

**Component with Authentication:**
```jsx
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuth()
  
  if (!isAuthenticated) return <p>Please login</p>
  
  return (
    <div>
      <p>Welcome {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

**Protected Route:**
```jsx
<Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
```

---

## 🔧 Backend Explained

### What is Express.js?
A Node.js web framework for building APIs.

**Key concepts:**
- **Routes**: URLs that handle requests (GET, POST, PUT, DELETE)
- **Middleware**: Functions that process requests
- **Controllers**: Logic for handling requests
- **Database**: Where data is stored (MySQL)

### What is MySQL?
A relational database that stores data in tables.

**Example:**
```
users table:
┌────┬──────────┬─────────────────────┐
│ id │ name     │ email               │
├────┼──────────┼─────────────────────┤
│ 1  │ John     │ john@example.com    │
│ 2  │ Jane     │ jane@example.com    │
└────┴──────────┴─────────────────────┘
```

### Backend Structure

```
backend/
├── server.js              - Main server file
├── config/
│   └── database.js        - MySQL connection
├── routes/
│   ├── users.js           - User API endpoints
│   ├── properties.js      - Property API endpoints
│   ├── applications.js    - Housing application endpoints
│   ├── content.js         - Blog/case study endpoints
│   ├── management.js      - Management endpoints
│   └── images.js          - Image upload endpoints
├── controllers/
│   └── authController.js  - Login/signup logic
├── middleware/
│   └── auth.js            - Authentication middleware
└── package.json           - Backend dependencies
```

### How Requests Work

**Frontend sends request:**
```javascript
// In src/services/api.js
fetch('http://localhost:8080/api/users', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
```

**Backend receives and processes:**
```javascript
// In backend/routes/users.js
app.get('/api/users', (req, res) => {
  // Query database
  // Return data to frontend
  res.json(data)
})
```

**Response goes back to frontend:**
```javascript
// Frontend receives JSON:
{ users: [...], success: true }
```

---

## 🔐 Authentication Flow

### Login Process

```
User enters email/password on /login page
  ↓
Frontend form sends POST to /api/auth/login
  ↓
Backend validates email/password against database
  ↓
If valid:
  - Backend creates JWT token
  - Returns token + user info to frontend
  ↓
Frontend stores token in localStorage
Frontend stores user in AuthContext
  ↓
Frontend redirects to home page (now logged in)
```

### Subsequent Requests

```
Page refreshes
  ↓
AuthContext checks localStorage for saved user
  ↓
User is automatically re-authenticated (no need to login again)
```

### Accessing Protected Routes

```
User tries to visit /services (requires login)
  ↓
PrivateRoute component checks isAuthenticated
  ↓
If logged in → show page ✓
If not logged in → redirect to /login ✗
```

### Logout

```
User clicks "Logout" button
  ↓
logout() function called
  ↓
localStorage cleared
AuthContext updated
  ↓
User data removed from context
  ↓
User redirected to home page
```

---

## 📦 Dependencies

### Frontend (package.json)

| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `react-dom` | Renders React to browser |
| `react-router-dom` | Page navigation |
| `@react-oauth/google` | Google login |
| `lucide-react` | Icons |
| `tailwindcss` | Styling |
| `vite` | Development server |

### Backend (backend/package.json)

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mysql2` | MySQL driver |
| `cors` | Cross-origin requests |
| `bcryptjs` | Password hashing |
| `dotenv` | Environment variables |
| `helmet` | Security headers |

---

## 🔌 API Endpoints

### User Endpoints
```
POST   /api/users/login           - Login
POST   /api/users/signup          - Register
POST   /api/users/logout          - Logout
GET    /api/users/:id             - Get user info
PUT    /api/users/:id             - Update user
```

### Properties Endpoints
```
GET    /api/properties            - Get all properties
GET    /api/properties/:id        - Get property details
GET    /api/properties/:id/features/:room - Get room features
GET    /api/properties/stats/:companyId - Get statistics
```

### Applications Endpoints
```
POST   /api/applications          - Create application
GET    /api/applications          - Get all applications
GET    /api/applications/:id      - Get application details
PUT    /api/applications/:id      - Update application
DELETE /api/applications/:id      - Delete application
```

### Content Endpoints (Blog/Case Studies)
```
GET    /api/content/blog          - Get all blog posts
POST   /api/content/blog          - Create blog post
GET    /api/content/blog/:id      - Get blog post
PUT    /api/content/blog/:id      - Update blog post
DELETE /api/content/blog/:id      - Delete blog post

GET    /api/content/case-studies  - Get all case studies
POST   /api/content/case-studies  - Create case study
```

---

## ⚙️ Configuration

### Environment Variables (Root)
Create `.env` file:
```
VITE_API_URL=http://localhost:8080
```

### Environment Variables (Backend)
Create `backend/.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=greggory_foundation_db
PORT=8080
JWT_SECRET=your_secret_key
ADMIN_KEY=your_admin_key
```

### Database Setup

1. Install MySQL: https://www.mysql.com/downloads/
2. Create database: `mysql -u root -p < database/greggory_foundation_db.sql`
3. Verify connection in backend console

---

## 🧪 Testing

### Test Frontend
```bash
npm run dev
# Visit http://localhost:5173
# Test navigation, forms, authentication
```

### Test Backend
```bash
cd backend
npm start
# Should show: "MySQL connected to greggory_foundation_db"
# Should show: "Server running on port 8080"
```

### Test API Endpoint
```bash
# In new terminal/PowerShell:
curl http://localhost:8080/api/health
# Should return: {"status":"OK","message":"Server is running"}
```

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Problem: "vite: command not found"
# Solution:
npm install
npm run dev
```

### Backend won't connect to MySQL
```bash
# Problem: MySQL connection error

# Solution 1: Check MySQL is running
# Windows: Task Manager → look for mysqld.exe

# Solution 2: Check credentials in backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=correct_password

# Solution 3: Create database
mysql -u root -p < database/greggory_foundation_db.sql
```

### CORS error when frontend calls backend
```bash
# Problem: "No 'Access-Control-Allow-Origin' header"

# This means backend isn't configured for your frontend URL
# Fix: Check backend server.js has correct CORS origin
cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
})
```

### Page shows blank
```bash
# Check browser console (F12) for errors
# Check terminal for errors
# Verify component is imported in App.jsx
# Verify route path matches URL
```

---

## 📝 Common Tasks

### Add a New Page

1. Create `src/pages/NewPage.jsx`
2. Add to `src/App.jsx`:
   ```jsx
   import NewPage from './pages/NewPage'
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add link in `src/components/Navbar.jsx`
4. Test at `http://localhost:5173/new-page`

### Protect a Page (Require Login)

```jsx
<Route path="/protected" element={<PrivateRoute><Protected /></PrivateRoute>} />
```

### Create a Database Table

Edit `database/greggory_foundation_db.sql`:
```sql
CREATE TABLE new_table (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Then reload database:
```bash
mysql -u root -p < database/greggory_foundation_db.sql
```

### Call Backend API from Frontend

```jsx
import { someAPI } from '../services/api'

export default function Component() {
  const handleClick = async () => {
    try {
      const result = await someAPI.getData()
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }
  
  return <button onClick={handleClick}>Get Data</button>
}
```

---

## 📚 Learning Resources

### React
- https://react.dev - Official React docs
- https://reactrouter.com - React Router docs

### Tailwind CSS
- https://tailwindcss.com - Official docs
- https://tailwindui.com - Pre-built components

### Backend/Express
- https://expressjs.com - Express docs
- https://dev.mysql.com - MySQL docs

### General
- https://developer.mozilla.org - MDN web docs
- https://javascript.info - JavaScript tutorial

---

## 🚀 Deployment

See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for:
- Building for production
- Deploying to Netlify/Vercel
- Setting up backend server
- Database configuration

---

## 📞 Support

For issues or questions, check these files:
- [AUTHENTICATION_README.md](AUTHENTICATION_README.md) - Login system
- [ADMIN_SETUP_SUMMARY.md](ADMIN_SETUP_SUMMARY.md) - Admin features
- [WEBMASTER_GUIDE.md](WEBMASTER_GUIDE.md) - Content management
- [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) - Frontend details

---

**Happy coding! 🎉**
