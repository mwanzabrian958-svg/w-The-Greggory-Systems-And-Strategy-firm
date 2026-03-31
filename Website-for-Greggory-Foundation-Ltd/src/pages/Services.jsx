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
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-gray-300">
              Comprehensive project management solutions that transform the way you do business
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Comprehensive Solutions as Your Competitive Advantage</h2>
          <p className="section-subtitle mx-auto mt-4">
            At THE GREGGORY FOUNDATION LTD, we view every aspect of your business through the lens of comprehensive solutions and specialized services. 
            Whether you're managing daily operations, pursuing innovation, or delivering critical initiatives, 
            we provide the frameworks, expertise, and leadership to ensure success.
          </p>
        </div>
      </section>

      {/* Service Details */}
      {services.map((service, index) => (
        <section 
          key={service.id} 
          id={service.id}
          className={index % 2 === 0 ? 'py-16 bg-gray-50' : 'py-16 bg-white'}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Service Overview */}
              <div className={index % 2 === 0 ? 'order-1' : 'order-2'}>
                <div className="bg-teal-100 w-20 h-20 rounded-lg flex items-center justify-center mb-6 text-teal-600">
                  {service.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
                  {service.title}
                </h2>
                <h3 className="text-xl text-teal-600 font-semibold mb-6">
                  {service.subtitle}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {service.description}
                </p>

                {/* Benefits */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h4 className="font-bold text-navy-900 mb-4 text-lg">Key Benefits:</h4>
                  <ul className="space-y-3">
                    {service.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Service Offerings */}
              <div className={index % 2 === 0 ? 'order-2' : 'order-1'}>
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h4 className="text-2xl font-bold text-navy-900 mb-6">What We Offer:</h4>
                  <div className="space-y-6">
                    {service.offerings.map((offering, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center text-teal-600 flex-shrink-0">
                          {offering.icon}
                        </div>
                        <div>
                          <h5 className="font-bold text-navy-900 mb-2">{offering.title}</h5>
                          <p className="text-gray-600 text-sm">{offering.description}</p>
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

      {/* Methodologies */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Methodologies</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We leverage industry-leading frameworks tailored to your unique needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['PMI/PMBOK', 'Agile/Scrum', 'PRINCE2', 'Lean Six Sigma'].map((method, index) => (
              <div key={index} className="text-center">
                <div className="bg-navy-800 rounded-lg p-6 hover:bg-navy-700 transition-colors">
                  <div className="text-2xl font-bold mb-2">{method}</div>
                  <div className="text-sm text-gray-300">Certified Experts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Let's discuss how our project management expertise can help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary justify-center">
              Schedule a Consultation
              <ArrowRight size={20} />
            </Link>
            <Link to="/case-studies" className="btn-secondary justify-center">
              View Our Success Stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
