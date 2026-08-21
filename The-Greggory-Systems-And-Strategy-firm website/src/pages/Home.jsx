import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Lightbulb, CheckCircle, TrendingUp, Users, Award, AlertTriangle, Clock, ShieldCheck, Scale, Globe, UserCheck, Lock, AlertCircle, Mail, FileText, Shield } from 'lucide-react'
import { SITE_NAME, SITE_MOTTO } from '../constants/siteBrand'

const Home = () => {
  const videoRef = useRef(null)

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 43) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {})
          } else {
            videoRef.current?.pause()
          }
        })
      },
      { threshold: 0.5 }
    )
    if (videoRef.current) observer.observe(videoRef.current)
    return () => { if (videoRef.current) observer.unobserve(videoRef.current) }
  }, [])

  const services = [
    {
      icon: <Target className="w-12 h-12 text-gold-600" />,
      title: 'Systems Design',
      description: 'Designing robust architectural frameworks that turn complex organizational challenges into clear, actionable roadmaps.',
      link: '/services#design'
    },
    {
      icon: <Lightbulb className="w-12 h-12 text-gold-600" />,
      title: 'Strategic Creation',
      description: 'Building and implementing integrated solutions with precision, creating the practical tools your business needs to excel.',
      link: '/services#creation'
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-gold-600" />,
      title: 'Continuous Maintenance',
      description: 'Maintaining and optimizing your systems over time, ensuring clear strategies continue to build lasting confidence.',
      link: '/services#maintenance'
    }
  ]

  const stats = [
    { icon: <TrendingUp className="w-10 h-10" />, value: '150+', label: 'Projects Delivered' },
    { icon: <Users className="w-10 h-10" />, value: '50+', label: 'Happy Clients' },
    { icon: <Award className="w-10 h-10" />, value: '98%', label: 'Success Rate' }
  ]

  return (
    <div className="relative bg-[#050b14] transition-colors duration-500 overflow-x-hidden">

      {/* ── SUPREME PHOENIX HERO PAGE ── */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">

        {/* Total Integration Layer (Background) */}
        <div className="absolute inset-0 z-0 bg-[#050b14]">
          {/* THE SOLE PHOENIX IDENTITY - RESTORED TO 4:00 PM STATE */}
          <img
            src="/hero-phoenix.jpg"
            alt="The Golden Phoenix"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-[5s] hover:scale-105"
          />

          {/* Neural Atmospheric Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(234,179,8,0.25),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(13,148,136,0.1),_transparent_70%)]" />

          {/* Tactical Carbon Matrix overlay */}
          <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
               style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
        </div>

        {/* ── COMMAND OVERLAY (EMPTY FOR ABSOLUTE PHOENIX DOMINANCE) ── */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
           {/* Foreground duplicate removed per command */}
        </div>

        {/* Neural Signal Entry Point - Pure Visual */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 animate-bounce opacity-20">
           <div className="h-14 w-0.5 bg-gradient-to-b from-gold-500 to-transparent rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
        </div>

      </section>

      {/* Introduction Section - Compacted & Improved */}
      <section className="py-12 bg-white dark:bg-[#0f172a] border-y border-slate-200 dark:border-white/5 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Empowering Your Success</h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl mx-auto">
            At <span className="text-slate-900 dark:text-white font-bold">{SITE_NAME}</span>, we transform complex organizational challenges into sustainable competitive advantage through proven strategic frameworks and robust systems design.
          </p>
        </div>
      </section>

      {/* Services Overview - Modern & Compact */}
      <section className="py-16 bg-slate-50 dark:bg-[#050b14] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Our Core Services</h2>
            <div className="h-1 w-16 bg-gold-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="group p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-2xl hover:shadow-slate-200 dark:hover:shadow-none transition-all duration-300">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{service.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{service.description}</p>
                <Link to={service.link} className="text-gold-600 dark:text-gold-500 text-sm font-black hover:text-gold-700 dark:hover:text-gold-400 inline-flex items-center gap-2 uppercase tracking-wider">
                  Learn More
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section - Compacted */}
      <section className="py-12 sm:py-16 bg-slate-100 dark:bg-[#050b14] text-slate-900 dark:text-white relative transition-colors overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />

        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Featured Insight</h2>
            <div className="h-1 w-20 bg-gold-500 mx-auto mb-6 rounded-full" />
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-light">
              Discover our vision and methodologies through our featured strategic content.
            </p>
          </div>

          <div className="relative group max-w-5xl mx-auto px-4 sm:px-10 lg:px-20">
            {/* The Stylized Frame (Enclosure) */}
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[60px] border-2 border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_0_100px_rgba(0,0,0,0.5)] transform -rotate-2 scale-[1.02]" />

            <div className="relative z-10 bg-white dark:bg-[#0f172a] rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-100 dark:border-white/10 p-2 sm:p-4 lg:p-6 transition-all duration-500 hover:rotate-0 transform rotate-1">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-auto rounded-[30px] shadow-inner"
                  controls
                  loop
                  playsInline
                  poster="/video-placeholder.jpg"
                  onTimeUpdate={handleVideoTimeUpdate}
                >
                  <source src="/featured-insight.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Branding Overlay (Fully covers Animaker watermark at all times) */}
                <div className="absolute bottom-0 right-0 z-50 pointer-events-none p-2 sm:p-4">
                  <div className="bg-white p-1 sm:p-2 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.4)] border-2 border-white/50">
                    <img
                      src="/score-1.jpg"
                      alt="Brand Label"
                      className="h-12 sm:h-20 w-auto rounded-lg object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Accent elements to enhance the frame look */}
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-gold-500/10 blur-3xl -z-0" />
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl -z-0" />
          </div>
        </div>
      </section>

      {/* Terms of Use Section - Formal Legal Order */}
      <section className="py-16 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-4xl mx-auto">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-gold-600 dark:text-gold-500 mb-3">Terms of Use</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">A formal framework for working together</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              These Terms of Use govern the use of our services, systems, digital resources, and strategic engagement framework between The-Greggory-Systems-And-Strategy-firm and the parties using our solutions.
            </p>
          </div>

          <div className="space-y-8 max-w-3xl mx-auto">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="text-2xl font-black text-gold-600 dark:text-gold-500">1.</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Acceptance of Terms</h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-7 ml-8">
                By accessing or using the services, systems, content, reports, or materials made available by The-Greggory-Systems-And-Strategy-firm, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. Continued use of our platform or professional services after changes have been published constitutes your acceptance of the updated terms.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="text-2xl font-black text-gold-600 dark:text-gold-500">2.</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Scope of Services</h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-7 ml-8">
                The firm provides strategic systems design, implementation support, operational oversight, and related advisory services according to the agreed scope of work, service timetable, communication channels, and responsibilities defined between the parties. We reserve the right to pause or discontinue services when work exceeds the agreed scope, fails to meet project standards, or conflicts with the agreed terms of engagement.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="text-2xl font-black text-gold-600 dark:text-gold-500">3.</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Accounts and Authorized Access</h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-7 ml-8">
                Access to our services and administrative systems is limited to authorized users only. Each user is responsible for maintaining the security of their credentials, using the platform only for approved purposes, and ensuring that all access and activity associated with their account remains compliant with these terms and all applicable operational policies.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="text-2xl font-black text-gold-600 dark:text-gold-500">4.</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Confidentiality and Data Protection</h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-7 ml-8">
                All information exchanged through our client engagements, platforms, and support channels shall be treated as confidential unless otherwise explicitly agreed in writing. This includes proprietary business information, operational data, personal information, and any materials disclosed in the course of the engagement. The firm will handle such information with appropriate discretion and in accordance with applicable legal and professional obligations.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="text-2xl font-black text-gold-600 dark:text-gold-500">5.</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Intellectual Property</h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-7 ml-8">
                All proprietary systems, frameworks, strategy documents, designs, methods, reports, and digital materials created by The-Greggory-Systems-And-Strategy-firm remain the property of the firm unless a separate written agreement expressly transfers ownership. No party may redistribute, resell, copy, repurpose, or reverse-engineer such materials without prior written permission.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="text-2xl font-black text-gold-600 dark:text-gold-500">6.</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Limitation of Liability</h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-7 ml-8">
                The firm endeavors to provide reliable, professional, and high-quality services; however, it shall not be liable for indirect, incidental, consequential, or special damages arising from service delays, third-party changes, unforeseen operational disruptions, external market conditions, or force majeure events outside its reasonable control. This includes losses related to business interruption, operational delay, loss of data, or missed opportunity, to the extent permitted by applicable law.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="text-2xl font-black text-gold-600 dark:text-gold-500">7.</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Termination and Enforcement</h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-7 ml-8">
                The firm may suspend or terminate access to services, platforms, or project materials where misuse, policy violations, operational risk, or non-compliance with agreed responsibilities are identified. In circumstances requiring immediate action, access may be withdrawn without prior notice in order to protect the integrity of the system, the security of client information, or the continued delivery of services.
              </p>
            </div>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-7">
              These terms are intended to preserve the integrity of the professional relationship, protect confidential information, and define the lawful basis upon which services and access are provided. For the full legal framework and any additional detail, please refer to the complete Terms of Use page.
            </p>
          </div>

          <div className="mt-12 text-center">
            <Link to="/terms" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-gold-500/20 hover:bg-gold-400 transition-all">
              Read Full Terms of Use
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Sleek & High Impact */}
      <section className="py-10 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-y border-slate-100 dark:border-white/5 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-gold-600 dark:text-gold-500 mb-1">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section - Compact Quote */}
      <section className="py-16 bg-slate-50 dark:bg-[#050b14] relative overflow-hidden transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <svg className="w-10 h-10 text-gold-500/20 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-lg sm:text-xl text-slate-800 dark:text-slate-100 font-medium mb-6 italic leading-relaxed transition-colors">
            "At {SITE_NAME}, we are committed to handle projects by designing, creating, and maintaining them. We transform complex organizational challenges into practical systems and clear strategies that build lasting confidence."
          </blockquote>
          <div className="flex flex-col items-center">
            <div className="h-px w-12 bg-gold-500 mb-4" />
            <div className="font-black text-slate-900 dark:text-white text-base uppercase tracking-wider transition-colors">Brian Mwanza</div>
            <div className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">CEO, {SITE_NAME}</div>
          </div>
        </div>
      </section>

      {/* CTA Section - Unified Dark Theme */}
      <section className="py-12 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0f172a] dark:to-[#1e293b] text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/5 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">
            Ready to Manage Your Success?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto transition-colors">
            Let's discuss how we can turn your vision into reality through strategic systems management.
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center gap-3 rounded-xl bg-gold-500 px-8 py-4 text-sm font-black text-slate-950 shadow-xl shadow-gold-500/20 hover:bg-gold-400 hover:scale-105 transition-all active:scale-95">
            Get in Touch
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
