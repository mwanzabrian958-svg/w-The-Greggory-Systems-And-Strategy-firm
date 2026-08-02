import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react'
import SocialMediaIcons from '../components/SocialMediaIcons'
import { getApiUrl } from '../services/api'

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // 1. Backend Recording
      const response = await fetch(getApiUrl('/api/contact-forms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          subject: formData.service,
          message: formData.message
        })
      })

      if (!response.ok) throw new Error('Relay failure')

      // 2. Client-side Relay
      const subject = formData.service ? `${formData.service} Inquiry` : 'New Inquiry'
      const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0APhone: ${formData.phone}%0D%0ACompany: ${formData.company}%0D%0AService: ${formData.service}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(formData.message)}`
      const whatsappText = encodeURIComponent(`Hello, I'm ${formData.name}. Service: ${formData.service}. ${formData.message} (Email: ${formData.email}, Phone: ${formData.phone})`)

      if (preferredChannel === 'email') {
        window.location.href = `mailto:thegreggorysystemsandstrategyf@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`
      } else {
        window.open(`https://wa.me/254715312251?text=${whatsappText}`, '_blank')
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', company: '', phone: '', service: '', message: '' })
    } catch (err) {
      console.error('Submission error:', err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Us',
      content: 'thegreggorysystemsandstrategyf@gmail.com',
      link: 'mailto:thegreggorysystemsandstrategyf@gmail.com'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Us',
      content: '+254 715 312 251',
      link: 'tel:+254715312251'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'WhatsApp',
      content: '+254 715 312 251',
      link: 'https://wa.me/254715312251'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Visit Us',
      content: 'RAFIKI KABARAK, KABARAK',
      link: 'https://www.google.com/maps/search/?api=1&query=RAFIKI+KABARAK,+KABARAK'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Business Hours',
      content: 'Monday - Friday: 9:00 AM - 6:00 PM EAT',
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
    <div className="bg-white dark:bg-[#0f172a] transition-colors duration-500">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 sm:mb-6">Contact Us</h1>
            <p className="text-base sm:text-lg text-slate-300 uppercase tracking-widest leading-relaxed">
              Let's discuss how we can help you achieve your strategic goals through systemic innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight mb-6">Send Us a Message</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-10 font-medium uppercase tracking-wider">
                Fill out the form below and our strategic team will get back to you within 24 hours.
              </p>

              {submitStatus === 'success' && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 px-6 py-4 rounded-2xl mb-8 animate-in fade-in">
                  <p className="font-black text-sm uppercase tracking-widest">Transmission Successful</p>
                  <p className="text-xs mt-1 uppercase tracking-wider">Your briefing has been securely relayed to our operations hub.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 px-6 py-4 rounded-2xl mb-8 animate-in fade-in">
                  <p className="font-black text-sm uppercase tracking-widest">Relay Failed</p>
                  <p className="text-xs mt-1 uppercase tracking-wider">Network disruption detected. Please retry or use a direct channel.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-navy-900 dark:text-white text-sm font-bold uppercase tracking-widest transition-all"
                      placeholder="JOHN DOE"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-navy-900 dark:text-white text-sm font-bold uppercase tracking-widest transition-all"
                      placeholder="UPLINK@COMPANY.COM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-navy-900 dark:text-white text-sm font-bold uppercase tracking-widest transition-all"
                      placeholder="ORGANIZATION NAME"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-navy-900 dark:text-white text-sm font-bold uppercase tracking-widest transition-all"
                      placeholder="+254 715 312 251"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                    Service of Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-navy-900 dark:text-white text-sm font-bold uppercase tracking-widest appearance-none transition-all"
                  >
                    <option value="">SELECT PROTOCOL</option>
                    {services.map((service, index) => (
                      <option key={index} value={service} className="bg-white dark:bg-[#1e293b]">
                        {service.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('email')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${preferredChannel === 'email' ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-slate-950 border-navy-900 dark:border-gold-500' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('whatsapp')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${preferredChannel === 'whatsapp' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}
                  >
                    WhatsApp
                  </button>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none text-navy-900 dark:text-white text-sm font-bold uppercase tracking-widest transition-all"
                    placeholder="SPECIFY YOUR STRATEGIC GOALS..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-navy-900 dark:bg-gold-500 text-white dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-[0.4em] hover:bg-navy-800 dark:hover:bg-gold-400 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? 'TRANSMITTING...' : 'SEND'}
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight mb-6">Get in Touch</h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wider leading-relaxed">
                  We're here to answer your questions and discuss how we can support your organization's mission success.
                </p>
              </div>

              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-5 group">
                    <div className="bg-navy-50 dark:bg-white/5 p-4 rounded-2xl text-navy-900 dark:text-gold-500 border border-slate-100 dark:border-white/10 group-hover:bg-gold-500 group-hover:text-white dark:group-hover:text-slate-950 transition-all duration-300">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{info.title}</h3>
                      {info.link === '#' ? (
                        <p className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider">{info.content}</p>
                      ) : (
                        <a
                          href={info.link}
                          target={info.title === 'Visit Us' || info.title === 'WhatsApp' ? "_blank" : undefined}
                          rel={info.title === 'Visit Us' || info.title === 'WhatsApp' ? "noopener noreferrer" : undefined}
                          className="text-sm font-bold text-navy-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-500 transition-colors uppercase tracking-wider"
                        >
                          {info.content}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-[32px] p-8 border border-slate-100 dark:border-white/10 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">Neural Networks</h3>
                <div className="flex justify-center">
                  <SocialMediaIcons
                    iconSize={20}
                    hoverColor="hover:text-gold-600 dark:hover:text-gold-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
