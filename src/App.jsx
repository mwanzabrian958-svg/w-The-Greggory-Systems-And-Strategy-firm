import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import SiteTagline from './components/SiteTagline'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import PrivateRoute from './components/PrivateRoute'
import { AuthProvider } from './context/AuthContext'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import Services from './pages/Services'
import CaseStudies from './pages/CaseStudies'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import ApplicationForm from './pages/ApplicationForm'
import Properties from './pages/Properties'
import Companies from './pages/Companies'
import Applications from './pages/Applications'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import ClientPortal from './pages/ClientPortal'
import Pricing from './pages/Pricing'

// Admin Module
import { AdminRouter } from './admin/AdminRouter'
import { Developer } from './admin/pages/Developer'



function Layout() {
  const location = useLocation()
  const authPages = ['/login', '/signup', '/forgot-password']
  const isAuthPage = authPages.includes(location.pathname)
  const isAdminPage = location.pathname.startsWith('/admin')
  const isDeveloperPage = location.pathname === '/developer'



  return (

    <div className="flex flex-col min-h-screen">

      {!isAuthPage && !isAdminPage && !isDeveloperPage && (
        <>
          <Navbar />
          <SiteTagline />
        </>
      )}

      <main className="flex-grow">

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/projects/:id" element={<ProjectDetails />} />

          <Route

            path="/services"

            element={

              <PrivateRoute>

                <Services />

              </PrivateRoute>

            }

          />

          <Route path="/case-studies" element={<CaseStudies />} />

          <Route path="/blog" element={<Blog />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/properties" element={<Properties />} />

          <Route path="/companies" element={<Companies />} />

          <Route path="/applications" element={<Applications />} />

          <Route path="/application-form" element={<ApplicationForm />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/terms" element={<Terms />} />

          <Route path="/privacy" element={<Privacy />} />

          {/* Admin Routes - Using new modular admin system */}
          <Route path="/admin/*" element={<AdminRouter />} />

          {/* Developer Platform - Standalone page */}
          <Route path="/developer" element={<Developer />} />

          <Route 
            path="/client-portal" 
            element={
              <PrivateRoute>
                <ClientPortal />
              </PrivateRoute>
            } 
          />

          <Route path="/pricing" element={<Pricing />} />

        </Routes>

      </main>

      {!isAuthPage && !isAdminPage && !isDeveloperPage && <Footer />}
      {!isAdminPage && !isDeveloperPage && <FloatingWhatsApp />}
    </div>

  )

}



function App() {

  return (

    <AuthProvider>

      <Router>

        <Layout />

      </Router>

    </AuthProvider>

  )

}



export default App

