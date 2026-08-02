import { useState, useRef, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, Target, Lightbulb, CheckCircle, TrendingUp, Users, Award } from 'lucide-react'
import BrandHeader from '../components/BrandHeader'
import { useAuth } from '../context/AuthContext'
import { SITE_NAME, SITE_MOTTO } from '../constants/siteBrand'

const Home = () => {
  const videoRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Attempt to play - browsers may block unmuted autoplay
            videoRef.current?.play().catch(() => {
              console.log('Autoplay with sound prevented by browser policy.')
            })
          } else {
            videoRef.current?.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  // Show landing page for all users (no redirect)
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
    { icon: <TrendingUp className="w-8 h-8" />, value: '150+', label: 'Projects Delivered' },
    { icon: <Users className="w-8 h-8" />, value: '50+', label: 'Happy Clients' },
    { icon: <Award className="w-8 h-8" />, value: '98%', label: 'Success Rate' }
  ]

  return (
    <div className="relative bg-[var(--bg-primary)] transition-colors duration-500">
      {/* Hero Section - Enlarged and Unified */}
      <section className="relative min-h-[95vh] w-full flex items-center overflow-hidden bg-[var(--bg-primary)] transition-colors">
        {/* Immersive Integrated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#334155]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(234,179,8,0.08),_transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_30%,_rgba(234,179,8,0.15),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(13,148,136,0.05),_transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_70%,_rgba(13,148,136,0.1),_transparent_50%)]" />

          {/* Subtle pattern to tie the background together */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] mix-blend-overlay"
               style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">

            {/* Unified Content Block (Text + Branding) */}
            <div className="lg:col-span-7 space-y-10 z-20">
              <div className="space-y-6">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] lg:-ml-1">
                  <span className="block text-slate-900 dark:text-white drop-shadow-2xl transition-colors">
                    {SITE_NAME}
                  </span>
                  <span className="mt-4 block text-xl sm:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-600 to-gold-400 dark:from-gold-400 dark:to-yellow-200 italic tracking-wide">
                    {SITE_MOTTO}
                  </span>
                </h1>

                <p className="max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 lg:text-xl font-light transition-colors">
                  We turn complex organizational challenges into <span className="text-slate-900 dark:text-white font-semibold underline decoration-gold-500/40 underline-offset-8">practical systems</span> and clear strategy — the definitive resource for <span className="text-slate-900 dark:text-white font-bold italic">design, implementation, and ongoing maintenance</span> that builds lasting confidence.
                </p>
              </div>

              <div className="flex flex-wrap gap-6 pt-6">
                <Link to="/services" className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-[20px] bg-gradient-to-r from-gold-500 to-yellow-500 px-10 py-5 text-xl font-black text-slate-950 shadow-[0_25px_50px_-12px_rgba(234,179,8,0.4)] transition-all hover:scale-[1.05] hover:shadow-gold-500/60 active:scale-95">
                  <span className="relative z-10">Our Services</span>
                  <ArrowRight size={24} className="relative z-10 transition-transform group-hover:translate-x-1.5" />
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
                <Link to="/contact" className="inline-flex items-center justify-center rounded-[20px] border-2 border-white/10 bg-white/5 px-10 py-5 text-xl font-bold text-white backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20 active:scale-95">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* "Free" Floating Hero Image Section - Enlarged to fit Hero area */}
            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end mt-12 lg:mt-0 min-h-[420px] sm:min-h-[560px] lg:min-h-[620px] lg:h-full lg:self-stretch overflow-hidden">
              <div className="relative w-full lg:w-[130%] h-full flex items-center justify-center lg:translate-x-8">

                {/* Massive Dynamic Atmosphere Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] bg-gold-500/15 blur-[180px] rounded-full animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-teal-500/10 blur-[150px] rounded-full" />

                {/* The Free-Floating Subject Image */}
                <div className="relative z-10 w-full h-full group overflow-visible">
                  <img
                    src="/brand-header.png/suti4.PNG"
                    alt="Strategic Excellence"
                    className="w-full h-full object-cover object-center transform transition-all duration-1000 group-hover:scale-110 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_95%)]"
                  />

                  {/* Atmospheric overlay to pull image into the dark void */}
                  <div className="absolute inset-0 bg-[#0f172a]/5 mix-blend-multiply pointer-events-none" />
                </div>

                {/* Floating Integrated Icon */}
                <div className="absolute top-1/4 right-0 z-20 bg-gradient-to-br from-gold-400 to-yellow-600 p-6 rounded-full shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-bounce hidden sm:block">
                   <Lightbulb className="text-slate-950 w-10 h-10" />
                </div>

                {/* Decorative drifting particles/elements */}
                <div className="absolute top-20 left-10 w-2 h-2 bg-gold-400 rounded-full animate-ping opacity-40" />
                <div className="absolute bottom-20 right-20 w-3 h-3 bg-teal-400 rounded-full animate-pulse opacity-20" />
              </div>
            </div>

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
