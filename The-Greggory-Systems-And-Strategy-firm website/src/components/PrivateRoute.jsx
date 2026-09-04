import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // A saved profile without a session token is NOT a logged-in session —
  // treat it as logged out and route to /login (protects the portal pages
  // from "Access Restricted" dead-ends when the token is missing/expired).
  if (!isAuthenticated || !user?.token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

export default PrivateRoute
