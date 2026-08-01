import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Scale, Globe, UserCheck, Lock, AlertCircle, RefreshCw, Mail, X } from 'lucide-react'

const Terms = () => {
  const [activeTopic, setActiveTopic] = useState(null)

  const topics = [
    {
      id: 'acceptance',
      icon: ShieldCheck,
      label: 'Acceptance',
      title: 'Strategic Acceptance',
      content: 'By accessing the The-Greggory-Systems-And-Strategy-firm ecosystem, you enter into a legally binding framework. This acceptance extends to all automated systems, strategic modules, and human-led consulting interfaces. Continued use of the platform after any modifications to these terms constitutes your tactical agreement to the updated governance protocols.'
    },
    {
      id: 'license',
      icon: Scale,
      label: 'Legal License',
      title: 'Professional Legal License',
      content: 'Our intellectual assets are protected under international strategic property laws. We grant you a limited, non-exclusive, non-transferable license to utilize our public-facing frameworks for internal organizational evaluation.',
      restrictions: [
        'No redistribution of proprietary systems',
        'No unauthorized commercial exploitation',
        'No reverse-engineering of strategic algorithms',
        'No removal of firm watermark or metadata',
        'No scraping of systemic data nodes'
      ]
    },
    {
      id: 'services',
      icon: Globe,
      label: 'Services',
      title: 'Service Parameters',
      content: 'The firm provides high-tier systems design and strategic leadership. We maintain absolute autonomy over service delivery methodologies. We reserve the right to suspend or terminate services for any entity that fails to meet our professional compliance standards or ethical alignment requirements.'
    },
    {
      id: 'accounts',
      icon: UserCheck,
      label: 'Accounts',
      title: 'Account Governance',
      content: 'Operational accounts are high-security assets. You are solely responsible for maintaining the confidentiality of your access keys and command center credentials. Any breach of security originating from your node must be reported to our administrative team within 60 minutes of detection.'
    },
    {
      id: 'intellectual',
      icon: Lock,
      label: 'Intellectual',
      title: 'Intellectual Dominance',
      content: 'All methodologies, custom-coded frameworks, strategic reports, and systemic blueprints delivered by The-Greggory-Systems-And-Strategy-firm remain the exclusive intellectual property of the firm unless explicitly transferred via a Tier-1 Asset Purchase Agreement. Unauthorized use of our "Out of Frame" design language or strategic wording is strictly monitored and enforced.'
    },
    {
      id: 'liability',
      icon: AlertCircle,
      label: 'Liability',
      title: 'Liability & Indemnity',
      content: 'The firm and its suppliers shall not be held liable for systemic failures resulting from external market volatility, force majeure events, or unauthorized user modifications. Our liability is capped at the total amount paid for the specific strategic module in question. You agree to indemnify and hold the firm harmless from any tactical errors resulting from the misapplication of our provided frameworks.'
    }
  ]

  // Prevent body scroll when a topic is open
  useEffect(() => {
    if (activeTopic) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [activeTopic])

  return (
    <div className="min-h-screen bg-[#07111f] text-white relative">
      {/* Global Close Button (Return Home) */}
      <Link
        to="/"
        className="fixed top-6 right-6 z-[90] h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-all duration-300 border border-white/20 shadow-2xl group"
        title="Return to Home"
      >
        <X size={24} className="transition-transform group-hover:rotate-90" />
      </Link>

      {/* Header */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#07111f] via-[#0f1f3d] to-[#172c49]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(245,158,11,0.1),_transparent_50%)]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link to="/signup" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest text-[10px] mb-6 transition-colors">
            <ArrowLeft size={14} />
            Back to Registry
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Terms of Use</h1>
          <div className="h-1 w-16 bg-amber-500 mb-6 mx-auto rounded-full" />
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Strategic Governance Framework</p>
        </div>
      </section>

      {/* Topics Grid - The "Buttons" */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic)}
                className="group relative bg-white/5 border border-white/10 p-6 rounded-2xl text-left hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/5 overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 h-24 w-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-700" />
                <topic.icon size={28} className="text-amber-500 mb-4 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-base font-black uppercase tracking-wider mb-1">{topic.label}</h3>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Protocol {topic.id.toUpperCase()}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-amber-500 text-[9px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                  Open Document <ArrowLeft className="rotate-180" size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Independent "Page" / Modal for each topic */}
      {activeTopic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-[#07111f]/95 backdrop-blur-md" onClick={() => setActiveTopic(null)} />

          <div className="relative w-full max-w-2xl bg-[#0f1f3d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            {/* Header of the Topic Page */}
            <div className="p-6 sm:p-8 border-b border-white/5 flex items-start justify-between bg-gradient-to-br from-white/[0.02] to-transparent">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <activeTopic.icon size={28} />
                </div>
                <div>
                  <p className="text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Strategic Module</p>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">{activeTopic.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setActiveTopic(null)}
                className="group h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-all duration-300 border border-white/20 shadow-lg"
                aria-label="Close"
              >
                <X size={28} className="transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Content of the Topic Page */}
            <div className="p-6 sm:p-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light mb-8">
                {activeTopic.content}
              </p>

              {activeTopic.restrictions && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="text-amber-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Mandatory Restrictions & Parameters:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {activeTopic.restrictions.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 h-1 w-1 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer of the Topic Page */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-center">
              <button
                onClick={() => setActiveTopic(null)}
                className="px-10 py-4 rounded-2xl bg-amber-500 text-slate-950 text-sm font-black uppercase tracking-widest hover:bg-amber-400 transition-all transform hover:scale-105"
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Section */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <Mail size={40} className="text-amber-500 mx-auto mb-6" />
           <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Support & Compliance</h2>
           <p className="text-slate-500 font-medium mb-8">For inquiries regarding these strategic terms, contact our administrative center:</p>
           <p className="text-white font-bold tracking-[0.2em]">brianmwanza651@gmail.com</p>
        </div>
      </section>

      {/* Footer Copy */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
          &copy; {new Date().getFullYear()} THE-GREGGORY-SYSTEMS-AND-STRATEGY-FIRM. STRATEGIC GOVERNANCE.
        </p>
      </footer>
    </div>
  )
}

export default Terms
