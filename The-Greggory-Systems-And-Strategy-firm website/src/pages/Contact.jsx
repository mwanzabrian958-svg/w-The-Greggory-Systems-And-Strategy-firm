import { useState } from 'react'
import { Clock, Mail, MapPin, Phone, Send, MessageCircle, Globe } from 'lucide-react'
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

      const subject = formData.service ? `${formData.service} Inquiry` : 'New Inquiry'
      const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0APhone: ${formData.phone}%0D%0ACompany: ${formData.company}%0D%0AService: ${formData.service}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(formData.message)}`
      const whatsappText = encodeURIComponent(`Hello, I'm ${formData.name}. Service: ${formData.service}. ${formData.message} (Email: ${formData.email}, Phone: ${formData.phone})`)

      if (preferredChannel === 'email') {
        window.location.href = `mailto:thegreggorysystemsandstrategyf@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`
      } else {
        window.open(`https://wa.me/254115525854?text=${whatsappText}`, '_blank')
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
      icon: <Mail className="h-5 w-5" />,
      title: 'Email',
      content: 'thegreggorysystemsandstrategyf@gmail.com',
      link: 'mailto:thegreggorysystemsandstrategyf@gmail.com'
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: 'Call',
      content: '+254 115 525 854',
      link: 'tel:+254115525854'
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: 'WhatsApp',
      content: '+254 115 525 854',
      link: 'https://wa.me/254115525854'
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: 'Visit',
      content: 'Rafiki Kabarak, Kabarak',
      link: 'https://www.google.com/maps/search/?api=1&query=RAFIKI+KABARAK,+KABARAK'
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Hours',
      content: 'Mon - Fri · 9:00 AM - 6:00 PM EAT'
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
    <div className="page-shell pt-16">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="soft-panel overflow-hidden">
          <div className="grid gap-0">
            <div className="bg-[#f8efe6] p-5 sm:p-6 lg:p-8 dark:bg-[#171d19]">
              <div className="mb-6">
                <p className="eyebrow">Send a message</p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  We'll reply with a practical next step.
                </h2>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-100">
                  Whether you want a proposal, a system review, or a quick strategy conversation, we can help you get started.
                </p>
              </div>

              {submitStatus === 'success' && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                  Your message has been prepared successfully.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                  We could not relay this request right now. Please try again or reach us directly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Full Name *</label>
                    <input id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-xl border border-[#e3d2bb] bg-white px-3 py-2 text-xs text-slate-900 outline-none transition-all duration-200 focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Email Address *</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full rounded-xl border border-[#e3d2bb] bg-white px-3 py-2 text-xs text-slate-900 outline-none transition-all duration-200 focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="you@company.com" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="company" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Company</label>
                    <input id="company" name="company" value={formData.company} onChange={handleChange} className="w-full rounded-xl border border-[#e3d2bb] bg-white px-3 py-2 text-xs text-slate-900 outline-none transition-all duration-200 focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="Organization name" />
                  </div>
                  <div>
                    <label htmlFor="phone" name="phone" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Phone Number</label>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border border-[#e3d2bb] bg-white px-3 py-2 text-xs text-slate-900 outline-none transition-all duration-200 focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="+254 700 000 000" />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Service of interest</label>
                  <select id="service" name="service" value={formData.service} onChange={handleChange} className="w-full rounded-xl border border-[#e3d2bb] bg-white px-3 py-2 text-xs text-slate-900 outline-none transition-all duration-200 focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => setPreferredChannel('email')} className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${preferredChannel === 'email' ? 'border-[#4c6a4d] bg-[#4c6a4d] text-white shadow-md shadow-[#4c6a4d]/20' : 'border-[#e3d2bb] bg-white text-slate-700 hover:border-[#4c6a4d] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>
                    Email reply
                  </button>
                  <button type="button" onClick={() => setPreferredChannel('whatsapp')} className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${preferredChannel === 'whatsapp' ? 'border-[#aa7d3f] bg-[#aa7d3f] text-white shadow-md shadow-[#aa7d3f]/20' : 'border-[#e3d2bb] bg-white text-slate-700 hover:border-[#aa7d3f] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>
                    WhatsApp reply
                  </button>
                </div>

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Message *</label>
                  <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleChange} required className="w-full rounded-xl border border-[#e3d2bb] bg-white px-3 py-2 text-xs text-slate-900 outline-none transition-all duration-200 focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="Tell us what you want to improve or build." />
                </div>

                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-[#223028] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#2f3f33] hover:-translate-y-0.5 disabled:opacity-70">
                  <Send className="h-3.5 w-3.5" />
                  {isSubmitting ? 'Sending...' : 'Send message'}
                </button>
              </form>
            </div>

            <div className="relative bg-[#223028] p-6 sm:p-8 lg:p-8 text-white">
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#aa7d3f]/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#8fb28a]/10 blur-3xl" />
              
              <div className="relative z-10">
                <p className="eyebrow text-[#8fb28a]">Contact us</p>
                <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                  Let's talk about your next move.
                </h1>
                <p className="mt-3 max-w-xl text-xs text-slate-100 sm:text-sm">
                  Share a few details and we'll follow up with the right next step for your organization.
                </p>

                <div className="mt-6 space-y-2">
                  {contactInfo.map((item) => (
                    item.link ? (
                      <a key={item.title} href={item.link} className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-[#aa7d3f]/40 hover:bg-white/10">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#aa7d3f]/15 text-[#aa7d3f] transition-transform duration-300 group-hover:scale-110">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#aa7d3f]">{item.title}</p>
                          <p className="mt-0.5 text-xs text-slate-100">{item.content}</p>
                        </div>
                      </a>
                    ) : (
                      <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#aa7d3f]/15 text-[#aa7d3f]">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#aa7d3f]">{item.title}</p>
                          <p className="mt-0.5 text-xs text-slate-100">{item.content}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#aa7d3f]" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#aa7d3f]">Coverage</p>
                      <p className="mt-0.5 text-xs text-slate-100">Kenya & East Africa</p>
                    </div>
                  </div>
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
