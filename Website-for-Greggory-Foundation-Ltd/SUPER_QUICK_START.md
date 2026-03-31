# 🚀 QUICK START GUIDE - Greggory Foundation Ltd Website

**Last Updated**: January 2026  
**Project Status**: ✅ **READY TO USE**

---

## ⚡ Super Quick Start (2 Minutes)

### Open PowerShell and run:

```powershell
cd "c:\Users\Lydia mwanza\Website-for-Greggory-Foundation-Ltd"
npm run dev
```

**That's it!** The website opens at **http://localhost:5173** ✨

---

## 📱 What You're Looking At

This is a **modern React website** for The Greggory Foundation Ltd with:

✅ **Homepage** - With company info, services, testimonials  
✅ **About Page** - Company background and team  
✅ **Blog** - News and articles  
✅ **Admin Dashboard** - Manage blog posts and case studies  
✅ **User Accounts** - Login, signup, password reset  
✅ **Housing Agency** - BARAKA Housing management system  
✅ **Applications** - Housing rental applications  
✅ **Responsive Design** - Works on mobile, tablet, desktop  

---

## 🎯 Frontend Files Explained Simply

### The Three Main Pieces:

#### 1. **Components** (`src/components/`)
Small, reusable UI pieces like buttons, headers, navigation

```
Navbar.jsx           ← The menu at top
Footer.jsx           ← The footer at bottom
PrivateRoute.jsx     ← Locks pages (requires login)
```

#### 2. **Pages** (`src/pages/`)
Full-screen content. Each page has its own URL

```
Home.jsx             ← http://localhost:5173/
About.jsx            ← http://localhost:5173/about
Login.jsx            ← http://localhost:5173/login
AdminDashboard.jsx   ← http://localhost:5173/admin
```

#### 3. **Context** (`src/context/`)
Stores information across the entire app

```
AuthContext.jsx      ← Tracks who is logged in
```

### File Flow:

```
index.html (entry point)
    ↓
main.jsx (loads React)
    ↓
App.jsx (defines all routes)
    ├── AuthProvider (provides login info)
    ├── Router (enables page navigation)
    ├── Navbar component (top menu)
    ├── Routes/Pages (main content)
    └── Footer component (bottom)
```

---

## 🔧 What's Running Where?

| What | Where | Command |
|------|-------|---------|
| Frontend (React) | http://localhost:5173 | `npm run dev` |
| Backend (API) | http://localhost:8080 | `cd backend && npm start` |
| Database | MySQL (local) | `mysql -u root` |

---

## 📂 Key Files You'll Edit

### To add a new page:

1. **Create file**: `src/pages/MyPage.jsx`
2. **Edit**: `src/App.jsx` (add route)
3. **Edit**: `src/components/Navbar.jsx` (add link)
4. **Test**: Visit http://localhost:5173/my-page

### Example: Add "Team" page

**Step 1:** Create `src/pages/Team.jsx`
```jsx
export default function Team() {
  return (
    <div className="container mx-auto p-4">
      <h1>Our Team</h1>
      <p>Team members listed here</p>
    </div>
  )
}
```

**Step 2:** Edit `src/App.jsx` - add after other imports:
```jsx
import Team from './pages/Team'
```

**Step 3:** In same file, add to Routes:
```jsx
<Route path="/team" element={<Team />} />
```

**Step 4:** Edit `src/components/Navbar.jsx` - add to navigation array:
```jsx
{ name: 'Team', path: '/team' }
```

Done! Visit http://localhost:5173/team

---

## 🎨 Styling (TailwindCSS)

No CSS files needed! Use pre-made classes:

```jsx
// Instead of CSS file:
<div className="bg-blue-600 text-white p-4 rounded-lg">
  Styled with TailwindCSS
</div>

// Common classes:
p-4          → padding: 1rem
m-4          → margin: 1rem
bg-blue-600  → background color
text-white   → text color
rounded-lg   → rounded corners
flex         → flexbox layout
grid         → grid layout
```

**Colors:**
- Navy (brand): `bg-navy-900` or `text-navy-900`
- Teal: `bg-teal-600`
- Gold: `bg-yellow-600`
- White: `bg-white`
- Gray: `bg-gray-100` to `bg-gray-900`

---

## 🔐 User Login System

### How it works:

1. **User clicks "Login"** on navbar
2. **Fills form** with email/password
3. **Backend validates** against database
4. **If correct:** Saves user info, shows authenticated pages
5. **If wrong:** Shows error message

### Protected pages:
- `/services` - Requires any login
- `/projects` - Requires employee/developer role
- `/admin` - Requires admin access

### User roles:
```
employee     - Company employee
developer    - Developer/contractor
admin        - Content administrator
```

---

## 📡 Backend API Calls

When a form is submitted, the frontend talks to the backend:

```jsx
import { usersAPI } from '../services/api'

// Send login data to backend
const result = await usersAPI.login({
  email: 'user@example.com',
  password: '***REMOVED***'
})
```

The backend (`/backend/server.js`) receives it, validates, and responds.

---

## 🚨 Common Issues & Fixes

### **Issue: "Cannot find module"**
```
Error: Cannot find module '../context/AuthContext'

Fix: Check the file path is correct
  - Make sure file exists
  - Check spelling (capital/lowercase matters!)
  - Use relative path with .jsx extension
```

