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
        quote: 'The Greggory Foundation transformed our approach to project management. We now deliver consistently, and our team is happier than ever.',
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
        quote: 'This was the most complex project in our organization\'s history. The Greggory Foundation\'s expertise was instrumental in our success.',
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
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Success Stories</h1>
            <p className="text-xl text-gray-300">
              Real results from real clients. Discover how we've helped organizations achieve their goals through strategic project management.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Proven Results Across Industries</h2>
          <p className="section-subtitle mx-auto mt-4">
            Our project management expertise has delivered measurable value for clients across technology, manufacturing, healthcare, finance, and retail sectors. Each engagement follows our proven methodology to ensure sustainable success.
          </p>
          {canEdit && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                className={`px-4 py-2 rounded-md border ${editMode ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-teal-700 border-teal-600'}`}
                onClick={() => setEditMode((v) => !v)}
              >
                {editMode ? 'Exit Edit Mode' : 'Edit Reports'}
              </button>
              {editMode && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-teal-600 text-white border border-teal-600"
                  onClick={saveAll}
                >
                  Save All
                </button>
              )}
              {editMode && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700"
                  onClick={resetAll}
                >
                  Reset
                </button>
              )}
              {editMode && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700"
                  onClick={exportJson}
                >
                  Import/Export JSON
                </button>
              )}
            </div>
          )}
          {editMode && showImportExport && (
            <div className="mt-4 text-left bg-gray-50 border rounded p-4">
              <label className="block text-xs text-gray-600 mb-1">Import or edit JSON then click Apply</label>
              <textarea
                className="w-full h-48 border rounded p-2 text-sm"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1 rounded bg-gray-200" onClick={importJson}>Apply</button>
                <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setShowImportExport(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Case Studies */}
      {studies.map((study, index) => (
        <section 
          key={index} 
          className={index % 2 === 0 ? 'py-16 bg-gray-50' : 'py-16 bg-white'}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                {!editMode && (
                  <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">{study.industry}</span>
                )}
                {editMode && canEdit && (
                  <input
                    className="border rounded px-2 py-1 text-sm"
                    value={study.industry}
                    onChange={(e) => {
                      const next = [...studies]
                      next[index].industry = e.target.value
                      setStudies(next)
                    }}
                  />
                )}
              </div>
              {!editMode && (
                <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">{study.company}</h2>
              )}
              {editMode && canEdit && (
                <input
                  className="w-full max-w-xl border rounded px-3 py-2 text-lg font-bold text-navy-900"
                  value={study.company}
                  onChange={(e) => {
                    const next = [...studies]
                    next[index].company = e.target.value
                    setStudies(next)
                  }}
                />
              )}
            </div>

            {/* Hero Image */}
            <div className="mb-12">
              {!editMode && (
                <img src={study.image} alt={study.company} className="w-full h-64 md:h-96 object-cover rounded-lg shadow-xl" />
              )}
              {editMode && canEdit && (
                <div className="space-y-2">
                  <img src={study.image} alt={study.company} className="w-full h-64 md:h-96 object-cover rounded-lg shadow" />
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={study.image}
                    onChange={(e) => {
                      const next = [...studies]
                      next[index].image = e.target.value
                      setStudies(next)
                    }}
                    placeholder="Image URL"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* STAR Method Content */}
              <div className="space-y-8">
                {/* Situation */}
                <div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
                      S
                    </div>
                    Situation
                  </h3>
                  {!editMode && <p className="text-gray-600 leading-relaxed">{study.situation}</p>}
                  {editMode && canEdit && (
                    <textarea
                      className="w-full border rounded p-2"
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
                <div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
                      T
                    </div>
                    Task
                  </h3>
                  {!editMode && <p className="text-gray-600 leading-relaxed">{study.task}</p>}
                  {editMode && canEdit && (
                    <textarea
                      className="w-full border rounded p-2"
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
                <div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
                      A
                    </div>
                    Action
                  </h3>
                  {!editMode && (
                    <ul className="space-y-2">
                      {study.action.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {editMode && canEdit && (
                    <div className="space-y-2">
                      {study.action.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            className="flex-1 border rounded px-2 py-1"
                            value={item}
                            onChange={(e) => {
                              const next = [...studies]
                              next[index].action[idx] = e.target.value
                              setStudies(next)
                            }}
                          />
                          <button
                            type="button"
                            className="px-2 py-1 border rounded text-sm"
                            onClick={() => {
                              const next = [...studies]
                              next[index].action.splice(idx, 1)
                              setStudies(next)
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="px-3 py-1 border rounded text-sm"
                        onClick={() => {
                          const next = [...studies]
                          next[index].action.push('')
                          setStudies(next)
                        }}
                      >
                        Add Action
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Results & Testimonial */}
              <div className="space-y-8">
                {/* Results */}
                <div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
                      R
                    </div>
                    Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {study.results.map((result, idx) => (
                      <div key={idx} className="bg-white rounded-lg shadow-md p-6 text-center border-2 border-teal-100">
                        <div className="text-teal-600 flex justify-center mb-2">
                          {result.icon}
                        </div>
                        {!editMode && (
                          <>
                            <div className="text-3xl font-bold text-navy-900 mb-1">{result.metric}</div>
                            <div className="text-sm text-gray-600">{result.label}</div>
                          </>
                        )}
                        {editMode && canEdit && (
                          <div className="space-y-2 text-left">
                            <label className="block text-xs text-gray-500">Metric</label>
                            <input
                              className="w-full border rounded px-2 py-1"
                              value={result.metric}
                              onChange={(e) => {
                                const next = [...studies]
                                next[index].results[idx].metric = e.target.value
                                setStudies(next)
                              }}
                            />
                            <label className="block text-xs text-gray-500">Label</label>
                            <input
                              className="w-full border rounded px-2 py-1"
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
                  {editMode && canEdit && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 border rounded text-sm"
                        onClick={() => {
                          const next = [...studies]
                          next[index].results.push({ icon: <TrendingUp />, metric: '', label: 'New Metric' })
                          setStudies(next)
                        }}
                      >
                        Add Result
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 border rounded text-sm"
                        onClick={() => {
                          const next = [...studies]
                          if (next[index].results.length > 0) next[index].results.pop()
                          setStudies(next)
                        }}
                      >
                        Remove Last Result
                      </button>
                    </div>
                  )}
                </div>

                {/* Testimonial */}
                <div className="bg-navy-900 text-white rounded-lg p-8">
                  <svg className="w-10 h-10 text-teal-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  {!editMode && (
                    <>
                      <blockquote className="text-lg mb-4 italic">"{study.testimonial.quote}"</blockquote>
                      <div className="font-semibold">{study.testimonial.author}</div>
                      <div className="text-gray-300 text-sm">{study.testimonial.role}</div>
                    </>
                  )}
                  {editMode && canEdit && (
                    <div className="space-y-3">
                      <label className="block text-xs text-gray-300">Testimonial Quote</label>
                      <textarea
                        className="w-full bg-navy-800 text-white rounded px-2 py-2"
                        value={study.testimonial.quote}
                        onChange={(e) => {
                          const next = [...studies]
                          next[index].testimonial.quote = e.target.value
                          setStudies(next)
                        }}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-300">Author</label>
                          <input
                            className="w-full bg-navy-800 text-white rounded px-2 py-1"
                            value={study.testimonial.author}
                            onChange={(e) => {
                              const next = [...studies]
                              next[index].testimonial.author = e.target.value
                              setStudies(next)
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-300">Role</label>
                          <input
                            className="w-full bg-navy-800 text-white rounded px-2 py-1"
                            value={study.testimonial.role}
                            onChange={(e) => {
                              const next = [...studies]
                              next[index].testimonial.role = e.target.value
                              setStudies(next)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join our growing list of satisfied clients who have transformed their businesses through strategic project management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn-primary bg-teal-600 hover:bg-teal-700 justify-center">
              Schedule a Consultation
            </a>
            <a href="/services" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-navy-900 justify-center">
              Explore Our Services
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CaseStudies
