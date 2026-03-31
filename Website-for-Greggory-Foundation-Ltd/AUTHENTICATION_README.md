# Authentication System - The Greggory Foundation Ltd.

## Overview

A complete authentication system has been integrated into The Greggory Foundation website, featuring a modern, professional design inspired by industry-leading platforms.

## Features

### 🔐 Authentication Pages

1. **Login Page** (`/login`)
   - Email/phone number login support
   - Password field with show/hide toggle
   - Google OAuth integration (ready for backend)
   - "Forgot Password" link
   - "Sign up" link
   - Terms of Use and Privacy Policy acceptance

2. **Signup Page** (`/signup`)
   - Full name field
   - Email address field
   - Phone number field (optional)
   - Password field with visibility toggle
   - Confirm password field
   - Terms and conditions checkbox
   - Google OAuth signup option

3. **Forgot Password Page** (`/forgot-password`)
   - Email input for password reset
   - Success confirmation message
   - Easy navigation back to login

4. **Terms of Use Page** (`/terms`)
   - Comprehensive terms and conditions
   - Professional legal content

5. **Privacy Policy Page** (`/privacy`)
   - Detailed privacy policy
   - GDPR-compliant information

## Access Points

### From Navigation Bar
- **Login Button**: Blue button in top navigation (desktop and mobile)
- Directly accessible at `/login`

### Authentication Flow
```
1. Click "Login" in navbar → Login page
2. Need account? → Click "Sign up" → Signup page
3. Forgot password? → Click "Forgot password?" → Password reset
4. After reset → Back to login
```

## Design Features

### Professional Styling
- ✨ Clean, modern interface
- 🎨 Greggory Foundation branding (logo and colors)
- 📱 Fully responsive design
- 🔒 Security-focused UI elements
- 👁️ Password visibility toggles
- ✅ Form validation ready

### Brand Integration
- Company logo prominently displayed
- Golden phoenix branding
- "Your Vision Delivered with Trust" tagline
- Consistent color scheme (blue accents for CTAs)

## Implementation Details

### Routes
```javascript
/login              → Login page
/signup             → Signup page
/forgot-password    → Password reset
/terms              → Terms of Use
/privacy            → Privacy Policy
```

### Layout Behavior
- Authentication pages **do NOT show** navbar/footer
- Clean, focused user experience
- Main site pages retain full navigation

## Backend Integration (Next Steps)

### To make the authentication functional:

1. **Set up backend API endpoints:**
   ```
   POST /api/auth/login
   POST /api/auth/signup
   POST /api/auth/forgot-password
   POST /api/auth/google-oauth
   ```

2. **Update form handlers in:**
   - `src/pages/Login.jsx` → `handleSubmit()` function
   - `src/pages/Signup.jsx` → `handleSubmit()` function
   - `src/pages/ForgotPassword.jsx` → `handleSubmit()` function

3. **Add authentication state management:**
   - Install: `npm install react-context-api` or use Redux
   - Create AuthContext for global auth state
   - Store JWT tokens securely

4. **Configure Google OAuth:**
   - Create Google Cloud project
   - Get OAuth 2.0 credentials
   - Configure redirect URIs
   - Update `handleGoogleLogin()` functions

5. **Add protected routes:**
   - Create PrivateRoute component
   - Wrap protected pages with authentication check
   - Redirect unauthenticated users to login

## Features Ready for Backend

### Login Page
```javascript
// Current frontend implementation
const handleSubmit = async (e) => {
  e.preventDefault()
  // Replace with actual API call:
  // const response = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(formData)
  // })
}
```

### Form Data Structure
```javascript
// Login
{
  email: string,
  password: string
}

// Signup
{
  fullName: string,
  email: string,
  phone: string (optional),
  password: string,
  confirmPassword: string
}

// Forgot Password
{
  email: string
}
```

## Security Features

- ✅ Password visibility toggle
- ✅ Form validation (client-side ready)
- ✅ Terms acceptance required for signup
- ✅ Secure password input fields
- ✅ HTTPS-ready design
- ⏳ JWT token storage (backend needed)
- ⏳ Session management (backend needed)
- ⏳ Password hashing (backend needed)

## Testing the System

### To test locally:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Login" button in navbar

4. Test the authentication flow:
   - Fill in login form
   - Click "Sign up" link
   - Test "Forgot password" flow
   - Review Terms and Privacy pages

## Customization

### To customize colors:
Edit `tailwind.config.js` and `src/pages/Login.jsx`

### To change logo:
Replace `/favicon.png` with your logo file

### To modify form fields:
Edit respective page files in `src/pages/`

## File Structure

```
src/
├── pages/
│   ├── Login.jsx           # Login page
│   ├── Signup.jsx          # Signup page
│   ├── ForgotPassword.jsx  # Password reset
│   ├── Terms.jsx           # Terms of Use
│   └── Privacy.jsx         # Privacy Policy
├── components/
│   └── Navbar.jsx          # Updated with Login button
└── App.jsx                 # Routes configuration
```

## Support

For questions or assistance with backend integration, contact:
- Email: info@greggoryfoundation.com
- Phone: +1 (555) 123-4567

---

**Note**: The authentication system is currently frontend-only. Backend API integration is required for full functionality.