### **Issue: Styling not showing (colors not visible)**
```
The class name is wrong or missing

Fix: Check TailwindCSS class names
  - bg-blue not bg-blue-600 ✗
  - p-4 not padding-4 ✗
  - text-center not text-centered ✗
```

### **Issue: Page stays blank**
```
Component not rendering properly

Fix: 
  1. Open browser console (F12)
  2. Check for red error messages
  3. Read the error carefully
  4. Check terminal for errors too
```

### **Issue: Navbar not showing**
```
You're on a login page (navbar hidden there)

Normal pages:
  - Navbar shown ✓
  - Footer shown ✓

Login pages (/login, /signup):
  - No navbar
  - No footer
  - Just the form
```

---

## 📖 Component Examples

### Simple Component (No State):
```jsx
export default function Welcome() {
  return <h1>Hello, World!</h1>
}
```

### Component with State (Changes):
```jsx
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  )
}
```

### Component Using Authentication:
```jsx
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { isAuthenticated, user, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <p>Please login first</p>
  }
  
  return (
    <div>
      <p>Hello {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Protected Route:
```jsx
// In App.jsx
<Route 
  path="/admin" 
  element={<PrivateRoute><AdminDashboard /></PrivateRoute>} 
/>
```

---

## 🎯 What Each File Does

| File | Purpose |
|------|---------|
| `src/App.jsx` | Master file with all routes |
| `src/main.jsx` | Starts the React app |
| `src/index.css` | Global styles |
| `vite.config.js` | Dev server settings |
| `tailwind.config.js` | Tailwind customization |
| `package.json` | List of dependencies |
| `src/components/Navbar.jsx` | Top menu |
| `src/context/AuthContext.jsx` | Login state |
| `src/services/api.js` | Backend communication |

---

## 🔄 Development Workflow

### Every time you work:

```bash
# 1. Open terminal
cd "c:\Users\Lydia mwanza\Website-for-Greggory-Foundation-Ltd"

# 2. Start dev server (stays running)
npm run dev

# 3. Open http://localhost:5173 in browser

# 4. Edit files (changes show instantly!)

# 5. To stop: Press Ctrl+C in terminal
```

### When you edit a file:

```
Edit src/pages/Home.jsx
    ↓ (save file)
Vite detects change
    ↓
Hot reloads page
    ↓
See changes instantly in browser
```

---

## 🏗️ Building for Production

```bash
# Create optimized build
npm run build

# This creates a 'dist' folder with optimized code
# Ready to deploy to hosting!
```

---

## 🧠 Understanding the Flow

### When user clicks a link:

```
1. Click "About" link
2. React Router detects URL change to /about
3. Router shows About.jsx component
4. React re-renders page with new content
5. Browser shows new page (no full reload)
```

### When user submits a form:

```
1. Form onSubmit handler runs
2. Sends data to backend API
3. Backend processes (validates, saves to database)
4. Backend sends response back
5. Frontend shows success/error message
6. Updates UI if needed
```

---

## 💾 File Structure Tips

### Keep organized:
- One component per file
- Logical folder structure
- Clear file names

### Naming conventions:
- Components: `HomePage.jsx` (capital first letter)
- Files: `authContext.jsx` (lowercase)
- CSS classes: `text-center` (hyphenated)

---

## 🔗 Important Links

| Link | Purpose |
|------|---------|
| http://localhost:5173 | Frontend website |
| http://localhost:5173/admin | Admin dashboard |
| http://localhost:5173/login | Login page |
| http://localhost:8080/api/health | Backend health check |

---

## ❓ Need Help?

### Check these files for more info:

1. **FRONTEND_GUIDE.md** - Detailed frontend explanation
2. **PROJECT_COMPLETE_GUIDE.md** - Full project overview
3. **AUTHENTICATION_README.md** - Login system details
4. **ADMIN_SETUP_SUMMARY.md** - Admin features
5. **WEBMASTER_GUIDE.md** - Content management

### Debugging tips:

```bash
# 1. Check browser console (F12)
#    Look for red error messages

# 2. Check terminal
#    Terminal where npm run dev is running

# 3. Check network tab (F12)
#    See API requests to backend

# 4. Verify backend is running
#    Open http://localhost:8080/api/health

# 5. Verify database is running
#    Open MySQL command line

# 6. Read error messages carefully
#    They usually tell you what's wrong!
```

---

## ✨ What's Included

✅ Complete React app with Vite  
✅ Responsive design (mobile-friendly)  
✅ User authentication system  
✅ Admin content management  
✅ Blog and case studies  
✅ Housing agency module  
✅ Floating WhatsApp widget  
✅ Professional UI with TailwindCSS  
✅ Multiple user roles  
✅ Protected routes  

---

## 🎉 You're All Set!

Everything is installed and ready to go.

**To start:** Open terminal and run:
```powershell
cd "c:\Users\Lydia mwanza\Website-for-Greggory-Foundation-Ltd"
npm run dev
```

**Visit:** http://localhost:5173

**That's it!** Happy coding! 🚀

---

**Questions?** Check PROJECT_COMPLETE_GUIDE.md or FRONTEND_GUIDE.md
