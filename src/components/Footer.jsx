import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import BrandHeader from './BrandHeader'
import SocialMediaIcons from './SocialMediaIcons'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <Link to="/">
                <h2 className="text-2xl font-bold text-white">The Greggory Foundation</h2>
                <p className="text-teal-400 font-medium">Project Management Consultancy</p>
              </Link>
            </div>
            <p className="text-gray-300 mb-4">
              Strategic Project Development for all clients. Your Vision Delivered with Trust.
            </p>
            <SocialMediaIcons 
              className="text-gray-300" 
              hoverColor="hover:text-teal-400"
              iconSize={20}
            />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-teal-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/case-studies" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail size={18} className="text-teal-400 mt-1 flex-shrink-0" />
                <a href="mailto:brianmwanza651@gmail.com" className="text-gray-300 hover:text-teal-400 transition-colors">
                  brianmwanza651@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={18} className="text-teal-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">+254799789956</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="text-teal-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">rafiki kabarak<br />kabarak</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} THE GREGGORY FOUNDATION LTD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
