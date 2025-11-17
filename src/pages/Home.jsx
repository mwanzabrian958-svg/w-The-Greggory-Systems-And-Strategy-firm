import { Link } from 'react-router-dom'
import { ArrowRight, Target, Lightbulb, CheckCircle, TrendingUp, Users, Award } from 'lucide-react'
import BrandHeader from '../components/BrandHeader'

const Home = () => {
  const services = [
    {
      icon: <Target className="w-12 h-12 text-teal-600" />,
      title: 'Business Management',
      description: 'Streamline operations and enhance organizational efficiency through strategic project management frameworks.',
      link: '/services#business'
    },
    {
      icon: <Lightbulb className="w-12 h-12 text-teal-600" />,
      title: 'Innovation & Improvement',
      description: 'Systematically foster growth and optimize processes with structured innovation and improvement projects.',
      link: '/services#innovation'
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-teal-600" />,
      title: 'Project Management',
      description: 'Expert leadership for your most critical initiatives from conception to successful completion.',
      link: '/services#project'
    }
  ]

  const stats = [
    { icon: <TrendingUp className="w-8 h-8" />, value: '150+', label: 'Projects Delivered' },
    { icon: <Users className="w-8 h-8" />, value: '50+', label: 'Happy Clients' },
    { icon: <Award className="w-8 h-8" />, value: '98%', label: 'Success Rate' }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Background Image on Right Side */}
        <div 
          className="absolute right-0 top-0 h-full w-1/3 md:w-1/2 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('/brand-header.png/suti4.PNG')" }}
        ></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-start md:justify-start mb-6">
            <BrandHeader
              size="lg"
              markOnlyOnMobile={false}
              responsive={true}
              wrapperClass="h-[144px] sm:h-[144px]"
            />
          </div>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span>THE GREGGORY FOUNDATION LTD</span>
              <span className="block text-2xl md:text-3xl font-semibold text-teal-200">
                Your Vision Delivered with Trust
              </span>
              <span className="block md:inline md:ml-4 md:pl-4 md:border-l md:border-teal-500 text-teal-200 text-xl md:text-2xl font-semibold">
                Strategic Project Development for all clients
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              The Greggory Foundation Ltd. – Turning your vision into a successfully managed project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/services" className="btn-primary bg-teal-600 hover:bg-teal-700 justify-center sm:justify-start">
                Our Services
                <ArrowRight size={20} />
              </Link>
              <Link to="/contact" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-navy-900 justify-center sm:justify-start">
                Contact Us Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title">Empowering Your Success Through Comprehensive Solutions</h2>
            <p className="section-subtitle mx-auto mt-4">
              At THE GREGGORY FOUNDATION LTD, we believe that every business challenge—from property management to specialized services—can be delivered with excellence. Through our subsidiary companies like BARAKA HOUSING AGENCY and our comprehensive service portfolio, we apply proven frameworks to unlock your organization's full potential and deliver results with trust.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Core Services</h2>
            <p className="section-subtitle mx-auto mt-4">
              Comprehensive project management solutions tailored to your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-navy-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <Link to={service.link} className="text-teal-600 font-semibold hover:text-teal-700 inline-flex items-center gap-2">
                  Learn More
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-teal-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-50 rounded-lg p-8 md:p-12">
            <svg className="w-12 h-12 text-teal-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 italic">
              "The Greggory Foundation transformed our approach to business management. Their project management expertise helped us increase efficiency by 35% and deliver projects on time, every time."
            </blockquote>
            <div className="font-semibold text-navy-900">Sarah Johnson</div>
            <div className="text-gray-600">CEO, TechInnovate Solutions</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Manage Your Success?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Let's discuss how we can help you turn your vision into reality through strategic project management.
          </p>
          <Link to="/contact" className="btn-primary bg-teal-600 hover:bg-teal-700 inline-flex">
            Get in Touch
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
