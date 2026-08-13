import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, Check, CheckCircle2, DollarSign, Headphones, Shield, Star, TrendingUp, Users, X, Zap } from 'lucide-react'

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [selectedPlan, setSelectedPlan] = useState('')
  const [customProject, setCustomProject] = useState({
    type: '',
    duration: '',
    complexity: 'medium',
    teamSize: '',
    requirements: ''
  })

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For lean teams building their first operating rhythm',
      price: billingCycle === 'monthly' ? 2999 : 29990,
      features: ['Up to 3 team members', 'Core project oversight', 'Monthly progress reports', 'Email support'],
      excluded: ['Dedicated project manager', 'Advanced analytics', 'Priority support'],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing organizations that need dependable support',
      price: billingCycle === 'monthly' ? 5999 : 59990,
      features: ['Up to 10 team members', 'Dedicated project manager', 'Weekly updates', 'Priority support', 'Advanced documentation'],
      excluded: ['Custom integrations', '24/7 support'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For larger organizations with multi-layer delivery needs',
      price: billingCycle === 'monthly' ? 12999 : 129990,
      features: ['Unlimited team members', 'Dedicated delivery team', 'Real-time dashboards', '24/7 support', 'Custom integrations'],
      excluded: [],
      popular: false
    }
  ]

  const projectTypes = [
    { id: 'business-management', name: 'Business Management', basePrice: 5000, icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'innovation-improvement', name: 'Innovation & Improvement', basePrice: 7500, icon: <Zap className="h-5 w-5" /> },
    { id: 'project-management', name: 'Project Management', basePrice: 10000, icon: <Users className="h-5 w-5" /> },
    { id: 'digital-transformation', name: 'Digital Transformation', basePrice: 15000, icon: <Shield className="h-5 w-5" /> }
  ]

  const calculateCustomPrice = () => {
    const projectType = projectTypes.find((p) => p.id === customProject.type)
    if (!projectType) return 0

    const duration = parseInt(customProject.duration) || 1
    const complexityMultiplier = { simple: 0.8, medium: 1, complex: 1.5 }[customProject.complexity] || 1

    return Math.round(projectType.basePrice * duration * complexityMultiplier)
  }

  return (
    <div className="page-shell pt-24">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="soft-panel overflow-hidden p-8 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Pricing</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Flexible support for organizations at different stages.
            </h1>
            <p className="mt-5 text-base text-slate-300 sm:text-lg">
              Choose a structured engagement or request a tailored proposal for a more complex initiative.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
              <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-300'}`}>Monthly</span>
              <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')} className="relative inline-flex h-8 w-14 items-center rounded-full bg-[#f8efe6]">
                <span className={`inline-block h-6 w-6 rounded-full bg-[#4c6a4d] transition-transform ${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-semibold ${billingCycle === 'annual' ? 'text-white' : 'text-slate-300'}`}>Annual</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`soft-card flex flex-col p-7 ${plan.popular ? 'ring-2 ring-[#4c6a4d]/40' : ''}`}>
              {plan.popular && (
                <div className="mb-5 inline-flex w-fit rounded-full bg-[#4c6a4d] px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  Most popular
                </div>
              )}
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{plan.name}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">KES {plan.price.toLocaleString()}</span>
                <span className="pb-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">/ {billingCycle}</span>
              </div>
              <button onClick={() => setSelectedPlan(plan.id)} className={`mt-6 rounded-2xl px-4 py-3 text-sm font-semibold transition ${selectedPlan === plan.id ? 'bg-[#4c6a4d] text-white' : 'bg-[#f6ece1] text-slate-800 hover:bg-[#efe0cf] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}>
                {selectedPlan === plan.id ? 'Selected' : 'Choose plan'}
              </button>

              <ul className="mt-8 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#4c6a4d]" />
                    {feature}
                  </li>
                ))}
                {plan.excluded.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-slate-400">
                    <X className="h-4 w-4" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="soft-card p-8 sm:p-10">
            <p className="eyebrow">Custom proposal</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Estimate a more tailored engagement.</h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Use the calculator below to get a practical estimate for a custom initiative based on scope, duration, and complexity.
            </p>

            <form className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Project type</label>
                <select value={customProject.type} onChange={(e) => setCustomProject({ ...customProject, type: e.target.value })} className="w-full rounded-2xl border border-[#e3d2bb] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                  <option value="">Select a project type</option>
                  {projectTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Duration</label>
                  <input type="number" min="1" value={customProject.duration} onChange={(e) => setCustomProject({ ...customProject, duration: e.target.value })} className="w-full rounded-2xl border border-[#e3d2bb] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="e.g. 3" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Complexity</label>
                  <select value={customProject.complexity} onChange={(e) => setCustomProject({ ...customProject, complexity: e.target.value })} className="w-full rounded-2xl border border-[#e3d2bb] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Team size</label>
                <input type="number" min="1" value={customProject.teamSize} onChange={(e) => setCustomProject({ ...customProject, teamSize: e.target.value })} className="w-full rounded-2xl border border-[#e3d2bb] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="e.g. 6" />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Requirements</label>
                <textarea rows="4" value={customProject.requirements} onChange={(e) => setCustomProject({ ...customProject, requirements: e.target.value })} className="w-full rounded-2xl border border-[#e3d2bb] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4c6a4d] focus:ring-2 focus:ring-[#dce8dc] dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="Describe the scope and any key constraints." />
              </div>
            </form>
          </div>

          <div className="soft-card p-8 sm:p-10">
            <div className="flex items-center gap-3 rounded-2xl border border-[#e3d2bb] bg-[#fbf3e8] px-4 py-3 text-sm text-[#6b4d20] dark:border-[#4f4538] dark:bg-[#231b12] dark:text-[#e2c58f]">
              <Calculator className="h-5 w-5" />
              Live estimate preview
            </div>

            {customProject.type ? (
              <div className="mt-8 space-y-6">
                <div className="rounded-3xl border border-[#e3d2bb] bg-[#f8efe6] p-6 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Estimated value</p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">KES {calculateCustomPrice().toLocaleString()}</span>
                    <span className="pb-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">estimated</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#e3d2bb] p-6 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Shield className="h-4 w-4 text-[#4c6a4d]" />
                    Included in a typical proposal
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#4c6a4d]" /> Strategic planning and delivery oversight</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#4c6a4d]" /> Scheduled check-ins and progress reporting</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#4c6a4d]" /> Documented next steps and implementation support</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-10 rounded-3xl border border-dashed border-[#e3d2bb] p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Choose a project type to see your estimate.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[{ icon: Star, title: '98% delivery parity', text: 'Projects stay aligned with agreed scope and timelines.' }, { icon: DollarSign, title: 'Focused ROI', text: 'We emphasize practical value over unnecessary overhead.' }, { icon: Headphones, title: 'Support that feels close', text: 'Your team stays informed and supported throughout delivery.' }].map((item) => (
            <div key={item.title} className="soft-card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7efe2] text-[#aa7d3f] dark:bg-[#2b2318] dark:text-[#d1a257]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Pricing
