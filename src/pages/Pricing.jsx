import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Check, 
  X, 
  ArrowRight, 
  Calculator, 
  FileText, 
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Star,
  Zap,
  Shield,
  Headphones
} from 'lucide-react'

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [selectedPlan, setSelectedPlan] = useState('')
  const [customProject, setCustomProject] = useState({
    type: '',
    duration: '',
    complexity: 'medium',
    teamSize: '',
    budget: '',
    requirements: ''
  })

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small businesses and startups',
      price: billingCycle === 'monthly' ? 2999 : 29990,
      originalPrice: billingCycle === 'monthly' ? 3999 : 39990,
      features: [
        'Up to 3 team members',
        'Basic project management',
        'Monthly progress reports',
        'Email support',
        '1 project at a time',
        'Basic documentation',
        '5 hours consultation/month'
      ],
      excluded: [
        'Dedicated project manager',
        'Advanced analytics',
        'Custom integrations',
        'Priority support'
      ],
      popular: false,
      color: 'gray'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing businesses',
      price: billingCycle === 'monthly' ? 5999 : 59990,
      originalPrice: billingCycle === 'monthly' ? 7999 : 79990,
      features: [
        'Up to 10 team members',
        'Dedicated project manager',
        'Weekly progress reports',
        'Priority email & phone support',
        '3 projects at a time',
        'Advanced documentation',
        '15 hours consultation/month',
        'Performance analytics',
        'Custom workflows'
      ],
      excluded: [
        'Custom integrations',
        '24/7 support',
        'On-site visits'
      ],
      popular: true,
      color: 'teal'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Complete solution for large organizations',
      price: billingCycle === 'monthly' ? 12999 : 129990,
      originalPrice: billingCycle === 'monthly' ? 15999 : 159990,
      features: [
        'Unlimited team members',
        'Dedicated project team',
        'Real-time dashboards',
        '24/7 priority support',
        'Unlimited projects',
        'Comprehensive documentation',
        '40 hours consultation/month',
        'Advanced analytics & AI insights',
        'Custom integrations',
        'On-site visits (2/month)',
        'Training & workshops',
        'SLA guarantees'
      ],
      excluded: [],
      popular: false,
      color: 'navy'
    }
  ]

  const projectTypes = [
    {
      id: 'business-management',
      name: 'Business Management',
      description: 'Streamline operations and enhance organizational efficiency',
      basePrice: 5000,
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      id: 'innovation-improvement',
      name: 'Innovation & Improvement',
      description: 'Systematic process optimization and innovation frameworks',
      basePrice: 7500,
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'project-management',
      name: 'Project Management',
      description: 'End-to-end project leadership and delivery',
      basePrice: 10000,
      icon: <Users className="w-6 h-6" />
    },
    {
      id: 'digital-transformation',
      name: 'Digital Transformation',
      description: 'Complete digital strategy and implementation',
      basePrice: 15000,
      icon: <Shield className="w-6 h-6" />
    }
  ]

  const calculateCustomPrice = () => {
    const projectType = projectTypes.find(p => p.id === customProject.type)
    if (!projectType) return 0

    let basePrice = projectType.basePrice
    const duration = parseInt(customProject.duration) || 1
    const complexityMultiplier = {
      'simple': 0.8,
      'medium': 1,
      'complex': 1.5
    }[customProject.complexity] || 1

    return Math.round(basePrice * duration * complexityMultiplier)
  }

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId)
  }

  const handleCustomProjectSubmit = (e) => {
    e.preventDefault()
    // Redirect to contact with project details
    const projectDetails = {
      type: 'custom-proposal',
      ...customProject,
      estimatedPrice: calculateCustomPrice()
    }
    // In a real app, this would navigate to a proposal page or contact form
    console.log('Custom project submission:', projectDetails)
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
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-4">Capital Protocol</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">System Allocation</h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed uppercase tracking-widest mb-12">
              Transparent resource mapping for high-tier strategic consultancy and implementation.
            </p>
            
            {/* Billing Toggle Protocol */}
            <div className="flex items-center justify-center space-x-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-fit mx-auto shadow-2xl">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
                Operational Cycle
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-gold-500 transition-all focus:outline-none shadow-[0_0_15px_rgba(234,179,8,0.3)]"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-slate-950 transition-transform shadow-lg ${
                    billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${billingCycle === 'annual' ? 'text-gold-500' : 'text-slate-500'}`}>
                Strategic Cycle <span className="text-teal-400 italic">(Delta: -20%)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Protocol */}
      <section className="relative z-10 py-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white/5 backdrop-blur-2xl rounded-[40px] border transition-all duration-500 hover:bg-white/[0.08] hover:-translate-y-2 flex flex-col group ${
                  plan.popular ? 'border-gold-500/40 shadow-[0_0_50px_rgba(234,179,8,0.1)]' : 'border-white/10 shadow-2xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-8 right-8 bg-gold-500 text-slate-950 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                    Optimum Protocol
                  </div>
                )}
                
                <div className="p-10 border-b border-white/5">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-gold-400 transition-colors">{plan.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{plan.description}</p>
                  
                  <div className="mt-10 mb-10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white tracking-tighter">
                        KES {plan.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        / {billingCycle === 'monthly' ? 'Operational' : 'Strategic'} Cycle
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl ${
                      selectedPlan === plan.id
                        ? 'bg-teal-500 text-slate-950 shadow-teal-500/20'
                        : plan.popular
                          ? 'bg-gold-500 text-slate-950 hover:bg-gold-400 shadow-gold-500/20'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Protocol Initialized' : 'Initialize Protocol'}
                  </button>
                </div>

                <div className="p-10 flex-grow">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6">Integrated Modules:</p>
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start group/feature">
                        <Check className="w-4 h-4 text-teal-500 mr-4 flex-shrink-0 mt-0.5 group-hover/feature:scale-125 transition-transform" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover/feature:text-white transition-colors">{feature}</span>
                      </li>
                    ))}
                    {plan.excluded.map((feature, index) => (
                      <li key={index} className="flex items-start opacity-30 grayscale">
                        <X className="w-4 h-4 text-slate-500 mr-4 flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="mt-16 animate-fade-in">
              <div className="bg-teal-500/5 backdrop-blur-2xl border border-teal-500/20 rounded-[40px] p-10 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.05]">
                   <CheckCircle className="w-32 h-32 text-teal-400" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.4em] mb-2">Protocol Ready</p>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
                      {plans.find(p => p.id === selectedPlan)?.name} Level Synchronization Initialized
                    </h3>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                      Finalize the strategic proposal for your {billingCycle} deployment cycle.
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    state={{ selectedPlan, billingCycle }}
                    className="whitespace-nowrap px-10 py-5 bg-teal-500 text-slate-950 rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20"
                  >
                    Sync Proposal Protocol
                    <ArrowRight className="w-4 h-4 ml-3 inline-block" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Custom Project Calculator Protocol */}
      <section className="relative z-10 py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-4">Module Estimator</p>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Deployment Calculator</h2>
            <p className="text-lg text-slate-500 font-bold uppercase tracking-widest mt-4">
              Real-time capital mapping for unique mission parameters
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Calculator Form Protocol */}
            <div>
              <form onSubmit={handleCustomProjectSubmit} className="space-y-8">
                <div className="bg-white/5 rounded-[32px] p-10 border border-white/10 shadow-2xl">
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">
                        Mission Classification
                      </label>
                      <select
                        value={customProject.type}
                        onChange={(e) => setCustomProject({...customProject, type: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[11px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
                        required
                      >
                        <option value="" className="bg-slate-900">Select Classification</option>
                        {projectTypes.map((type) => (
                          <option key={type.id} value={type.id} className="bg-slate-900">
                            {type.name.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">
                        Deployment Duration (Cycles)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={customProject.duration}
                        onChange={(e) => setCustomProject({...customProject, duration: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
                        placeholder="e.g., 3 months"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 ml-2">
                        Protocol Complexity
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['simple', 'medium', 'complex'].map((level) => (
                          <label key={level} className="relative group cursor-pointer">
                            <input
                              type="radio"
                              name="complexity"
                              value={level}
                              checked={customProject.complexity === level}
                              onChange={(e) => setCustomProject({...customProject, complexity: e.target.value})}
                              className="sr-only peer"
                            />
                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl transition-all peer-checked:border-gold-500 peer-checked:bg-gold-500/10 hover:bg-white/[0.08] group-hover:border-white/20">
                              <div className="text-center">
                                <div className="font-black text-white uppercase tracking-widest text-[10px] peer-checked:text-gold-500 transition-colors">{level}</div>
                                <div className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter mt-2 group-hover:text-slate-400 transition-colors">
                                  {level === 'simple' && 'Baseline'}
                                  {level === 'medium' && 'Standard'}
                                  {level === 'complex' && 'Tier-0'}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">
                        Personnel Load
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={customProject.teamSize}
                        onChange={(e) => setCustomProject({...customProject, teamSize: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
                        placeholder="Expected personnel nodes"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">
                        Mission Requirements
                      </label>
                      <textarea
                        value={customProject.requirements}
                        onChange={(e) => setCustomProject({...customProject, requirements: e.target.value})}
                        rows="4"
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all resize-none"
                        placeholder="Define detailed mission parameters..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-5 bg-gold-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20"
                    >
                      Initialize Proposal Protocol
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Price Estimate Protocol */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] p-12 border border-white/10 sticky top-40 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                   <Calculator className="w-48 h-48" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-10 relative z-10">Capital Telemetry</h3>
                
                {customProject.type ? (
                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Protocol Capital</span>
                      <span className="text-sm font-black text-white">
                        KES {projectTypes.find(p => p.id === customProject.type)?.basePrice.toLocaleString()}
                      </span>
                    </div>
                    
                    {customProject.duration && (
                      <div className="flex justify-between items-center pb-6 border-b border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Multiplier</span>
                        <span className="text-sm font-black text-gold-500">{customProject.duration} Cycle Units</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Complexity Index</span>
                      <span className="text-sm font-black text-white uppercase tracking-widest">{customProject.complexity}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-6">
                      <span className="text-xs font-black text-white uppercase tracking-[0.3em]">Estimated Allocation</span>
                      <span className="text-4xl font-black text-gold-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                        KES {calculateCustomPrice().toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="mt-12 p-8 bg-gold-500/5 rounded-3xl border border-gold-500/20">
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 text-gold-500 mr-4 flex-shrink-0 mt-0.5" />
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <p className="font-black text-gold-500 mb-4 tracking-[0.2em]">Protocol Standard Inclusion:</p>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gold-500/40 rounded-full"></div> Dedicated Strategic Lead</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gold-500/40 rounded-full"></div> Bi-Weekly Telemetry Reports</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gold-500/40 rounded-full"></div> Integrated Performance Analytics</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gold-500/40 rounded-full"></div> Systemic Documentation Registry</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gold-500/40 rounded-full"></div> 30-Day Post-Mission Protocol Support</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 relative z-10">
                    <div className="mb-8 p-10 bg-white/5 rounded-[40px] border border-white/10 inline-block">
                       <Calculator className="w-16 h-16 text-slate-700" />
                    </div>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">
                      Awaiting Mission Parameters...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Protocol */}
      <section className="relative z-10 py-32 bg-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.5em] mb-4 opacity-60">Validation Matrix</p>
            <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tight">The Greggory Standard</h2>
            <div className="h-1.5 w-24 bg-slate-950 mx-auto mt-8 rounded-full opacity-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Star, title: '98% Delivery Parity', desc: 'Missions consistently synchronized within temporal and capital parameters.', val: '98%' },
              { icon: DollarSign, title: 'Strategic ROI', desc: 'Average 30% capital efficiency and 40% systemic throughput optimization.', val: 'ROI+' },
              { icon: Headphones, title: 'Constant Uplink', desc: '24/7 direct relay to strategic personnel and priority synchronization.', val: '24/7' }
            ].map((item, i) => (
              <div key={i} className="group relative">
                <div className="bg-slate-950 rounded-[40px] p-10 h-full border-4 border-slate-950 shadow-2xl transform transition-all hover:scale-105">
                  <div className="bg-gold-500/10 rounded-3xl p-6 mb-8 w-fit mx-auto border border-gold-500/20 group-hover:bg-gold-500 group-hover:text-slate-950 transition-all">
                    <item.icon className="w-10 h-10 text-gold-500 group-hover:text-slate-950" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 text-center">{item.title}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="absolute -top-4 -right-4 bg-slate-900 text-gold-500 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-slate-950 group-hover:bg-white group-hover:text-slate-950 transition-all shadow-xl">
                    {item.val}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Pricing
