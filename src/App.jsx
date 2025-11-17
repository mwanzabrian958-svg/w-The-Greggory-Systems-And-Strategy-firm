import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import SiteTagline from './components/SiteTagline'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import PrivateRoute from './components/PrivateRoute'
import RoleRoute from './components/RoleRoute'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Services from './pages/Services'
import CaseStudies from './pages/CaseStudies'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import HousingAgency from './pages/companies/BARAKA HOUSING AGENCY'
import ApplicationForm from './pages/ApplicationForm'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

function Layout() {
  const location = useLocation()
  const authPages = ['/login', '/signup', '/forgot-password']
  const isAuthPage = authPages.includes(location.pathname)

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && (
        <>
          <Navbar />
          <SiteTagline />
        </>
      )}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/projects"
            element={
              <RoleRoute allowedRoles={["employee", "developer"]}>
                <Projects />
              </RoleRoute>
            }
          />
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
          <Route path="/companies/housing" element={<HousingAgency />} />
          <Route path="/application-form" element={<ApplicationForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
      <FloatingWhatsApp />
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
