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
  ArrowRight,
  ChevronRight,
  Layers,
  Search,
  Activity,
  Globe
} from 'lucide-react'

const Services = () => {
  const services = [
    {
      id: 'business',
      icon: <Target className="w-5 h-5" />,
      title: 'Business Management',
      subtitle: 'Operational Engineering & Strategic Oversight',
      accentColor: 'border-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/50 dark:bg-blue-900/10',
      description: 'We translate project management rigor into core business operations. By architecting scalable workflows, we help organizations transition from reactive chaos to proactive, data-driven leadership.',
      offerings: [
        { title: 'Workflow Optimization', desc: 'Removing structural friction from daily operations.' },
        { title: 'Performance Telemetry', desc: 'Custom KPI dashboards for executive clarity.' },
        { title: 'Strategic Deployment', desc: 'Precision implementation of long-term roadmaps.' }
      ]
    },
    {
      id: 'innovation',
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'Innovation & Improvement',
      subtitle: 'Systemic Frameworks for Organizational Evolution',
      accentColor: 'border-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-900/10',
      description: 'Innovation is treated as a manageable asset. We provide the governance and technical frameworks required to iterate quickly, test hypotheses, and scale successful improvements across the enterprise.',
      offerings: [
        { title: 'Innovation Incubators', desc: 'Validated environments for rapid prototyping.' },
        { title: 'Process Refinement', desc: 'Lean methodologies applied to existing stacks.' },
        { title: 'Change Governance', desc: 'Managing the human-centric shift of innovation.' }
      ]
    },
    {
      id: 'project',
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'Comprehensive Solutions',
      subtitle: 'Full-Lifecycle Program Leadership',
      accentColor: 'border-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50/50 dark:bg-purple-900/10',
      description: 'We own the result. From initial design through to technical creation and sustained maintenance, our team provides the elite leadership required for high-stakes strategic initiatives.',
      offerings: [
        { title: 'End-to-End Delivery', desc: 'Managing complexity from start to successful finish.' },
        { title: 'Strategic Risk Management', desc: 'Proactive identification of delivery threats.' },
        { title: 'PMO Establishment', desc: 'Building internal excellence in project delivery.' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 transition-colors duration-500 font-sans pt-[112px]">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 border-b border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Service Capabilities</p>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
              Strategic Solutions for <span className="text-blue-600 dark:text-gold-500">Modern Enterprise.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10 uppercase tracking-widest">
              We design and deploy the tactical frameworks that organizations require to achieve operational excellence and lasting confidence.
            </p>
            <div className="flex flex-wrap gap-4">
               <a href="#matrix" className="px-6 py-3 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-950 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-md">View Service Matrix</a>
               <Link to="/contact" className="px-6 py-3 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Request Consultation</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE MATRIX ─────────────────────────────────────────────── */}
      <section id="matrix" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} className={`flex flex-col h-full p-8 rounded-2xl border-l-4 ${service.accentColor} ${service.bgColor} border border-slate-100 dark:border-white/5 transition-all hover:shadow-xl`}>
                <div className={`${service.textColor} mb-6`}>
                  {service.icon}
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{service.title}</h2>
                <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">{service.subtitle}</p>
                <p className="text-xs font-medium leading-relaxed mb-8 uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {service.description}
                </p>

                <div className="mt-auto space-y-4">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2">Component Modules</h4>
                  {service.offerings.map((off, j) => (
                    <div key={j} className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{off.title}</p>
                      <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">{off.desc}</p>
                    </div>
                  ))}
                  <div className="pt-6">
                    <Link to="/contact" className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${service.textColor} hover:underline`}>
                      Initiate Protocol <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-[#0a0f1d] border-y border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
              <div className="md:w-1/2">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Strategic Framework</p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Integrated Process Standards.</h2>
              </div>
              <div className="md:w-1/2">
                <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Every engagement follows a rigorous, four-stage tactical deployment to ensure the stability and security of your organization's transition from current state to optimized future state.
                </p>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: 'Diagnostic', desc: 'Identifying structural vulnerabilities.', color: 'text-blue-500' },
                { title: 'Architecture', desc: 'Designing the custom system roadmap.', color: 'text-emerald-500' },
                { title: 'Deployment', desc: 'Precision implementation.', color: 'text-purple-500' },
                { title: 'Optimization', desc: 'Sustained performance auditing.', color: 'text-rose-500' }
              ].map((step, k) => (
                <div key={k} className="p-6 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 group hover:border-slate-300 dark:hover:border-white/20 transition-all">
                   <p className="text-xs font-black text-slate-400 mb-4 tracking-tighter">PHASE 0{k+1}</p>
                   <h3 className={`text-sm font-black uppercase tracking-widest ${step.color} mb-2`}>{step.title}</h3>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ─────────────────────────────────────────── */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
           <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
              Initialize Your Transformation.
           </h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-widest mb-10 leading-relaxed max-w-2xl mx-auto">
              The Greggory Systems & Strategy Firm is ready to synchronize with your organizational goals. Contact our strategic ops center to begin the diagnostic protocol today.
           </p>
           <Link to="/contact" className="inline-block px-10 py-4 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-950 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg">
              Schedule Uplink
           </Link>
        </div>
      </section>

    </div>
  )
}

export default Services
