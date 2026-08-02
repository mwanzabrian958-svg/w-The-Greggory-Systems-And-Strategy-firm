import { Target, Eye, Heart, Award, Users, TrendingUp, CheckCircle } from 'lucide-react'

const About = () => {
  const team = [
    {
      name: 'Brian Mwanza',
      role: 'Chief Executive Officer (CEO)',
      credentials: 'PMP, PMI-ACP',
      bio: 'Leads The-Greggory-Systems-And-Strategy-firm with a focus on systems design, strategic planning, operational excellence, and client value through intelligent solutions.',
      image: '/images/brian-mwanza-ceo.jpg'
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
    <div className="bg-[#0f172a] text-white pt-[140px] relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(245,158,11,0.08),_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_rgba(45,212,191,0.05),_transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>

      {/* Hero Section Protocol */}
      <section className="relative z-10 py-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-gold-500/30 bg-gold-500/5 px-5 py-2 text-[10px] font-black text-gold-200 backdrop-blur-xl mb-10 uppercase tracking-[0.4em]">
              Protocol Established 2021 • Systems Excellence
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tight leading-[0.9] uppercase">
              Deciphering <br />
              <span className="text-gold-500">Complexity.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl uppercase tracking-widest">
              Empowering organizations through expert systems design and high-tier strategic planning.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Protocol */}
      <section className="relative z-10 py-32 bg-white text-slate-950 rounded-[60px] mx-4 sm:mx-6 lg:mx-8 shadow-2xl mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div>
                <p className="text-[10px] font-black text-gold-600 uppercase tracking-[0.4em] mb-4">Firm Origin Protocol</p>
                <h3 className="text-5xl font-black tracking-tighter uppercase">Our Genesis</h3>
              </div>
              <div className="space-y-8 text-lg text-slate-600 font-bold uppercase tracking-widest text-xs leading-relaxed">
                <p>
                  <span className="text-slate-950 font-black border-b-2 border-gold-500/40 pb-1">The-Greggory-Systems-And-Strategy-firm</span> was architected from a core observation: organizations struggle not due to a lack of vision, but a lack of systemic throughput.
                </p>
                <p>
                  We witnessed countless missions fail due to fragmented strategy and inadequate design. Today, we've synchronized over 50 global entities with high-tier architecture and operational excellence.
                </p>
                <div className="bg-slate-50 rounded-[32px] p-10 border border-slate-100 relative group overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-gold-500 group-hover:w-2 transition-all" />
                   <p className="italic text-slate-950 text-xl font-black uppercase tracking-tight leading-relaxed">
                     "Every business challenge requires a systematic solution and a high-tier strategic framework for sustainable confidence."
                   </p>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-10 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-gold-500/10 transition-all duration-1000" />
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop"
                alt="Strategic Architecture"
                className="relative z-10 rounded-[48px] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000 border-8 border-white/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Protocol */}
      <section className="relative z-10 py-32 bg-[#050b14] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To empower global entities by applying rigorous systems design, ensuring clarity, agility, and measurable systemic throughput. We transform complexity into executable strategy.' },
              { icon: Eye, title: 'Our Vision', desc: 'To be the definitive catalyst for transformative growth. We envision a landscape where every organization operates through intelligent systems architecture.' }
            ].map((box, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-2xl p-12 rounded-[48px] border border-white/10 hover:bg-white/[0.08] transition-all group shadow-2xl">
                <div className="h-20 w-20 rounded-[24px] bg-gold-500/10 flex items-center justify-center text-gold-500 mb-10 border border-gold-500/20 group-hover:scale-110 transition-transform">
                  <box.icon size={40} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-8 group-hover:text-gold-400 transition-colors">{box.title}</h3>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                  {box.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Values Protocol */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.5em] mb-4">Protocol Standards</p>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Core Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="group p-10 rounded-[40px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-gold-500/20 transition-all shadow-xl">
                <div className="text-gold-500 mb-8 transition-transform group-hover:scale-110">
                  {value.icon}
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4">{value.title}</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed group-hover:text-slate-300 transition-colors">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Protocol */}
      <section className="relative z-10 py-32 bg-white text-slate-950 rounded-[60px] mx-4 sm:mx-6 lg:mx-8 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-24">
             <p className="text-[10px] font-black text-gold-600 uppercase tracking-[0.4em] mb-4">Strategic Leadership</p>
             <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Personnel Directory</h2>
          </div>

          <div className="flex justify-center">
            {team.map((member, index) => (
              <div key={index} className="max-w-md group cursor-default">
                <div className="relative overflow-hidden rounded-[50px] mb-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-slate-200 border-8 border-white">
                  <div className="absolute inset-0 bg-gold-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-[550px] object-cover transform transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-slate-950 to-transparent z-20">
                     <p className="text-gold-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3">{member.role}</p>
                     <h4 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{member.name}</h4>
                  </div>
                </div>
                <div className="px-8 text-center">
                   <div className="inline-block px-4 py-1.5 bg-slate-950 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
                      {member.credentials}
                   </div>
                   <p className="text-slate-600 text-sm font-bold uppercase tracking-widest leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Protocol */}
      <section className="relative z-10 py-32 bg-gold-500">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tight mb-10">Sync Your Vision</h2>
            <Link to="/contact" className="inline-flex items-center justify-center px-12 py-6 bg-slate-950 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-slate-900 transition-all shadow-2xl">
               Contact Relay
            </Link>
         </div>
      </section>
    </div>
  )
}

export default About
