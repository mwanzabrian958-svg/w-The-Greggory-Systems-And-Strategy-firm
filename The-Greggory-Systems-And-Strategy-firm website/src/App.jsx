import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import SiteTagline from './components/SiteTagline'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import PrivateRoute from './components/PrivateRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'

// Landing page stays eager: it's the most common entry point, so we avoid
// an extra network round-trip before first meaningful paint.
import Home from './pages/Home'

// All other routes are code-split: each page downloads only when visited,
// keeping the initial bundle small (the admin module alone was ~half the app).
const About = lazy(() => import('./pages/About'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'))
const Services = lazy(() => import('./pages/Services'))
const CaseStudies = lazy(() => import('./pages/CaseStudies'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogDetails = lazy(() => import('./pages/BlogDetails'))
const Contact = lazy(() => import('./pages/Contact'))
const Companies = lazy(() => import('./pages/Companies'))
const ClientPortal = lazy(() => import('./pages/ClientPortal'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const ClientPortal = lazy(() => import('./pages/ClientPortal'))
const Pricing = lazy(() => import('./pages/Pricing'))
const ClientReports = lazy(() => import('./pages/ClientReports'))
const ClientAlerts = lazy(() => import('./pages/ClientAlerts'))
const PersonnelProfile = lazy(() => import('./pages/PersonnelProfile'))
const ClientSearchResults = lazy(() =>
  import('./pages/ClientSearchResults').then((m) => ({ default: m.ClientSearchResults }))
)

// Admin Module (heavy) — split into its own chunk(s), loaded on demand.
// AdminRouter is a named export, so adapt it to the default shape React.lazy expects.
const AdminRouter = lazy(() =>
  import('./admin/AdminRouter').then((m) => ({ default: m.AdminRouter }))
)

// Minimal themed loading state shown while a route chunk is downloading.
function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite">
      <div className="h-10 w-10 rounded-full border-4 border-white/10 border-t-teal-500 animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

function Layout() {
  const location = useLocation()
  const authPages = ['/login', '/signup', '/forgot-password']
  const isAuthPage = authPages.includes(location.pathname)
  const isAdminPage = location.pathname.startsWith('/admin')
    const isClientPortal = location.pathname === '/client-portal' || location.pathname === '/client-reports' || location.pathname === '/client-alerts' || location.pathname === '/client-search' || location.pathname === '/personnel/profile' || location.pathname.startsWith('/personnel/') || location.pathname.startsWith('/projects')

  return (

    <div className="flex flex-col min-h-screen">

      {!isAuthPage && !isAdminPage && !isClientPortal && (
        <>
          <Navbar />
          <SiteTagline />
        </>
      )}

      <main className="flex-grow">

        <Suspense fallback={<PageFallback />}>
          <Routes>

          <Route path="/" element={<Home />} />

                              <Route path="/about" element={<About />} />

          <Route path="/personnel/:id" element={<PersonnelProfile />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/projects/:id" element={<ProjectDetails />} />

          <Route path="/services" element={<Services />} />

          <Route path="/case-studies" element={<CaseStudies />} />

          <Route path="/blog" element={<Blog />} />

          <Route path="/blog/:id" element={<BlogDetails />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/portal" element={<PrivateRoute><ClientPortal /></PrivateRoute>} />
          <Route path="/companies" element={<Companies />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/terms" element={<Terms />} />

          <Route path="/privacy" element={<Privacy />} />

          {/* Admin Routes - Using new modular admin system */}
          <Route path="/admin/*" element={
            <ErrorBoundary>
              <AdminRouter />
            </ErrorBoundary>
          } />

          <Route
            path="/client-portal"
            element={
              <PrivateRoute>
                <ErrorBoundary>
                  <ClientPortal />
                </ErrorBoundary>
              </PrivateRoute>
            }
          />

          <Route
            path="/client-reports"
            element={
              <PrivateRoute>
                <ErrorBoundary>
                  <ClientReports />
                </ErrorBoundary>
              </PrivateRoute>
            }
          />

          <Route
            path="/client-alerts"
            element={
              <PrivateRoute>
                <ErrorBoundary>
                  <ClientAlerts />
                </ErrorBoundary>
              </PrivateRoute>
            }
          />

          <Route
            path="/client-search"
            element={
              <PrivateRoute>
                <ErrorBoundary>
                  <ClientSearchResults />
                </ErrorBoundary>
              </PrivateRoute>
            }
          />

          <Route path="/pricing" element={<Pricing />} />

          </Routes>
        </Suspense>

      </main>

      {!isAuthPage && !isAdminPage && !isClientPortal && <Footer />}
      <FloatingWhatsApp />
    </div>

  )

}



function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}



export default App
