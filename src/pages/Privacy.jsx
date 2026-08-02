import { Link } from 'react-router-dom'
import { ArrowLeft, Database, Eye, Share2, Shield, User, Cookie, ExternalLink, Mail, Phone, MapPin } from 'lucide-react'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(45,212,191,0.1),_transparent_50%)]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/signup" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest text-xs mb-8 transition-colors">
            <ArrowLeft size={16} />
            Back to Registry
          </Link>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Privacy Protocol</h1>
          <div className="h-1.5 w-24 bg-cyan-500 mb-8 rounded-full" />
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Deployment: October 20, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Sidebar Navigation */}
            <div className="hidden lg:block lg:col-span-3 space-y-4 sticky top-32 h-fit">
              <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-6">Data Architecture</p>
              {[
                { icon: Database, label: 'Collection' },
                { icon: Eye, label: 'Usage' },
                { icon: Share2, label: 'Transmission' },
                { icon: Shield, label: 'Security' },
                { icon: User, label: 'Rights' },
                { icon: Cookie, label: 'Cookies' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors cursor-pointer group">
                  <item.icon size={18} className="group-hover:text-cyan-400" />
                  <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main Policy Text */}
            <div className="lg:col-span-9 space-y-20">

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-cyan-500">
                  <Database size={32} />
                  <h2 className="text-3xl font-black uppercase tracking-tight">1. Strategic Data Acquisition</h2>
                </div>
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                  Our systems collect information essential for high-performance strategic execution. This data is acquired directly through your interactions with our professional portals:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'Full Identity & Professional Contact Details',
                    'Corporate Parameters & Professional Metadata',
                    'Strategic Access Credentials',
                    'Project Specifications & Submissions',
                    'Biometric Profile Identifiers (Optional)'
                  ].map((text, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-cyan-500" />
                      <span className="text-sm font-bold text-slate-400">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-cyan-500">
                  <Eye size={32} />
                  <h2 className="text-3xl font-black uppercase tracking-tight">2. Operational Utilization</h2>
                </div>
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                  The primary objective of data collection is the optimization of your strategic experience. We utilize acquired intelligence to:
                </p>
                <ul className="list-none space-y-4 ml-4">
                  {[
                    'Maintain and evolve our proprietary strategic systems',
                    'Execute complex organizational transactions',
                    'Dispatch critical technical alerts and strategic updates',
                    'Engineer new frameworks tailored to your business needs',
                    'Maintain the integrity of the firm\'s professional network'
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                      <span className="text-slate-400 font-medium">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-cyan-500">
                  <Shield size={32} />
                  <h2 className="text-3xl font-black uppercase tracking-tight">3. Security Infrastructure</h2>
                </div>
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                  We implement Tier-1 technical and organizational protocols to protect your intelligence against unauthorized transmission, accidental destruction, or illicit access. Our architecture utilizes military-grade encryption and isolated data nodes to ensure absolute confidentiality.
                </p>
              </div>

              <div className="space-y-6 border-t border-white/5 pt-16">
                <div className="flex items-center gap-4 text-cyan-500">
                  <Mail size={32} />
                  <h2 className="text-3xl font-black uppercase tracking-tight">Data Governance</h2>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Shield size={120} />
                   </div>
                  <p className="text-slate-400 mb-8 font-medium relative z-10">For data deletion requests or governance inquiries, contact our Strategic Data Office:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Digital Channel</p>
                      <p className="text-white font-bold tracking-wider">brianmwanza651@gmail.com</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Voice Command</p>
                      <p className="text-white font-bold tracking-wider">+254 799 789 956</p>
                    </div>
                    <div className="col-span-full space-y-2">
                      <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Physical Node</p>
                      <p className="text-white font-bold tracking-wider">Rafiki Kabarak, Nakuru, Kenya</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer Copy */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
          &copy; {new Date().getFullYear()} THE-GREGGORY-SYSTEMS-AND-STRATEGY-FIRM. DATA INTEGRITY DIVISION.
        </p>
      </footer>
    </div>
  )
}

export default Privacy
