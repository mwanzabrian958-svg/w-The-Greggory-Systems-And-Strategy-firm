import { useState } from 'react'
import companies from '../data/companies'
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react'
import SocialMediaIcons from '../components/SocialMediaIcons'
import { X } from 'lucide-react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [preferredChannel, setPreferredChannel] = useState('email')
  const [successToken, setSuccessToken] = useState('')
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const generateToken = () => {
    const pad = (n) => n.toString().padStart(2, '0')
    const d = new Date()
    const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    return `TGF-${date}-${rand}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const subject = formData.service ? `${formData.service} Inquiry` : 'New Inquiry'
    const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0APhone: ${formData.phone}%0D%0ACompany: ${formData.company}%0D%0AService: ${formData.service}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(formData.message)}`
    const whatsappText = encodeURIComponent(`Hello, I'm ${formData.name}. Service: ${formData.service}. ${formData.message} (Email: ${formData.email}, Phone: ${formData.phone}, Company: ${formData.company})`)
    if (preferredChannel === 'email') {
      window.location.href = `mailto:brianmwanza651@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`
    } else {
      window.open(`https://wa.me/254799789956?text=${whatsappText}`, '_blank')
    }
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setSuccessToken(generateToken())
      setFormData({ name: '', email: '', company: '', phone: '', service: '', message: '' })
      setTimeout(() => { setSubmitStatus(null); setSuccessToken('') }, 5000)
    }, 800)
  }

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Us',
      content: 'brianmwanza651@gmail.com',
      link: 'mailto:brianmwanza651@gmail.com'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Us',
      content: '+254 799 789 956',
      link: 'tel:+254799789956'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'WhatsApp',
      content: '+254 799 789 956',
      link: 'https://wa.me/254799789956'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Visit Us',
      content: 'Rafiki Kabarak, Kabarak, Kenya',
      link: '#'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Business Hours',
      content: 'Monday - Friday: 9:00 AM - 6:00 PM EAT',
      link: '#'
    },
    {
      icon: (
        <div>
          <SocialMediaIcons 
            className="text-navy-700" 
            hoverColor="hover:text-teal-500"
            iconSize={20}
          />
        </div>
      ),
      title: 'Connect With Us',
      content: 'Follow us on social media',
      link: '#'
    }
  ]

  const services = [
    'Business Management',
    'Innovation & Improvement',
    'Comprehensive Solutions',
    'Project Proposal Composition',
    'System Creation (Apps to Websites)',
    'PMO Setup',
    'Agile/Scrum Coaching',
    'Other'
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-12 sm:py-16 md:py-20">
        <div className="w-full pl-0 pr-4 sm:px-6 lg:px-8">
          <div className="max-w-full sm:max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Contact Us</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300">
              Let's discuss how we can help you achieve your project management goals
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="w-full pl-0 pr-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4 sm:mb-6">Send Us a Message</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              {submitStatus === 'success' && (
                <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 sm:px-6 py-3 sm:py-4 rounded-lg mb-4 sm:mb-6">
                  <p className="font-semibold text-sm sm:text-base">Thank you for your message!</p>
                  <p className="text-xs sm:text-sm">We'll get back to you as soon as possible.</p>
                  {successToken && (
                    <p className="mt-2 text-xs text-teal-700">
                      Reference: <span className="font-mono font-semibold">{successToken}</span>
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="company" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Company / Subsidiary
                    </label>
                    <select
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Select a company (optional)"
                    >
                      <option value="" disabled hidden>Select a company (optional)</option>
                      <option value="THE GREGGORY FOUNDATION LTD">THE GREGGORY FOUNDATION LTD</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="+254799789956"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Service of Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="">Select a service</option>
                    {services.map((service, index) => (
                      <option key={index} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="channel" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Send Via
                  </label>
                  <select
                    id="channel"
                    name="channel"
                    value={preferredChannel}
                    onChange={(e) => setPreferredChannel(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4 sm:rows-6"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm sm:text-base"
                    placeholder="Tell us about your project or how we can help..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-primary w-full justify-center text-sm sm:text-base py-2 sm:py-3 px-6 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Sending...' : preferredChannel === 'email' ? 'Send via Email' : 'Send via WhatsApp'}
                  <Send size={16} className="sm:size-20" />
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4 sm:mb-6">Get in Touch</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                We're here to answer your questions and discuss how we can support your organization's success.
              </p>

              <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-teal-100 p-2 sm:p-3 rounded-lg text-teal-600 flex-shrink-0">
                      <div className="w-4 h-4 sm:w-6 sm:h-6">{info.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-1 text-sm sm:text-base">{info.title}</h3>
                      {info.link === '#' ? (
                        <p className="text-xs sm:text-sm text-gray-600">{info.content}</p>
                      ) : (
                        <a 
                          href={info.link} 
                          className="text-xs sm:text-sm text-gray-600 hover:text-teal-600 transition-colors"
                        >
                          {info.content}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="font-semibold text-navy-900 mb-3 sm:mb-4 text-sm sm:text-base">Connect With Us</h3>
                <div className="flex gap-3 sm:gap-4">
                  <SocialMediaIcons 
                    className="bg-white p-2 sm:p-3 rounded-lg text-navy-900 hover:bg-teal-600 hover:text-white transition-colors shadow-md"
                    iconSize={16}
                    hoverColor="hover:text-white"
                  />
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-6 sm:mt-8 bg-gray-200 rounded-lg h-48 sm:h-64 flex items-center justify-center">
                <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="w-full pl-0 pr-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl">Why Work With Us?</h2>
            <p className="section-subtitle mx-auto mt-4 text-sm sm:text-base md:text-lg px-2 sm:px-0">
              Partner with a team that's committed to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-teal-600 mb-1 sm:mb-2">98%</div>
              <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Project Success Rate</div>
              <p className="text-xs sm:text-sm text-gray-600">
                Consistently delivering projects on time and within budget
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-teal-600 mb-1 sm:mb-2">24hrs</div>
              <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Response Time</div>
              <p className="text-xs sm:text-sm text-gray-600">
                Quick turnaround on all inquiries and project requests
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-teal-600 mb-1 sm:mb-2">50+</div>
              <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Satisfied Clients</div>
              <p className="text-xs sm:text-sm text-gray-600">
                Building long-term partnerships across diverse industries
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
