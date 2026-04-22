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
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Pricing & Proposals</h1>
            <p className="text-xl text-gray-300 mb-8">
              Transparent pricing for world-class project management consultancy
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-navy-900"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg ${billingCycle === 'annual' ? 'text-white' : 'text-gray-400'}`}>
                Annual <span className="text-teal-400 font-semibold">(Save 20%)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600">
              Flexible pricing designed to scale with your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-teal-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-teal-500 text-white px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className={`p-8 ${plan.popular ? 'bg-teal-50' : ''}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan.price.toLocaleString()}
                      </span>
                      <span className="text-gray-500 ml-2">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    {plan.originalPrice > plan.price && (
                      <div className="text-sm text-gray-500 line-through">
                        ${plan.originalPrice.toLocaleString()}/{billingCycle === 'monthly' ? 'month' : 'year'}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
                  </button>
                </div>

                <div className="px-8 pb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.excluded.map((feature, index) => (
                      <li key={index} className="flex items-start opacity-60">
                        <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="mt-12 text-center">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-teal-900 mb-2">
                  Great choice! You selected the {plans.find(p => p.id === selectedPlan)?.name} plan
                </h3>
                <p className="text-teal-700 mb-4">
                  Let's get you started with a personalized proposal
                </p>
                <Link
                  to="/contact"
                  state={{ selectedPlan, billingCycle }}
                  className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Get Custom Proposal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Custom Project Calculator */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Custom Project Calculator</h2>
            <p className="text-xl text-gray-600">
              Get an instant estimate for your specific project needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calculator Form */}
            <div>
              <form onSubmit={handleCustomProjectSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    value={customProject.type}
                    onChange={(e) => setCustomProject({...customProject, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a project type</option>
                    {projectTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Duration (months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={customProject.duration}
                    onChange={(e) => setCustomProject({...customProject, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., 3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['simple', 'medium', 'complex'].map((level) => (
                      <label key={level} className="relative">
                        <input
                          type="radio"
                          name="complexity"
                          value={level}
                          checked={customProject.complexity === level}
                          onChange={(e) => setCustomProject({...customProject, complexity: e.target.value})}
                          className="sr-only peer"
                        />
                        <div className="p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-teal-500 peer-checked:bg-teal-50 hover:border-gray-400">
                          <div className="text-center">
                            <div className="font-medium text-gray-900 capitalize">{level}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {level === 'simple' && 'Basic requirements'}
                              {level === 'medium' && 'Standard features'}
                              {level === 'complex' && 'Advanced needs'}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customProject.teamSize}
                    onChange={(e) => setCustomProject({...customProject, teamSize: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Number of team members involved"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Requirements
                  </label>
                  <textarea
                    value={customProject.requirements}
                    onChange={(e) => setCustomProject({...customProject, requirements: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Describe your project requirements..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                >
                  Get Detailed Proposal
                </button>
              </form>
            </div>

            {/* Price Estimate */}
            <div>
              <div className="bg-gray-50 rounded-lg p-8 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Price Estimate</h3>
                
                {customProject.type ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-semibold">
                        ${projectTypes.find(p => p.id === customProject.type)?.basePrice.toLocaleString()}
                      </span>
                    </div>
                    
                    {customProject.duration && (
                      <div className="flex justify-between items-center pb-4 border-b">
                        <span className="text-gray-600">Duration Multiplier</span>
                        <span className="font-semibold">{customProject.duration}x</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-gray-600">Complexity</span>
                      <span className="font-semibold capitalize">{customProject.complexity}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xl font-bold text-gray-900">Estimated Total</span>
                      <span className="text-2xl font-bold text-teal-600">
                        ${calculateCustomPrice().toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                      <div className="flex items-start">
                        <Calculator className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-teal-700">
                          <p className="font-semibold mb-1">What's included:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Dedicated project manager</li>
                            <li>• Weekly progress reports</li>
                            <li>• Performance analytics</li>
                            <li>• Documentation & training</li>
                            <li>• 30-day support after completion</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select project options to see your estimate
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Consultancy?</h2>
            <p className="text-xl text-teal-100">
              Proven results with transparent pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-6 mb-4">
                <Star className="w-12 h-12 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">98% Success Rate</h3>
              <p className="text-teal-100">
                Our projects consistently deliver on time and within budget
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-6 mb-4">
                <DollarSign className="w-12 h-12 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Clear ROI</h3>
              <p className="text-teal-100">
                Average 30% cost reduction and 40% efficiency improvement
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-6 mb-4">
                <Headphones className="w-12 h-12 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
              <p className="text-teal-100">
                24/7 access to your project team and priority support
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Pricing
