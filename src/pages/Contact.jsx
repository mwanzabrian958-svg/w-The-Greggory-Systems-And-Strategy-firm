import { useState } from 'react'
import companies from '../data/companies'
import { Mail, Phone, MapPin, Send, Linkedin, Twitter, Facebook, Clock } from 'lucide-react'

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
      content: '+254799789956',
      link: 'tel:+254799789956'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'WhatsApp',
      content: '+254799789956',
      link: 'https://wa.me/254799789956'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Visit Us',
      content: 'rafiki kabarak, kabarak',
      link: '#'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Business Hours',
      content: 'Monday - Friday: 9:00 AM - 6:00 PM',
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
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-gray-300">
              Let's discuss how we can help you achieve your project management goals
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-6">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              {submitStatus === 'success' && (
                <div className="bg-teal-50 border border-teal-200 text-teal-800 px-6 py-4 rounded-lg mb-6">
                  <p className="font-semibold">Thank you for your message!</p>
                  <p className="text-sm">We'll get back to you as soon as possible.</p>
                  {successToken && (
                    <p className="mt-2 text-xs text-teal-700">
                      Reference: <span className="font-mono font-semibold">{successToken}</span>
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                      Company / Subsidiary
                    </label>
                    <select
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Select a company (optional)"
                    >
                      <option value="" disabled hidden>Select a company (optional)</option>
                      <option value="THE GREGGORY FOUNDATION LTD">THE GREGGORY FOUNDATION LTD</option>
                      <option value="BARAKA HOUSING AGENCY">BARAKA HOUSING AGENCY</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="+254799789956"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-semibold text-gray-700 mb-2">
                    Service of Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  <label htmlFor="channel" className="block text-sm font-semibold text-gray-700 mb-2">
                    Send Via
                  </label>
                  <select
                    id="channel"
                    name="channel"
                    value={preferredChannel}
                    onChange={(e) => setPreferredChannel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your project or how we can help..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-primary w-full justify-center ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Sending...' : preferredChannel === 'email' ? 'Send via Email' : 'Send via WhatsApp'}
                  <Send size={20} />
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                We're here to answer your questions and discuss how we can support your organization's success.
              </p>

              <div className="space-y-6 mb-12">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-teal-100 p-3 rounded-lg text-teal-600 flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-1">{info.title}</h3>
                      {info.link === '#' ? (
                        <p className="text-gray-600">{info.content}</p>
                      ) : (
                        <a 
                          href={info.link} 
                          className="text-gray-600 hover:text-teal-600 transition-colors"
                        >
                          {info.content}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-navy-900 mb-4">Connect With Us</h3>
                <div className="flex gap-4">
                  <a 
                    href="#" 
                    className="bg-white p-3 rounded-lg text-navy-900 hover:bg-teal-600 hover:text-white transition-colors shadow-md"
                  >
                    <Linkedin size={24} />
                  </a>
                  <a 
                    href="#" 
                    className="bg-white p-3 rounded-lg text-navy-900 hover:bg-teal-600 hover:text-white transition-colors shadow-md"
                  >
                    <Twitter size={24} />
                  </a>
                  <a 
                    href="https://www.facebook.com/profile.php?id=61583677166945" 
                    className="bg-white p-3 rounded-lg text-navy-900 hover:bg-teal-600 hover:text-white transition-colors shadow-md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook size={24} />
                  </a>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Work With Us?</h2>
            <p className="section-subtitle mx-auto mt-4">
              Partner with a team that's committed to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">98%</div>
              <div className="text-sm text-gray-600 mb-4">Project Success Rate</div>
              <p className="text-gray-600">
                Consistently delivering projects on time and within budget
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">24hrs</div>
              <div className="text-sm text-gray-600 mb-4">Response Time</div>
              <p className="text-gray-600">
                Quick turnaround on all inquiries and project requests
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">50+</div>
              <div className="text-sm text-gray-600 mb-4">Satisfied Clients</div>
              <p className="text-gray-600">
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
