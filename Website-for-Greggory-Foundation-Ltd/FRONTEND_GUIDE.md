# Frontend Guide - Greggory Foundation Ltd Website

## Overview

This is a **React + Vite** frontend application for The Greggory Foundation Ltd website. It's a modern, responsive web application built with industry-standard technologies.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [How to Run](#how-to-run)
3. [Frontend Architecture](#frontend-architecture)
4. [Key Components Explained](#key-components-explained)
5. [Pages and Routing](#pages-and-routing)
6. [Authentication System](#authentication-system)
7. [Styling (TailwindCSS)](#styling-tailwindcss)
8. [Adding New Pages](#adding-new-pages)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
src/
├── App.jsx                 # Main app component with routing
├── main.jsx               # Entry point (loads React)
├── index.css              # Global styles
│
├── components/            # Reusable UI components
│   ├── Navbar.jsx         # Navigation bar (header)
│   ├── Footer.jsx         # Footer
│   ├── SiteTagline.jsx    # Tagline display
│   ├── FloatingWhatsApp.jsx # WhatsApp chat widget
│   ├── PrivateRoute.jsx   # Protects routes (requires login)
│   ├── RoleRoute.jsx      # Protects routes (requires specific role)
│   ├── GoogleSignIn.jsx   # Google OAuth login
│   └── ... (other components)
│
├── pages/                 # Full page components
│   ├── Home.jsx           # Homepage
│   ├── About.jsx          # About Us
│   ├── Services.jsx       # Services (requires login)
│   ├── Projects.jsx       # Projects (requires employee/developer role)
│   ├── Blog.jsx           # Blog posts
│   ├── CaseStudies.jsx    # Case studies
│   ├── Contact.jsx        # Contact form
│   ├── Login.jsx          # Login page
│   ├── Signup.jsx         # Registration page
│   ├── ForgotPassword.jsx # Password reset
│   ├── Terms.jsx          # Terms of Service
│   ├── Privacy.jsx        # Privacy Policy
│   ├── AdminDashboard.jsx # Admin control panel
│   ├── AdminBlogEditor.jsx # Admin blog editor
│   ├── AdminCaseStudyEditor.jsx # Admin case study editor
│   ├── ApplicationForm.jsx # Housing application form
│   └── companies/         # Company-specific pages
│       ├── Dashboard.jsx          # Housing dashboard
│       ├── HousingLogin.jsx       # Housing login
│       └── BARAKA HOUSING AGENCY.jsx # Housing agency page
│
├── context/               # React Context (state management)
│   ├── AuthContext.jsx    # Authentication state
│   └── TaskContext.jsx    # Task management state
│
├── services/              # API calls
│   └── api.js            # Handles all backend API requests
│
├── utils/                 # Helper functions
│   └── fileUpload.js     # File upload utilities
│
└── data/                  # Static data
    └── companies.js      # Company information
```

---

## How to Run

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

```bash
# 1. Navigate to the project directory
cd "c:\Users\Lydia mwanza\Website-for-Greggory-Foundation-Ltd"

# 2. Install dependencies (one-time only)
npm install

# 3. Start the development server
npm run dev

# 4. Open browser and visit
# http://localhost:5173
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview the production build
npm run preview
```

---

## Frontend Architecture

### 1. **Entry Point** (`main.jsx`)
- Loads React and mounts the app to the `<div id="root">` element in `index.html`
- Wraps the entire app with necessary providers

### 2. **Main App Component** (`App.jsx`)
This is where the **magic happens**:

```jsx
// App.jsx structure:
1. AuthProvider wraps everything (provides authentication state)
2. Router enables page navigation
3. Layout component manages header/footer visibility
4. Routes define all available pages and their access rules
```

### 3. **Authentication Flow**
```
User visits site
    ↓
AuthContext checks localStorage for saved user
    ↓
User can access public pages (Home, About, Blog, etc.)
    ↓
If user clicks a protected route:
  - PrivateRoute: requires login
  - RoleRoute: requires specific role (employee, developer, etc.)
    ↓
User redirected to login if not authenticated
```

### 4. **Component Types**

#### **Reusable Components** (`/components`)
- Used across multiple pages
- Examples: Navbar, Footer, PrivateRoute, RoleRoute
- Contain shared UI logic

#### **Page Components** (`/pages`)
- Full-page displays
- Each connected to a route
- Can use reusable components inside them

#### **Layout Component**
- Wraps all pages with Navbar, Footer, etc.
- **Smart hiding**: Header/footer hidden on login/signup pages
- Manages main content area

---

## Key Components Explained

### **Navbar.jsx** (Navigation Bar)
- Shows at top of all pages (except login/signup)
- Contains menu links
- Shows login/logout button based on authentication state
- Has dropdown menu for companies
- Mobile-responsive

**Where it's used:** `App.jsx` wraps entire app with it

### **PrivateRoute.jsx** (Access Control)
Protects routes that require login:

```jsx
<Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
```

When user tries to access `/services`:
- If logged in → shows Services page ✓
- If not logged in → redirects to `/login` ✗

### **RoleRoute.jsx** (Role-Based Access)
Restricts access by user role:

```jsx
<Route path="/projects" element={
  <RoleRoute allowedRoles={["employee", "developer"]}>
    <Projects />
  </RoleRoute>
} />
```

Only users with `employee` or `developer` role can access this.

### **AuthContext.jsx** (User State)
Manages authentication across the app:

```jsx
// What it tracks:
- isAuthenticated: boolean (is user logged in?)
- user: { role, name, jobId, ... }

// What functions it provides:
- login()
- loginAsEmployee(jobId, name)
- loginAsDeveloper(profile)
- logout()
```

**Usage in any component:**
```jsx
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth()
  
  return (
    <div>
      {isAuthenticated && <p>Hello, {user.name}!</p>}
    </div>
  )
}
```

---

## Pages and Routing

| Route | Page | Public? | Notes |
|-------|------|---------|-------|
| `/` | Home | ✓ | Homepage |
| `/about` | About | ✓ | About the foundation |
| `/services` | Services | ✗ | Requires login (PrivateRoute) |
| `/projects` | Projects | ✗ | Requires employee/developer role |
| `/blog` | Blog | ✓ | Blog posts |
| `/case-studies` | Case Studies | ✓ | Success stories |
| `/contact` | Contact | ✓ | Contact form |
| `/login` | Login | ✓ | User login |
| `/signup` | Signup | ✓ | User registration |
| `/forgot-password` | Forgot Password | ✓ | Password reset |
| `/terms` | Terms | ✓ | Terms of service |
| `/privacy` | Privacy | ✓ | Privacy policy |
| `/admin` | Admin Dashboard | ✗ | Requires admin key |
| `/admin/blog/new` | Create Blog Post | ✗ | Admin only |
| `/admin/blog/:id` | Edit Blog Post | ✗ | Admin only |
| `/companies/housing` | BARAKA Housing | ✓ | Housing agency page |
| `/housing-management/login` | Housing Login | ✓ | Housing staff login |
| `/housing-management/dashboard` | Housing Dashboard | ✗ | Housing staff only |
| `/application-form` | Housing Application | ✓ | Rental application |

---

## Authentication System

### How It Works

1. **User Logs In**
   - User enters email/password on `/login`
   - Frontend sends to backend API
   - Backend validates and returns JWT token
   - Frontend stores user info in `localStorage`

2. **User Stays Logged In**
   - When page reloads, `AuthContext` checks `localStorage`
   - If user data found, user is automatically logged back in
   - No need to login again

3. **Protected Pages**
   - PrivateRoute checks `isAuthenticated`
   - RoleRoute checks `isAuthenticated` + user role
   - Unauthorized access → redirect to login

4. **User Logs Out**
   - Logout clears `localStorage`
   - User data cleared from context
   - Next page visit shows as logged out

### User Roles

```javascript
{
  role: "employee",     // Employee of foundation
  jobId: "EMP001",
  name: "John Doe"
}

{
  role: "developer",    // Developer/contractor
  name: "Jane Doe"
}

{
  role: "admin",        // Admin (manages content)
  // uses adminKey instead of traditional auth
}
```

---

## Styling (TailwindCSS)

### What is TailwindCSS?
A utility-first CSS framework. Instead of writing CSS files, you use pre-made classes:

```jsx
// Instead of this:
<div style={{ color: 'blue', padding: '16px' }}>
  Hello
</div>

// You write this:
<div className="text-blue-600 p-4">
  Hello
</div>
```

### Common Classes Used

```jsx
// Spacing
p-4        // padding: 1rem
m-4        // margin: 1rem
mb-8       // margin-bottom: 2rem

// Colors
text-blue-600      // text color
bg-white           // background color
border-gray-300    // border color

// Layout
flex              // display: flex
justify-center    // justify-content: center
items-center      // align-items: center
grid grid-cols-3  // 3-column grid

// Responsive
md:p-8            // padding: 2rem on medium screens and up
hidden md:block   // hidden by default, visible on md screens

// Typography
text-lg           // large text
font-bold         // bold text
text-center       // center-aligned text
```

### Customization

Edit [tailwind.config.js](tailwind.config.js) to:
- Change colors (brand colors: navy, teal, gold)
- Add custom fonts
- Modify breakpoints
- Extend utilities

---

## Adding New Pages

### Step 1: Create the Page File
Create `src/pages/MyNewPage.jsx`:

```jsx
export default function MyNewPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">My New Page</h1>
      <p>Content goes here</p>
    </div>
  )
}
```

### Step 2: Import and Add Route
Edit `src/App.jsx`:

```jsx
// 1. Add import at the top
import MyNewPage from './pages/MyNewPage'

// 2. Add route in the Routes section
<Route path="/my-new-page" element={<MyNewPage />} />
```

### Step 3: Add Navigation Link
Edit `src/components/Navbar.jsx` to add link to your page:

```jsx
const navigation = [
  { name: 'My New Page', path: '/my-new-page' },
  // ... other links
]
```

### Step 4: Test
- Visit `http://localhost:5173/my-new-page`
- Check that it loads correctly
- Check that navbar link works

---

## Common Tasks

### Task 1: Add a Login-Protected Page

```jsx
// In App.jsx
<Route 
  path="/protected-page" 
  element={
    <PrivateRoute>
      <ProtectedPage />
    </PrivateRoute>
  } 
/>
```

Now only logged-in users can see this page.

### Task 2: Display Different Content for Different Roles

```jsx
// In any component
import { useAuth } from '../context/AuthContext'

export default function MyComponent() {
  const { user } = useAuth()
  
  return (
    <div>
      {user?.role === 'employee' && <p>Employee only content</p>}
      {user?.role === 'developer' && <p>Developer only content</p>}
    </div>
  )
}
```

### Task 3: Call Backend API

```jsx
import { applicationsAPI } from '../services/api'

export default function Form() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const result = await applicationsAPI.create({
        name: 'John',
        email: 'john@example.com'
      })
      console.log('Success!', result)
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Task 4: Add Conditional Navbar Link

```jsx
// In Navbar.jsx
const navigation = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  isAuthenticated && { name: 'Dashboard', path: '/dashboard' },
  // ... other links
].filter(Boolean) // removes false values
```

---

## Troubleshooting

### Issue: "npm: command not found"
- **Solution**: Install Node.js from https://nodejs.org
- Verify: Open new terminal and run `node --version`

### Issue: "vite: command not found"
- **Solution**: Run `npm install` again in the project directory
- This installs vite locally for the project

### Issue: Page doesn't load (blank screen)
1. Check browser console for errors (F12)
2. Check terminal where `npm run dev` runs for errors
3. Verify the page is correctly imported in `App.jsx`
4. Verify route path matches exactly

### Issue: Styling looks broken (no colors)
- **Solution**: Check that Tailwind classes are typed correctly
- Common mistakes:
  - `px-4` not `padding-x-4`
  - `text-lg` not `text-large`
  - `bg-blue-500` not `bg-blue`

### Issue: "Cannot find module" error
- **Solution**: Check that file path is correct
- Use relative paths: `'../context/AuthContext'` not `'context/AuthContext'`
- Remember: `.jsx` extension usually included in import

### Issue: Component doesn't update after state change
- **Solution**: Use proper React patterns
- Call state setter to update: `setState(newValue)`
- Don't mutate state directly

### Issue: Login not working
- **Solution**: Backend API might not be running
- Make sure backend server is running (see BACKEND instructions)
- Check that API URL in `src/services/api.js` is correct

---

## File Editing Cheatsheet

### To add a new feature:

1. **Create component** → `src/components/NewComponent.jsx`
2. **Create page** → `src/pages/NewPage.jsx`
3. **Add route** → Edit `src/App.jsx`
4. **Add navigation** → Edit `src/components/Navbar.jsx`
5. **Add styling** → Use Tailwind classes
6. **Test** → Visit page in browser

### Important Files NOT to Edit (unless you know what you're doing):

- `vite.config.js` - Build configuration
- `package.json` - Dependencies (use npm install for changes)
- `tailwind.config.js` - Global style config
- `postcss.config.js` - CSS processing config
- `main.jsx` - App entry point

---

## Support & Resources

### Quick Links
- React docs: https://react.dev
- React Router: https://reactrouter.com
- TailwindCSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev

### Backend Integration
See `AUTHENTICATION_README.md` and `ADMIN_SETUP_SUMMARY.md` for API integration guides.

### Questions?
Check existing components and pages for examples of how to implement features.

---

**Last Updated**: January 2026
**Version**: 1.0.0
