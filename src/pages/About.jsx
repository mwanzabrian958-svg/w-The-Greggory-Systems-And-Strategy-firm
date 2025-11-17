import { Target, Eye, Heart, Award, Users, TrendingUp, CheckCircle } from 'lucide-react'

const About = () => {
  const team = [
    {
      name: 'Brian Maundu Mwanza',
      role: 'Chief Executive Officer (CEO)',
      credentials: 'PMP, PMI-ACP, PRINCE2 Practitioner',
      bio: 'Leads THE GREGGORY FOUNDATION LTD with a focus on strategic delivery, operational excellence, and client value through our subsidiary companies.'
    },
    {
      name: 'Brian Maundu Mwanza',
      role: 'Director of Operations',
      credentials: 'PMP, PMI-ACP, PRINCE2 Practitioner',
      bio: 'Oversees all operational aspects with a focus on efficiency, process improvement, and service delivery.'
    },
    {
      name: 'Brian Maundu Mwanza',
      role: 'Head of Innovation',
      credentials: 'PMP, PMI-ACP, PRINCE2 Practitioner',
      bio: 'Drives innovation and digital transformation initiatives to keep the company at the forefront of project management.'
    },
    {
      name: 'Brian Maundu Mwanza',
      role: 'Senior Project Manager',
      credentials: 'PMP, PMI-ACP, PRINCE2 Practitioner',
      bio: 'Personally manages key client projects, ensuring successful delivery and client satisfaction.'
    }
  ]

  const values = [
    {
      icon: <Target className="w-10 h-10 text-teal-600" />,
      title: 'Discipline',
      description: 'We apply rigorous methodologies and proven frameworks to every engagement.'
    },
    {
      icon: <Heart className="w-10 h-10 text-teal-600" />,
      title: 'Collaboration',
      description: 'We work alongside your team as trusted partners, not external consultants.'
    },
    {
      icon: <Award className="w-10 h-10 text-teal-600" />,
      title: 'Innovation',
      description: 'We continuously evolve our practices to incorporate the latest industry insights.'
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-teal-600" />,
      title: 'Results-Driven',
      description: 'We measure success by the tangible value we deliver to your organization.'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About The Greggory Foundation</h1>
            <p className="text-xl text-gray-300">
              Empowering organizations through expert project management since 2021
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  THE GREGGORY FOUNDATION LTD was born from a simple yet powerful observation: organizations across all industries struggle not because they lack vision or talent, but because they lack the structured approach to turn ideas into reality through comprehensive solutions and specialized services.
                </p>
                <p>
                  Founded by Dr. James Greggory, a veteran project management professional with decades of experience, our foundation was built on the belief that project management is the key to unlocking business potential. We saw countless initiatives fail not due to poor concepts, but due to inadequate planning, execution, and control.
                </p>
                <p>
                  Today, we've helped over 50 organizations across diverse industries transform their approach to business management, innovation, and project delivery. Our philosophy is simple: every business challenge is a project waiting to be successfully managed.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop" 
                alt="Team collaboration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <Target className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To empower organizations by applying rigorous project management frameworks to all aspects of their business, ensuring clarity, agility, and measurable results. We transform complexity into executable strategy.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <Eye className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900">Our Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To be the catalyst for transformative and sustainable growth in every client we serve. We envision a business landscape where every organization harnesses the power of structured project management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why The Greggory Foundation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose The Greggory Foundation?</h2>
            <p className="section-subtitle mx-auto mt-4">
              We bring a unique combination of expertise, methodology, and partnership
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">Expert Team</h3>
              <p className="text-gray-600">
                Certified professionals with PMI, Agile, PRINCE2, and Lean Six Sigma credentials
              </p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">Proven Track Record</h3>
              <p className="text-gray-600">
                98% project success rate with measurable improvements in efficiency and outcomes
              </p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">Tailored Approach</h3>
              <p className="text-gray-600">
                Custom solutions designed for your industry, culture, and specific challenges
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide every engagement and every decision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-navy-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle mx-auto mt-4">
              Industry-leading experts dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src={member.image} 
                    alt={`${member.name}, ${member.role}`}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-900 mb-1">{member.name}</h3>
                  <p className="text-teal-600 font-semibold mb-2">{member.role}</p>
                  <p className="text-sm text-gray-500 mb-3">{member.credentials}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
