import React, { useState, useEffect, useRef } from 'react'
import { ArrowRight, Sparkles, Orbit, Zap, Heart, Globe, Shield, Command, Fingerprint, Microscope, Radio, Search, ChevronLeft, ChevronRight, UserCheck, Rocket, RefreshCw, Target, CheckCircle2, BarChart3, TrendingUp } from 'lucide-react'
import { SITE_NAME } from '../constants/siteBrand'
import { Link } from 'react-router-dom'
import { getApiUrl } from '../services/api'

const About = () => {
  const [personnel, setPersonnel] = useState([])
  const [personnelLoading, setPersonnelLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch(getApiUrl('/api/company-personnel'))
      .then((r) => r.json())
      .then((d) => { if (mounted) setPersonnel(d?.personnel || []) })
      .catch(() => {})
      .finally(() => { if (mounted) setPersonnelLoading(false) })
    return () => { mounted = false }
  }, [])

  const fallbackPerson = { id: 0, name: 'Brian Mwanza', position: 'Founder & Managing Director', bio: '<p>Brian Mwanza is the visionary force behind The-Greggory-Systems-And-Strategy-firm...</p>', image_url: '/images/brian-mwanza-ceo.jpg' }
  const displayPersonnel = personnel.length > 0 ? personnel : [fallbackPerson]

  const [searchQuery, setSearchQuery] = useState('');
  const trackRef = useRef(null);
  const visiblePersonnel = displayPersonnel.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const scrollPersonnel = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#fdfaf6] text-[#111] pt-32 selection:bg-[#8fb28a] selection:text-white font-sans overflow-x-hidden">

      {/* FIRM PERSONNEL - first item on the About page, own region with divider below */}
      <section className="w-full px-6 lg:px-20 pb-12">
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 md:p-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => scrollPersonnel(-1)}
                aria-label="Scroll personnel left"
                className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center hover:bg-slate-700 transition-all shadow-md hover:scale-105 active:scale-95 flex-shrink-0 mt-1"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-[#8fb28a]">Firm Personnel</span>
                <h2 className="text-4xl font-bold tracking-tight">The People Behind the Systems</h2>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">Click a profile to explore the credentials and records published by our administrators.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search personnel by name..."
                  className="pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-slate-700 outline-none focus:border-[#8fb28a]/60 w-48 md:w-60 transition-all"
                />
              </div>
              <button
                onClick={() => scrollPersonnel(1)}
                aria-label="Scroll personnel right"
                className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center hover:bg-slate-700 transition-all shadow-md hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {personnelLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full py-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/5] rounded-[32px] bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : visiblePersonnel.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No personnel match your search.</p>
            </div>
          ) : (
            <div
              ref={trackRef}
              className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-2 -mx-2 px-2"
            >
                            {visiblePersonnel.map((p) => (
                <Link
                  key={p.id}
                  to={`/personnel/${p.id}`}
                  className="group text-left flex-shrink-0 w-[calc(25%-18px)] min-w-[220px]"
                >
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[32px] shadow-xl bg-slate-100">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                        className="w-full h-full object-cover grayscale brightness-105 contrast-105 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#8fb28a]/10 text-5xl font-black text-[#8fb28a]">{p.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="font-black text-sm text-[#111] group-hover:text-[#8fb28a] transition-colors">{p.name}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aa7d3f]">{p.position}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

{/* DIVIDER - separates the Firm Personnel region (the first item on the About page) from the other items */}
      <div className="w-full px-6 lg:px-20">
         <div className="h-px w-full bg-slate-200" />
      </div>

{/* 1. HERO SECTION */}
      <section className="w-full px-6 lg:px-20 pb-16 lg:pb-24">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-10 lg:gap-12">
          <div className="lg:w-2/3">
            <div className="flex items-center gap-3 opacity-60 mb-8">
              <Fingerprint className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">The Architectural Identity</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              We design the underlying operating systems <br className="hidden md:block" />
              that allow strategy to breathe <span className="text-[#8fb28a]">independently.</span>
            </h1>

            <p className="text-2xl md:text-3xl font-bold leading-[1.5] text-[#111] mb-8 max-w-3xl">
              The-Greggory-Systems-And-Strategy-firm was founded on a singular premise:that complexity is the greatest tax on human ambition.We exist to dismantle that tax: by engineering the invisible operating systems, the decision rhythms, the feedback loops,and the digital nerve-centers,that turn strategic ambition into sustainable momentum.Every engagement begins not with a slide deck,but with a forensic reading of how your organization actually works:where energy leaks,where clarity stalls,and where momentum dies.We rebuild from the ground up,so that strategy is no longer a document,but a pulse.
            </p>

          </div>
          <div className="lg:w-2/5 space-y-6">

            
            <div className="relative w-full max-w-sm overflow-hidden rounded-[24px] shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
                alt="Strategic systems and business strategy architecture"
                loading="lazy"
                className="w-full h-52 object-cover"
              />
            </div>
          </div>
        </div>
      </section>
{/* WHAT WE DO - EVERY GREAT OUTCOME HAS A BEGINNING, A MIDDLE, AND A HEREAFTER */}
      <section className="w-full px-6 lg:px-20 pb-16 lg:pb-24">
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 md:p-12">

          {/* Section framing */}
          <div className="max-w-3xl space-y-5 mb-14">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-[#8fb28a]">What We Do — Across the Board</span>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.1] text-black">
              Every great outcome has a beginning, a middle,<br className="hidden md:block" /> and a hereafter.
            </h2>
            <p className="text-base text-slate-500 leading-[1.8] max-w-2xl">
              Most firms hand you a finished project and walk away. We stay for the whole story. We{' '}
              <span className="text-black font-semibold">develop</span> what you need,{' '}
              <span className="text-black font-semibold">keep it running</span> at its best,{' '}
              <span className="text-black font-semibold">upgrade</span> it as the world moves, and{' '}
              <span className="text-black font-semibold">stand behind it</span> long after launch — for{' '}
              <span className="text-black font-semibold">individuals and organizations alike</span>, for{' '}
              <span className="text-black font-semibold">profit and for purpose</span>.
            </p>
          </div>

          {/* The four pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {[
              {
                icon: Rocket,
                step: '01',
                title: 'Development',
                desc: 'From a blank page to a working reality. We scope, design, and deliver projects, systems, and digital platforms that do exactly what your ambition needs them to do — on time, on budget, and built to survive contact with the real world.',
              },
              {
                icon: Shield,
                step: '02',
                title: 'Maintenance',
                desc: 'The calm of knowing it won’t let you down. We monitor, secure, and tune everything we build — so downtime, surprises, and costly failures quietly become somebody else’s problem.',
              },
              {
                icon: RefreshCw,
                step: '03',
                title: 'Upgrades',
                desc: 'Built yesterday doesn’t mean stuck yesterday. We modernize what you already have — new capabilities, sharper performance, stronger security — so you keep moving while everyone else plays catch-up.',
              },
              {
                icon: Heart,
                step: '04',
                title: 'Upkeep & Support',
                desc: 'The quiet advantage of continuity. We stay beside you with attentive care and fast response, so every asset keeps compounding value long after launch day.',
              },
            ].map((item) => (
              <div key={item.title} className="relative pl-16 group">
                <div className="absolute left-0 top-0 w-11 h-11 rounded-2xl bg-[#8fb28a]/10 flex items-center justify-center group-hover:bg-[#8fb28a] transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-[#4c6a4d] group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-[10px] font-black tracking-[0.4em] text-[#aa7d3f]">{item.step}</span>
                <h3 className="text-lg font-bold tracking-tight text-black mt-1">{item.title}</h3>
                <p className="text-sm text-black/70 leading-[1.8] mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
{/* Who we serve */}
          <div className="mt-16 pt-10 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-9">
              <Globe className="w-4 h-4 text-[#4c6a4d]" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-black">Who we serve</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: Sparkles,
                  title: 'Individuals',
                  desc: 'A single vision deserves the same rigor as a corporate roadmap. We bring enterprise-grade discipline to personal ambitions — from one project to a lifetime of momentum.',
                },
                {
                  icon: Target,
                  title: 'Profit-Driven Organizations',
                  desc: 'From lean startups to established enterprises, we build what grows revenue, maintain what protects it, and upgrade what keeps you ahead of the market.',
                },
                {
                  icon: Heart,
                  title: 'Non-Profits & Purpose-Led Missions',
                  desc: 'Every shilling must count. We build lean, maintain carefully, and stretch every resource — so more of your effort becomes impact.',
                },
              ].map((group) => (
                <div key={group.title} className="space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center">
                    <group.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">{group.title}</h4>
                  <p className="text-sm text-black/70 leading-[1.8]">{group.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Business consultancy — the other half */}
          <div className="mt-16 rounded-[24px] bg-[#fdfaf6] border border-slate-100 p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-5">
              <div className="w-12 h-12 rounded-2xl bg-[#aa7d3f]/10 flex items-center justify-center mb-5">
                <Command className="w-6 h-6 text-[#aa7d3f]" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-black leading-tight">
                The consultancy<br />behind the delivery.
              </h3>
            </div>
            <div className="lg:col-span-7 space-y-5">
              <p className="text-sm md:text-base text-black/70 leading-[1.8]">
                Hands-on delivery is only half our promise. Alongside every project, we act as the business
                partner that helps you use it well — strategy, operations, finance, organizational design,
                growth planning, and continuous improvement — for both profit-driven enterprises and
                purpose-led non-profits.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  'Strategy that turns a build into growth',
                  'Operations that run like clockwork',
                  'Financial clarity for every decision',
                  'Growth that compounds, not complicates',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#8fb28a] shrink-0 mt-0.5" />
                    <p className="text-[13px] text-black/80 leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Close */}
          <div className="mt-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-[#8fb28a]">The outcome</span>
              <p className="text-xl md:text-2xl font-bold tracking-tight text-black leading-snug mt-2">
                One partner for the whole lifecycle — so you never have to start the story twice.
              </p>
            </div>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-full bg-black text-white font-bold text-sm hover:bg-slate-800 transition-all shrink-0"
            >
              Bring us your idea
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>


      {/* 2. THE LONG NARRATIVE */}
      <section className="w-full px-6 lg:px-20 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-6">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#aa7d3f]">01 / The Origin</h2>
               <p className="text-sm text-slate-400 leading-relaxed uppercase tracking-widest font-bold">The evolution of systemic resonance.</p>
               <div className="h-px w-20 bg-[#aa7d3f]/20" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <p className="text-base text-black leading-[1.8] max-w-3xl">
              We began not as a consultancy, but as a laboratory for operational resilience. We observed how even the most brilliant strategies often collapsed under the weight of their own implementation. The missing link was never the "what"—it was always the "how" of the ecosystem.
            </p>
            <p className="text-base text-black leading-[1.8] max-w-3xl">
              By studying the intersection of human psychology, technological architecture, and market dynamics, we developed a methodology that prioritizes flow over force. We don't push organizations toward change; we design the environment so that change becomes the path of least resistance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mt-20 lg:mt-28">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-6">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#8fb28a]">02 / Integrity</h2>
               <p className="text-sm text-slate-400 leading-relaxed uppercase tracking-widest font-bold">Mapping the organizational organism.</p>
               <div className="h-px w-20 bg-[#8fb28a]/20" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <p className="text-base text-black leading-[1.8] max-w-3xl">
              Most firms look at a company as a collection of departments. We look at it as a living organism. When one part of the system is out of sync, the entire structure vibrates with friction. Our intervention starts with a deep mapping of these vibrations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-2 max-w-3xl">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Microscope className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-black">Deep Diagnosis</h3>
                <p className="text-sm text-black leading-relaxed">We identify the hidden tactical frictions that leak energy and slow down decision-making at every level.</p>
              </div>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-black">Signal Clarity</h3>
                <p className="text-sm text-black leading-relaxed">We transform internal communications from static noise into a clear frequency that every team member can tune into.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PHILOSOPHY */}
      <section className="w-full px-6 lg:px-20 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-2xl bg-[#8fb28a]/10 flex items-center justify-center">
                <Orbit className="w-5 h-5 text-[#4c6a4d]" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-black">Ecosystem Thinking</h3>
              <p className="text-sm text-black leading-relaxed">We move beyond isolated solutions. Every strategy we deploy considers the ripple effect across your entire organization.</p>
            </div>
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-2xl bg-[#aa7d3f]/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#aa7d3f]" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-black">Radical Momentum</h3>
              <p className="text-sm text-black leading-relaxed">Speed is a by-product of clarity. By removing obstacles, we unlock a natural, sustainable velocity without burnout.</p>
            </div>
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center">
                <Heart className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-black">Cultural Resonance</h3>
              <p className="text-sm text-black leading-relaxed">Systems are for people. We design with empathy, ensuring our technical solutions feel natural and empowering.</p>
            </div>
        </div>
      </section>
{/* FINAL CALL TO ACTION */}
      <section className="py-16 lg:py-24 bg-white w-full px-6 lg:px-20 text-center">
         <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
            <h2 className="text-3xl font-bold tracking-tight">Ready to integrate <br className="hidden md:block" /> these systems into your vision?</h2>
            <Link to="/contact" className="group inline-flex items-center gap-4 px-8 py-4 rounded-full bg-black text-white font-bold text-base hover:bg-slate-800 transition-all">
               Start the Conversation
               <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
         </div>
      </section>

    </div>
  )
}

export default About
