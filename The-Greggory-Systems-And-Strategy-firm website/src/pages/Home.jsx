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

      {/* ── SUPREME TERMS OF USE FRAMEWORK (FORMAL GSS PROTOCOL) ── */}
      <section className="py-24 bg-white dark:bg-[#050b14] relative transition-colors border-y border-slate-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">

          <div className="mb-16 border-l-4 border-gold-500 pl-8">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Terms of Use</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium uppercase tracking-[0.2em]">The Greggory Systems & Strategy Group — Internal Management System</p>
          </div>

          <div className="space-y-16 text-slate-600 dark:text-slate-300">

            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed font-medium italic mb-10">
                These Terms of Use ("Terms") govern access to and use of the internal management system operated by The Greggory Systems & Strategy Group ("the Company," "we," "us," or "our"), including all associated modules, dashboards, data, and administrative tools (collectively, the "System"). By accessing or using the System, you ("User," "you," or "your") agree to be bound by these Terms in full.
              </p>

              <div className="space-y-12">
                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">01.</span> Definitions
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li><strong>"System"</strong> means the internal management platform described in these Terms, including all modules, dashboards, databases, and administrative tools operated by the Company.</li>
                    <li><strong>"User"</strong> means any individual granted access to the System, including employees, contractors, and other authorized personnel.</li>
                    <li><strong>"General Admin Account"</strong> means the master administrative account with full authority to manage users, departments, and System-wide data.</li>
                    <li><strong>"Confidential Information"</strong> means any non-public information accessible through the System, including client records, financial data, personnel records, and internal communications.</li>
                    <li><strong>"Company Policy"</strong> means any related internal policy referenced in or supplementing these Terms, including data protection, security, and acceptable use policies.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">02.</span> Acceptance of Terms
                  </h3>
                  <p className="leading-relaxed font-medium">
                    Access to the System is granted solely to authorized personnel, contractors, and other individuals expressly approved by the Company. By logging into or otherwise using the System, you confirm that you have read, understood, and agree to comply with these Terms, along with any related policies referenced herein (including data protection, acceptable use, and security policies).
                  </p>
                  <p className="mt-4 leading-relaxed font-medium">
                    If you do not agree to these Terms, you must not access or use the System. Continued use of the System following any update to these Terms constitutes acceptance of the revised Terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">03.</span> Description of the System
                  </h3>
                  <p className="leading-relaxed font-medium">
                    The System is a proprietary, internally developed platform used to support the day-to-day management, coordination, and oversight of Company operations, including but not limited to: client and engagement management, financial record-keeping, departmental workflows, document storage, internal communications, risk and compliance tracking, and administrative account management.
                  </p>
                  <p className="mt-4 leading-relaxed font-medium">
                    The System is provided strictly for legitimate Company business purposes. It is not a public product or service, and no part of it is intended for use by members of the public.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">04.</span> Eligibility and Account Access
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li>Access is provisioned only by an authorized administrator ("General Admin Account") or a person with equivalent delegated authority.</li>
                    <li>You may not create, share, transfer, or use an account other than the one specifically issued to you.</li>
                    <li>You are responsible for maintaining the confidentiality of your login credentials, including your password and any device-binding or session tokens associated with your account.</li>
                    <li>You must notify the Company immediately if you suspect unauthorized access to your account or any breach of security.</li>
                  </ul>
                  <p className="mt-4 leading-relaxed font-medium">
                    The Company reserves the right to suspend, restrict, or terminate any account at its sole discretion, including where an account is inactive, where credentials have been compromised, or where these Terms have been violated.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">05.</span> Acceptable Use
                  </h3>
                  <p className="mb-4 font-medium italic">You agree to use the System only for its intended business purposes and in compliance with all applicable laws and Company policy. Without limiting the foregoing, you agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li>Access, view, copy, or export data outside the scope of your assigned role or departmental responsibilities;</li>
                    <li>Attempt to bypass, disable, or interfere with any authentication, permission, or security control within the System;</li>
                    <li>Introduce malicious code, conduct unauthorized testing, or attempt to probe, scan, or compromise the System’s infrastructure;</li>
                    <li>Use the System to harass, defame, or otherwise harm another individual;</li>
                    <li>Share System credentials, session access, or exported data with any unauthorized third party;</li>
                    <li>Use the System for any purpose unrelated to your employment, engagement, or authorized role with the Company.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">06.</span> Data, Confidentiality, and Privacy
                  </h3>
                  <p className="leading-relaxed font-medium">
                    All information processed through the System — including client records, financial data, internal communications, and personnel information — is confidential and proprietary to the Company and, where applicable, its clients. You agree to handle all such information in accordance with the Company’s data protection and confidentiality obligations, and applicable data protection law (including, where relevant, the Kenya Data Protection Act, 2019).
                  </p>
                  <p className="mt-4 leading-relaxed font-medium">
                    You must not disclose, transmit, or make available any data obtained through the System to any person or entity not authorized to receive it. This obligation survives the termination of your access to the System.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">07.</span> Intellectual Property
                  </h3>
                  <p className="leading-relaxed font-medium">
                    The System, including its software, design, workflows, documentation, and underlying architecture, is the exclusive property of the Company (or its licensors) and is protected by applicable intellectual property laws. Nothing in these Terms grants you any ownership interest in the System.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">08.</span> Third-Party Services and Integrations
                  </h3>
                  <p className="leading-relaxed font-medium">
                    The System may connect to or integrate with certain third-party services in support of Company operations, including but not limited to email providers, payment and mobile money platforms, financial data providers, and government/statutory compliance portals. Use of these integrations is subject to the applicable third-party provider’s own terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">09.</span> Security Obligations
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li>You must use only Company-approved devices and networks to access the System where such policy applies.</li>
                    <li>You must not attempt to disable, remove, or circumvent any security feature, including multi-factor authentication, device binding, or session locks.</li>
                    <li>Any security vulnerability discovered within the System must be reported promptly to the appropriate administrator.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">10.</span> Account Suspension and Termination
                  </h3>
                  <p className="leading-relaxed font-medium">
                    The Company reserves the right to suspend or terminate your access to the System at any time, with or without notice, including in cases of suspected policy violation, security concern, or at the Company’s sole business discretion.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">11.</span> Disclaimers
                  </h3>
                  <p className="leading-relaxed font-medium italic">
                    The System is provided on an "as is" and "as available" basis. While the Company endeavors to maintain accurate, reliable, and continuously available service, the Company makes no warranty, express or implied, that the System will be uninterrupted, error-free, or free of defects.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">12.</span> Limitation of Liability
                  </h3>
                  <p className="leading-relaxed font-medium">
                    To the fullest extent permitted by applicable law, the Company shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of, or inability to use, the System, including but not limited to loss of data or loss of business opportunity.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-4">
                    <span className="text-gold-500">13.</span> Governing Law
                  </h3>
                  <p className="leading-relaxed font-medium">
                    These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya, without regard to conflict of law principles.
                  </p>
                </section>

                <div className="pt-12 border-t border-slate-100 dark:border-white/10 text-center">
                  <Mail className="mx-auto h-10 w-10 text-gold-500 mb-6" />
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Framework Inquiries</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Reach out to our compliance team for clarification.</p>
                  <a href="mailto:thegreggorysystemsandstrategyf@gmail.com" className="text-lg font-black text-gold-600 dark:text-gold-500 hover:text-gold-700 transition-colors uppercase tracking-widest">
                    thegreggorysystemsandstrategyf@gmail.com
                  </a>
                </div>
              </div>
            </div>

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
          <blockquote className="text-lg sm:text-xl text-slate-800 dark:text-slate-300 font-medium mb-6 italic leading-relaxed transition-colors">
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
