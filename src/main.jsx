import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Clear all authentication tokens on page load/refresh
// This forces users to re-login after refreshing the page
try {
  localStorage.removeItem('tgf_user')
  localStorage.removeItem('gf_admin_token')
  localStorage.removeItem('admin_authenticated')
  localStorage.removeItem('admin_code_validated')
  localStorage.removeItem('admin_user')
  localStorage.removeItem('admin_session')
  sessionStorage.removeItem('gf_admin_session_token')
  sessionStorage.removeItem('gf_admin_token')
  sessionStorage.removeItem('admin_authenticated')
  sessionStorage.removeItem('admin_code_validated')
  sessionStorage.removeItem('admin_user')
  sessionStorage.removeItem('admin_session')
} catch (e) {
  /* ignore storage errors */
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
