import { Link } from 'react-router-dom'
import { 
  Target, 
  Lightbulb, 
  CheckCircle, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Rocket, 
  Repeat, 
  Users, 
  FileText, 
  Shield, 
  Zap,
  ArrowRight
} from 'lucide-react'

const Services = () => {
  const services = [
    {
      id: 'business',
      icon: <Target className="w-12 h-12" />,
      title: 'Business Management',
      subtitle: 'Managing Your Business as a Strategic Project',
      description: 'We help you apply project management discipline to your core operations for sustained efficiency and growth. Transform your daily business activities into strategically managed initiatives with clear objectives and measurable outcomes.',
      offerings: [
        {
          icon: <BarChart3 className="w-6 h-6" />,
          title: 'Operational Workflow Design',
          description: 'Streamline processes and eliminate inefficiencies through structured workflow analysis and optimization.'
        },
        {
          icon: <TrendingUp className="w-6 h-6" />,
          title: 'Performance Metric (KPI) Implementation',
          description: 'Establish clear, measurable indicators to track progress and drive continuous improvement.'
        },
        {
          icon: <FileText className="w-6 h-6" />,
          title: 'Strategic Planning Facilitation',
          description: 'Develop comprehensive business strategies with actionable roadmaps and clear accountability.'
        }
      ],
      benefits: [
        'Enhanced operational efficiency by 25-40%',
        'Improved decision-making with data-driven insights',
        'Increased organizational agility and responsiveness',
        'Better resource allocation and utilization'
      ]
    },
    {
      id: 'innovation',
      icon: <Lightbulb className="w-12 h-12" />,
      title: 'Innovation & Improvement',
      subtitle: 'Structured Frameworks for Innovation & Improvement Projects',
      description: 'Turn creative ideas into actionable projects and streamline existing processes for maximum output. We provide the structure needed to transform innovation from a buzzword into a systematic, repeatable capability.',
      offerings: [
        {
          icon: <Rocket className="w-6 h-6" />,
          title: 'Innovation Incubator Programs',
          description: 'Structured frameworks to nurture ideas from concept to implementation with rapid prototyping.'
        },
        {
          icon: <Repeat className="w-6 h-6" />,
          title: 'Lean Six Sigma Process Improvement',
          description: 'Systematic elimination of waste and reduction of variation in your business processes.'
        },
        {
          icon: <Users className="w-6 h-6" />,
          title: 'Change Management Strategies',
          description: 'Ensure successful adoption of innovations through structured change management approaches.'
        }
      ],
      benefits: [
        'Accelerated time-to-market for new products/services',
        'Reduced operational costs through process optimization',
        'Enhanced employee engagement and creativity',
        'Sustainable competitive advantage through continuous innovation'
      ]
    },
    {
      id: 'project',
      icon: <CheckCircle className="w-12 h-12" />,
      title: 'Comprehensive Solutions',
      subtitle: 'Dedicated Service & Program Leadership',
      description: 'From conception to completion, we provide the expertise to lead your most important initiatives to success. Our seasoned professionals bring methodological rigor and practical experience to ensure on-time, on-budget delivery across all our subsidiary companies.',
      offerings: [
        {
          icon: <Settings className="w-6 h-6" />,
          title: 'Full Project Lifecycle Management',
          description: 'End-to-end project leadership from initiation through closure with proven methodologies.'
        },
        {
          icon: <Shield className="w-6 h-6" />,
          title: 'Risk Assessment & Mitigation',
          description: 'Proactive identification and management of project risks to prevent issues before they occur.'
        },
        {
          icon: <Zap className="w-6 h-6" />,
          title: 'Agile/Scrum Coaching & PMO Setup',
          description: 'Implement agile practices and establish Service Delivery Offices for organizational capability.'
        }
      ],
      benefits: [
        '98% on-time project delivery rate',
        'Average 30% reduction in project costs',
        'Improved stakeholder satisfaction and engagement',
        'Enhanced project team performance and morale'
      ]
    }
  ]

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-4">Service Protocol</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">Integrated Modules</h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed uppercase tracking-widest">
              Comprehensive strategic solutions architected for high-performance mission delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Protocol */}
      <section className="relative z-10 py-16 bg-white/5 backdrop-blur-2xl border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Strategic Asset Alignment</h2>
          <p className="max-w-4xl mx-auto text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
            At THE-GREGGORY-SYSTEMS-AND-STRATEGY-FIRM, we handle projects through their entire lifecycle: <span className="text-white">Design, Creation, and Maintenance</span>. We transform complex organizational challenges into practical systems and clear strategies that build lasting confidence.
          </p>
        </div>
      </section>

      {/* Service Details Protocol */}
      <div className="relative z-10">
        {services.map((service, index) => (
          <section
            key={service.id}
            id={service.id}
            className="py-24 border-b border-white/5 group"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                {/* Service Overview */}
                <div className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
                  <div className="bg-gold-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-10 text-gold-500 border border-gold-500/20 group-hover:scale-110 transition-transform shadow-xl shadow-gold-500/5">
                    {service.icon}
                  </div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-gold-400 transition-colors">
                    {service.title}
                  </h2>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">
                    PROTOCOL: {service.subtitle}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed uppercase tracking-widest mb-10">
                    {service.description}
                  </p>

                  {/* Benefits Protocol */}
                  <div className="bg-white/5 rounded-[32px] p-8 border border-white/10 shadow-2xl">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       Systemic ROI
                    </h4>
                    <ul className="space-y-4">
                      {service.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-4 group/item">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 transition-transform group-hover/item:scale-110" />
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover/item:text-white transition-colors">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Service Offerings Protocol */}
                <div className={index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}>
                  <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[40px] shadow-2xl p-10 border border-white/10 relative overflow-hidden group/card">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/card:opacity-[0.06] transition-opacity">
                       <Shield size={120} />
                    </div>
                    <h4 className="text-xs font-black text-gold-500 uppercase tracking-[0.3em] mb-10 relative z-10">Module Components</h4>
                    <div className="space-y-8 relative z-10">
                      {service.offerings.map((offering, idx) => (
                        <div key={idx} className="flex gap-6 group/offering">
                          <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center text-gold-500 flex-shrink-0 border border-white/10 group-hover/offering:bg-gold-500 group-hover/offering:text-slate-950 transition-all">
                            {offering.icon}
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-white uppercase tracking-wider mb-2">{offering.title}</h5>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{offering.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Methodologies Protocol */}
      <section className="relative z-10 py-24 bg-white/5 backdrop-blur-2xl border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-4">Frameworks</p>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Systemic Standards</h2>
            <p className="text-lg text-slate-500 font-bold uppercase tracking-widest mt-4">
              Validated methodologies architected for complex deployment
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['PMI/PMBOK', 'Agile/Scrum', 'PRINCE2', 'Lean Six Sigma'].map((method, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/5 rounded-[28px] p-10 border border-white/5 hover:bg-white/10 hover:border-gold-500/20 transition-all group">
                  <div className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-gold-500 transition-colors">{method}</div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Certified Protocol</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Protocol */}
      <section className="relative z-10 py-32 bg-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tight mb-8">
            Initialize Transformation
          </h2>
          <p className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-12 max-w-2xl mx-auto">
            Integrate our high-tier architectural expertise into your business model today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact" className="px-10 py-5 bg-slate-950 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-2xl flex items-center justify-center gap-3">
              Schedule Synchronization
              <ArrowRight size={18} />
            </Link>
            <Link to="/case-studies" className="px-10 py-5 bg-white/20 text-slate-950 border border-slate-950/20 rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/30 transition-all text-center">
              Inspect Mission Artifacts
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
