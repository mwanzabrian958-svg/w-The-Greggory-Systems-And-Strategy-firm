import { Calendar, User, ArrowRight, BookOpen, TrendingUp, Lightbulb, Target } from 'lucide-react'

const Blog = () => {
  const articles = [
    {
      id: 1,
      title: 'Why Your Business Strategy is a Project Portfolio',
      excerpt: 'Discover how viewing your business strategy as a collection of interconnected projects can transform your organizational effectiveness and strategic execution.',
      author: 'Dr. James Greggory',
      date: 'October 15, 2024',
      readTime: '8 min read',
      category: 'Business Strategy',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
      icon: <Target className="w-6 h-6" />
    },
    {
      id: 2,
      title: '5 Project Management Principles to Improve Daily Operations',
      excerpt: 'Learn how to apply core project management principles to your everyday business operations for increased efficiency, clarity, and results.',
      author: 'Sarah Mitchell',
      date: 'October 8, 2024',
      readTime: '6 min read',
      category: 'Operations',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      id: 3,
      title: 'Agile vs. Waterfall: Choosing the Right Path for Your Innovation Project',
      excerpt: 'A comprehensive comparison of Agile and Waterfall methodologies to help you select the best approach for your specific innovation initiatives.',
      author: 'Marcus Thompson',
      date: 'October 1, 2024',
      readTime: '10 min read',
      category: 'Innovation',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=500&fit=crop',
      icon: <Lightbulb className="w-6 h-6" />
    },
    {
      id: 4,
      title: 'The Role of Change Management in Successful Business Improvement',
      excerpt: 'Why technical solutions alone aren\'t enough. Understanding the critical human element in driving sustainable business transformation.',
      author: 'Elena Rodriguez',
      date: 'September 24, 2024',
      readTime: '7 min read',
      category: 'Change Management',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      id: 5,
      title: 'Building a Project Management Office (PMO): A Starter Guide',
      excerpt: 'Step-by-step guidance on establishing a PMO that drives consistency, improves project success rates, and builds organizational capability.',
      author: 'Dr. James Greggory',
      date: 'September 17, 2024',
      readTime: '12 min read',
      category: 'Project Management',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop',
      icon: <Target className="w-6 h-6" />
    },
    {
      id: 6,
      title: 'Measuring Project Success: Beyond On-Time and On-Budget',
      excerpt: 'Expand your definition of project success with comprehensive metrics that capture true business value and stakeholder satisfaction.',
      author: 'Sarah Mitchell',
      date: 'September 10, 2024',
      readTime: '9 min read',
      category: 'Project Management',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
      icon: <TrendingUp className="w-6 h-6" />
    }
  ]

  const categories = ['All', 'Business Strategy', 'Operations', 'Innovation', 'Change Management', 'Project Management']

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog & Insights</h1>
            <p className="text-xl text-gray-300">
              Expert perspectives on project management, business strategy, and organizational excellence
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Thought Leadership in Project Management</h2>
          <p className="section-subtitle mx-auto mt-4">
            Stay informed with the latest insights, best practices, and trends in project management, 
            business operations, and organizational transformation from our team of experts.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  index === 0
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-600 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <img 
                  src={articles[0].image} 
                  alt={articles[0].title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-teal-600 mb-4">
                  {articles[0].icon}
                  <span className="font-semibold">{articles[0].category}</span>
                </div>
                <h3 className="text-3xl font-bold text-navy-900 mb-4">
                  {articles[0].title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{articles[0].author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{articles[0].date}</span>
                  </div>
                  <span>{articles[0].readTime}</span>
                </div>
                <button className="btn-primary w-fit">
                  Read Article
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map((article) => (
              <article key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="relative h-48">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-teal-600 mb-3">
                    {article.icon}
                    <span className="text-sm font-semibold">{article.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <button className="text-teal-600 font-semibold hover:text-teal-700 inline-flex items-center gap-2">
                    Read More
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-lg p-8 md:p-12 text-center text-white">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-teal-400" />
            <h2 className="text-3xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get the latest insights on project management delivered to your inbox monthly
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-grow px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button type="submit" className="btn-primary bg-teal-600 hover:bg-teal-700 whitespace-nowrap">
                Subscribe
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
            Want to Learn More About Our Services?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover how our project management expertise can transform your organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/services" className="btn-primary justify-center">
              Explore Our Services
              <ArrowRight size={20} />
            </a>
            <a href="/contact" className="btn-secondary justify-center">
              Schedule a Consultation
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Blog
