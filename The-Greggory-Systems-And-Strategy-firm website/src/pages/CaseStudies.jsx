import { useEffect, useState } from 'react'
import { TrendingUp, Clock, DollarSign, Users, CheckCircle, Rocket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CaseStudies = () => {
  const { isAuthenticated, user } = useAuth()
  const canEdit = isAuthenticated && user && (user.role === 'employee' || user.role === 'developer')
  const [editMode, setEditMode] = useState(false)

  const defaultStudies = [
    {
      company: 'TechInnovate Solutions',
      industry: 'Technology',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop',
      situation: 'A rapidly growing software company was struggling with project delays, scope creep, and team burnout. Multiple product launches had been postponed, resulting in lost revenue opportunities and declining employee morale.',
      task: 'Implement a scalable project management framework that would enable consistent on-time delivery while maintaining team well-being and product quality.',
      action: [
        'Conducted comprehensive assessment of existing project management practices',
        'Implemented Agile/Scrum methodology with customized sprint cycles',
        'Established a Project Management Office (PMO) with clear governance structures',
        'Trained 50+ team members in Agile practices and project management fundamentals',
        'Deployed project tracking tools and real-time dashboards for stakeholder visibility'
      ],
      results: [
        { icon: <TrendingUp />, metric: '35%', label: 'Increase in Delivery Speed' },
        { icon: <Clock />, metric: '90%', label: 'On-Time Project Completion' },
        { icon: <Users />, metric: '45%', label: 'Improved Team Satisfaction' },
        { icon: <DollarSign />, metric: 'KES 25,000', label: 'Revenue Recovered in Year One' }
      ],
      testimonial: {
        quote: 'The-Greggory-Systems-And-Strategy-firm transformed our approach to systems design and strategic planning. We now deliver consistently, and our team is happier than ever.',
        author: 'Sarah Johnson',
        role: 'CEO, TechInnovate Solutions'
      }
    },
    {
      company: 'Global Manufacturing Corp',
      industry: 'Manufacturing',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop',
      situation: 'A multinational manufacturer faced significant operational inefficiencies across 12 facilities, resulting in excessive waste, quality issues, and declining profit margins.',
      task: 'Deploy a comprehensive business process improvement initiative to reduce waste, improve quality, and increase profitability across all facilities.',
      action: [
        'Implemented Lean Six Sigma methodology with Green Belt training for 30 managers',
        'Conducted value stream mapping across all major production lines',
        'Established continuous improvement teams at each facility',
        'Deployed real-time quality monitoring and statistical process control',
        'Created cross-functional innovation workshops to identify improvement opportunities'
      ],
      results: [
        { icon: <TrendingUp />, metric: '28%', label: 'Reduction in Operational Waste' },
        { icon: <DollarSign />, metric: 'KES 25,000', label: 'Annual Cost Savings' },
        { icon: <CheckCircle />, metric: '62%', label: 'Decrease in Quality Defects' },
        { icon: <TrendingUp />, metric: '22%', label: 'Increase in Profit Margin' }
      ],
      testimonial: {
        quote: 'The structured approach to process improvement delivered results beyond our expectations. The ROI was evident within the first six months.',
        author: 'Michael Chen',
        role: 'COO, Global Manufacturing Corp'
      }
    },
    {
      company: 'HealthCare Systems Inc.',
      industry: 'Healthcare',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop',
      situation: 'A regional healthcare provider needed to implement a critical electronic health records (EHR) system across 15 facilities within a tight 8-month deadline to meet regulatory requirements.',
      task: 'Lead the complex, multi-stakeholder EHR implementation project with minimal disruption to patient care and complete regulatory compliance.',
      action: [
        'Assembled and led cross-functional project team of 45 members',
        'Developed detailed project plan with critical path analysis and risk mitigation strategies',
        'Coordinated with 15 facility managers, IT teams, and clinical staff',
        'Implemented comprehensive change management program with 500+ staff training sessions',
        'Established robust testing protocols and phased rollout approach'
      ],
      results: [
        { icon: <CheckCircle />, metric: '100%', label: 'On-Time Completion' },
        { icon: <DollarSign />, metric: 'KES 25,000', label: 'Under Budget' },
        { icon: <Users />, metric: '500+', label: 'Staff Successfully Trained' },
        { icon: <TrendingUp />, metric: '95%', label: 'User Adoption Rate in 30 Days' }
      ],
      testimonial: {
        quote: 'This was the most complex project in our organization\'s history. The The-Greggory-Systems-And-Strategy-firm\'s expertise was instrumental in our success.',
        author: 'Dr. Patricia Martinez',
        role: 'Chief Medical Officer, HealthCare Systems Inc.'
      }
    },
    {
      company: 'FinTech Innovations Ltd.',
      industry: 'Financial Services',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=500&fit=crop',
      situation: 'A fast-growing fintech startup needed to scale its innovation capabilities while maintaining regulatory compliance and managing rapid growth from 50 to 200 employees.',
      task: 'Establish a structured innovation framework that could support rapid product development while ensuring compliance, quality, and scalability.',
      action: [
        'Designed and implemented Innovation Incubator program with stage-gate process',
        'Established Portfolio Management Office to balance innovation and operational projects',
        'Created innovation metrics dashboard for executive decision-making',
        'Deployed design thinking workshops and rapid prototyping methodologies',
        'Built compliance checkpoints into innovation process to ensure regulatory adherence'
      ],
      results: [
        { icon: <Rocket />, metric: '3 months', label: 'Faster Time-to-Market' },
        { icon: <TrendingUp />, metric: '12', label: 'New Products Launched in 18 Months' },
        { icon: <CheckCircle />, metric: '100%', label: 'Regulatory Compliance' },
        { icon: <DollarSign />, metric: '40%', label: 'Revenue Growth Year-Over-Year' }
      ],
      testimonial: {
        quote: 'The structured approach to innovation gave us the competitive edge we needed. We can now innovate at scale without sacrificing quality or compliance.',
        author: 'David Kim',
        role: 'Founder & CEO, FinTech Innovations Ltd.'
      }
    },
    {
      company: 'Retail Excellence Group',
      industry: 'Retail',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
      situation: 'A retail chain with 50 locations was experiencing declining sales, inconsistent customer experiences, and operational inefficiencies due to lack of standardized processes.',
      task: 'Transform business operations through strategic process standardization and performance management while improving customer experience metrics.',
      action: [
        'Conducted comprehensive operational audit across all 50 locations',
        'Developed standardized operating procedures and best practice playbooks',
        'Implemented KPI dashboard system for real-time performance tracking',
        'Launched manager training program on operational excellence',
        'Established regular business review cadence with data-driven decision making'
      ],
      results: [
        { icon: <TrendingUp />, metric: '25%', label: 'Increase in Customer Satisfaction' },
        { icon: <DollarSign />, metric: '18%', label: 'Same-Store Sales Growth' },
        { icon: <Clock />, metric: '30%', label: 'Reduction in Operational Costs' },
        { icon: <Users />, metric: '85%', label: 'Employee Engagement Score' }
      ],
      testimonial: {
        quote: 'The transformation in our operations has been remarkable. We now have consistency across all locations and the data to make smarter business decisions.',
        author: 'Jennifer Williams',
        role: 'VP of Operations, Retail Excellence Group'
      }
    },
    {
      company: 'Methen',
      industry: 'Construction',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=500&fit=crop',
      situation: 'Methen required tighter schedule control and cost visibility across concurrent construction projects to avoid delays and budget overruns.',
      task: 'Establish a unified project control framework with clear milestones, risk logs, and weekly progress reporting to stakeholders.',
      action: [
        'Introduced standardized work breakdown structures (WBS) for all active projects',
        'Implemented weekly site reporting with blockers, risks, and next actions',
        'Digitized approvals and change requests to reduce cycle time',
        'Rolled out a central dashboard for schedule, scope, and cost tracking'
      ],
      results: [
        { icon: <TrendingUp />, metric: '17%', label: 'Schedule Adherence Improvement' },
        { icon: <Clock />, metric: '22%', label: 'Faster Issue Resolution' },
        { icon: <DollarSign />, metric: 'KES 24,500', label: 'Budget Savings' },
        { icon: <Users />, metric: '92%', label: 'Stakeholder Visibility Score' }
      ],
      testimonial: {
        quote: 'We finally have consistent visibility and control across our sites. Decisions are faster and execution is smoother.',
        author: 'Peter Mwangi',
        role: 'Projects Director, Methen'
      }
    }
  ]

  const [studies, setStudies] = useState(defaultStudies)
  const [showImportExport, setShowImportExport] = useState(false)
  const [importText, setImportText] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tgf_case_studies')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length) setStudies(parsed)
      }
    } catch {}
  }, [])

  const saveAll = () => {
    try {
      localStorage.setItem('tgf_case_studies', JSON.stringify(studies))
      setEditMode(false)
      alert('Case studies updated locally.')
    } catch (e) {
      alert('Failed to save updates.')
    }
  }

  const resetAll = () => {
    if (!confirm('Reset all case studies to defaults? This clears local changes.')) return
    localStorage.removeItem('tgf_case_studies')
    setStudies(defaultStudies)
    setEditMode(false)
  }

  const exportJson = () => {
    try {
      const json = JSON.stringify(studies, null, 2)
      setImportText(json)
      setShowImportExport(true)
    } catch {}
  }

  const importJson = () => {
    try {
      const parsed = JSON.parse(importText)
      if (Array.isArray(parsed) && parsed.length) {
        setStudies(parsed)
        alert('Imported. Click Save All to persist.')
      } else {
        alert('Invalid JSON format. Expecting an array of case studies.')
      }
    } catch {
      alert('Invalid JSON.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-[140px] relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(245,158,11,0.08),_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_rgba(45,212,191,0.05),_transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>

      {/* Hero Section Protocol */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-4">Verification Matrix</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">Mission Artifacts</h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed uppercase tracking-widest mb-12">
              Real-world telemetry from successful systemic synchronizations across global entities.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Protocol */}
      <section className="relative z-10 py-16 bg-white/5 backdrop-blur-2xl border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] mb-4">Strategic Results</p>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Proven Systemic Throughput</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed mb-10">
            Our architectural expertise has delivered measurable capital and temporal efficiency for clients across technology, manufacturing, and financial sectors.
          </p>
          {canEdit && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all ${editMode ? 'bg-gold-500 text-slate-950 border-gold-500' : 'bg-white/5 text-gold-500 border-gold-500/20 hover:bg-white/10'}`}
                onClick={() => setEditMode((v) => !v)}
              >
                {editMode ? 'Seal Artifacts' : 'Modify Records'}
              </button>
              {editMode && (
                <button
                  type="button"
                  className="px-8 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10"
                  onClick={saveAll}
                >
                  Authorize Updates
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Case Studies Protocol */}
      <div className="relative z-10">
        {studies.map((study, index) => (
          <section
            key={index}
            className="py-24 border-b border-white/5 group"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="bg-gold-500/10 text-gold-500 px-4 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.3em] border border-gold-500/20">{study.industry} Protocol</span>
                    {editMode && canEdit && (
                      <input
                        className="bg-white/5 border border-white/10 rounded px-3 py-1 text-[10px] font-black uppercase text-white"
                        value={study.industry}
                        onChange={(e) => {
                          const next = [...studies]
                          next[index].industry = e.target.value
                          setStudies(next)
                        }}
                      />
                    )}
                  </div>
                  {!editMode ? (
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter group-hover:text-gold-400 transition-colors">{study.company}</h2>
                  ) : (
                    <input
                      className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-3xl font-black text-white uppercase w-full max-w-2xl"
                      value={study.company}
                      onChange={(e) => {
                        const next = [...studies]
                        next[index].company = e.target.value
                        setStudies(next)
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Hero Image Protocol */}
              <div className="mb-16 relative overflow-hidden rounded-[40px] border border-white/10 shadow-2xl">
                {!editMode ? (
                  <img src={study.image} alt={study.company} className="w-full h-64 md:h-[500px] object-cover brightness-[0.7] contrast-[1.1] grayscale-[0.3] group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-1000" />
                ) : (
                  <div className="space-y-4">
                    <img src={study.image} alt={study.company} className="w-full h-64 md:h-96 object-cover rounded-[32px] opacity-50" />
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-xs font-bold text-slate-400"
                      value={study.image}
                      onChange={(e) => {
                        const next = [...studies]
                        next[index].image = e.target.value
                        setStudies(next)
                      }}
                      placeholder="Image URL Registry"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-60" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* STAR Method Protocol */}
                <div className="space-y-12">
                  {/* Situation */}
                  <div className="bg-white/[0.02] rounded-[32px] p-8 border border-white/5 hover:bg-white/[0.04] transition-all">
                    <h3 className="text-xs font-black text-gold-500 mb-6 flex items-center gap-4 uppercase tracking-[0.4em]">
                      <div className="w-10 h-10 bg-gold-500 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-gold-500/20">
                        S
                      </div>
                      Situation Context
                    </h3>
                    {!editMode ? (
                      <p className="text-slate-400 font-medium leading-relaxed uppercase text-xs tracking-widest">{study.situation}</p>
                    ) : (
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-6 text-sm text-white"
                        value={study.situation}
                        onChange={(e) => {
                          const next = [...studies]
                          next[index].situation = e.target.value
                          setStudies(next)
                        }}
                      />
                    )}
                  </div>

                  {/* Task */}
                  <div className="bg-white/[0.02] rounded-[32px] p-8 border border-white/5 hover:bg-white/[0.04] transition-all">
                    <h3 className="text-xs font-black text-sky-400 mb-6 flex items-center gap-4 uppercase tracking-[0.4em]">
                      <div className="w-10 h-10 bg-sky-400 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-400/20">
                        T
                      </div>
                      Mission Objective
                    </h3>
                    {!editMode ? (
                      <p className="text-slate-400 font-medium leading-relaxed uppercase text-xs tracking-widest">{study.task}</p>
                    ) : (
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-6 text-sm text-white"
                        value={study.task}
                        onChange={(e) => {
                          const next = [...studies]
                          next[index].task = e.target.value
                          setStudies(next)
                        }}
                      />
                    )}
                  </div>

                  {/* Action */}
                  <div className="bg-white/[0.02] rounded-[32px] p-8 border border-white/5 hover:bg-white/[0.04] transition-all">
                    <h3 className="text-xs font-black text-emerald-400 mb-6 flex items-center gap-4 uppercase tracking-[0.4em]">
                      <div className="w-10 h-10 bg-emerald-400 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-400/20">
                        A
                      </div>
                      Strategic Execution
                    </h3>
                    {!editMode ? (
                      <ul className="space-y-4">
                        {study.action.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-4 group/item">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 transition-transform group-hover/item:scale-110" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover/item:text-white transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="space-y-4">
                        {study.action.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <input
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                              value={item}
                              onChange={(e) => {
                                const next = [...studies]
                                next[index].action[idx] = e.target.value
                                setStudies(next)
                              }}
                            />
                            <button
                              type="button"
                              className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                              onClick={() => {
                                const next = [...studies]
                                next[index].action.splice(idx, 1)
                                setStudies(next)
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="w-full py-3 border-2 border-dashed border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-emerald-400 hover:border-emerald-400/20 transition-all"
                          onClick={() => {
                            const next = [...studies]
                            next[index].action.push('')
                            setStudies(next)
                          }}
                        >
                          Append Action
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results & Testimonial Protocol */}
                <div className="space-y-12">
                  {/* Results */}
                  <div>
                    <h3 className="text-xs font-black text-gold-500 mb-8 flex items-center gap-4 uppercase tracking-[0.4em]">
                      <div className="w-10 h-10 bg-gold-500 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-gold-500/20">
                        R
                      </div>
                      Measured Outcomes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {study.results.map((result, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 text-center shadow-xl group/res hover:bg-white/[0.08] transition-all">
                          <div className="text-gold-500 flex justify-center mb-6 transition-transform group-hover/res:scale-110">
                            {result.icon}
                          </div>
                          {!editMode ? (
                            <>
                              <div className="text-4xl font-black text-white tracking-tighter mb-2">{result.metric}</div>
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{result.label}</div>
                            </>
                          ) : (
                            <div className="space-y-4">
                              <input
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xl font-black text-center text-white"
                                value={result.metric}
                                onChange={(e) => {
                                  const next = [...studies]
                                  next[index].results[idx].metric = e.target.value
                                  setStudies(next)
                                }}
                              />
                              <input
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-center text-slate-400"
                                value={result.label}
                                onChange={(e) => {
                                  const next = [...studies]
                                  next[index].results[idx].label = e.target.value
                                  setStudies(next)
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Testimonial Protocol */}
                  <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[40px] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                       <Rocket className="w-32 h-32 text-gold-500" />
                    </div>
                    <svg className="w-12 h-12 text-gold-500/20 mb-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    {!editMode ? (
                      <div className="relative z-10">
                        <blockquote className="text-xl font-bold text-slate-200 mb-8 leading-relaxed italic">"{study.testimonial.quote}"</blockquote>
                        <div className="flex items-center gap-4">
                           <div className="h-px w-8 bg-gold-500"></div>
                           <div>
                              <div className="font-black text-white uppercase tracking-widest text-sm">{study.testimonial.author}</div>
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{study.testimonial.role}</div>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 relative z-10">
                        <textarea
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white italic"
                          value={study.testimonial.quote}
                          onChange={(e) => {
                            const next = [...studies]
                            next[index].testimonial.quote = e.target.value
                            setStudies(next)
                          }}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white"
                            value={study.testimonial.author}
                            onChange={(e) => {
                              const next = [...studies]
                              next[index].testimonial.author = e.target.value
                              setStudies(next)
                            }}
                            placeholder="Author"
                          />
                          <input
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white"
                            value={study.testimonial.role}
                            onChange={(e) => {
                              const next = [...studies]
                              next[index].testimonial.role = e.target.value
                              setStudies(next)
                            }}
                            placeholder="Role"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* CTA Section Protocol */}
      <section className="relative z-10 py-32 bg-gold-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.5em] mb-4 opacity-60">Mission Intake</p>
          <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tight mb-8">
            Initialize Your Sync
          </h2>
          <p className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-12">
            Join the strategic elite who have synchronized their business models with The Greggory Standard.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact" className="px-10 py-5 bg-slate-950 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-2xl">
              Initialize Consultation
            </Link>
            <Link to="/services" className="px-10 py-5 bg-white/20 text-slate-950 border border-slate-950/20 rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/30 transition-all">
              Inspect Modules
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CaseStudies
