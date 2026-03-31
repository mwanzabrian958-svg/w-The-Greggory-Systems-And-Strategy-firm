import { ClipboardList, CalendarCheck2, CheckCircle2, Briefcase } from 'lucide-react'

const Projects = () => {
  const projects = [
    {
      icon: <Briefcase className="w-10 h-10 text-teal-600" />,
      title: 'Enterprise PMO Setup',
      summary: 'Designed and launched a scalable PMO framework to standardize delivery across business units.',
      meta: 'Duration: 6 months • Result: 25% cycle-time reduction'
    },
    {
      icon: <ClipboardList className="w-10 h-10 text-teal-600" />,
      title: 'Process Improvement Program',
      summary: 'Lean/Six Sigma engagement to eliminate waste and improve throughput in core operations.',
      meta: 'Duration: 3 months • Result: 18% efficiency gain'
    },
    {
      icon: <CalendarCheck2 className="w-10 h-10 text-teal-600" />,
      title: 'Digital Transformation Roadmap',
      summary: 'Multiyear roadmap prioritizing systems, data, and change management for sustainable growth.',
      meta: 'Horizon: 24 months • Result: staged releases on time'
    }
  ]

  const activities = [
    'Project proposal composition for clients (Apps to Websites)',
    'System creation and integration (mobile, web, and internal tools)',
    'Portfolio prioritization and benefits tracking',
    'Agile/Scrum coaching and delivery enablement',
    'Executive reporting and stakeholder management'
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Projects & Activities</h1>
          <p className="text-gray-300 max-w-3xl">A selection of initiatives we deliver for clients, along with the core activities that make results repeatable.</p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
                <div className="mb-4">{p.icon}</div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">{p.title}</h3>
                <p className="text-gray-600 mb-3">{p.summary}</p>
                <p className="text-sm text-gray-500">{p.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities List */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-8">Core Activities</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {activities.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Projects
