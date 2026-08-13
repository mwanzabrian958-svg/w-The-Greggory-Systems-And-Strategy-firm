import React from 'react'
import { ArrowRight, Workflow, Compass, Rocket, ShieldCheck, Command, Microscope, Radio, Layers3, Orbit, Zap, Heart, Cpu, Globe, BarChart3, Binary, Eye, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

const Services = () => {
  return (
    <div className="relative min-h-screen bg-[#fdfaf6] text-[#111] pt-32 selection:bg-[#8fb28a] selection:text-white font-sans overflow-x-hidden">

      {/* 1. HERO SECTION - Broadly defined, professional typography */}
      <section className="w-full px-6 lg:px-20 mb-32">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 border-b border-black/5 pb-20">
          <div className="lg:w-2/3">
            <div className="flex items-center gap-3 opacity-60 mb-8">
              <Command className="w-4 h-4 text-black" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Service Compendium / Vol. 01</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-black">
              An Architectural Blueprint for <br />
              <span className="text-[#8fb28a] italic">Organizational Evolution.</span>
            </h1>
          </div>
          <div className="lg:w-1/3">
            <p className="text-base text-black leading-relaxed font-normal">
              This page serves as a comprehensive index of the systemic capabilities we deploy today and the strategic innovations we are architecting for the future.
            </p>
          </div>
        </div>
      </section>

      {/* 2. THE COMPACT SERVICE BOOK - Dense, informative chapters */}
      <section className="w-full px-6 lg:px-20 mb-40">

        {/* CHAPTER 01: CURRENT OFFERINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-40">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-4">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#8fb28a]">CURRENT CAPABILITIES</h2>
               <h3 className="text-2xl font-bold text-black">01 / Operations Architecture</h3>
               <p className="text-sm text-black leading-relaxed">The immediate restructuring of how work, decisions, and accountability move through the organization.</p>
               <div className="h-px w-full bg-black/10" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-12">
            <p className="text-base text-black leading-[1.8] max-w-4xl">
              We design the fundamental mechanics of accountability. This is not a theoretical exercise in organizational charting; it is a tactical intervention into the literal flow of energy and information. Our work ensures that every individual knows not just what to do, but how their contribution triggers the next phase of the systemic cycle.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[40%_60%_70%_30%/40%_40%_60%_60%] bg-[#8fb28a]/15 flex items-center justify-center">
                    <Workflow className="w-6 h-6 text-[#4c6a4d]" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Workflow Engineering</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">We trace the path of every core task from inception to completion, identifying the points of friction, redundancy, and leakage. We then re-engineer these paths to ensure maximum velocity with minimum effort.</p>
              </div>
              <div className="space-y-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-[#8fb28a]/15 flex items-center justify-center">
                    <Compass className="w-6 h-6 text-[#4c6a4d]" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Decision Protocols</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">Decision paralysis is the greatest tax on momentum. We establish clear protocols for who owns which choices, when to escalate, and how to document outcomes for systemic learning.</p>
              </div>
              <div className="space-y-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[30%_70%_70%_30%/50%_50%_50%_50%] bg-[#8fb28a]/15 flex items-center justify-center">
                    <Layers3 className="w-6 h-6 text-[#4c6a4d]" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Operating Rhythms</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">We synchronize the cadence of your team. By defining the specific purpose, input, and output of every recurring meeting or report, we turn "communication" into "coordination."</p>
              </div>
              <div className="space-y-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[50%_50%_50%_50%/30%_70%_30%_70%] bg-[#8fb28a]/15 flex items-center justify-center">
                    <Target className="w-6 h-6 text-[#4c6a4d]" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Accountability Mapping</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">We define the ownership of outcomes. By aligning individual incentives with systemic goals, we create an environment where high performance is the natural byproduct of the structure.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CHAPTER 02: TRANSFORMATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-40 pt-20 border-t border-black/5">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-4">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#aa7d3f]">TRANSFORMATION</h2>
               <h3 className="text-2xl font-bold text-black">02 / Transformation Guidance</h3>
               <p className="text-sm text-black leading-relaxed">Navigating the human and technical complexity of large-scale organizational shifts.</p>
               <div className="h-px w-full bg-black/10" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-12">
            <p className="text-base text-black leading-[1.8] max-w-4xl">
              Change is a technical challenge, but adoption is a human one. Our transformation guidance is designed to bridge the gap between "the new plan" and "the new habit." We work alongside leadership to ensure that evolution doesn't cause a breakdown in trust or culture, but instead becomes a unifying narrative for the entire firm.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[70%_30%_30%_70%/60%_40%_60%_40%] bg-[#aa7d3f]/15 flex items-center justify-center">
                    <Microscope className="w-6 h-6 text-[#aa7d3f]" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Systemic Change Planning</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">We develop roadmaps that account for both technical milestones and cultural readiness. We sequence changes to minimize disruption and maximize early wins that build momentum.</p>
              </div>
              <div className="space-y-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[40%_60%_60%_40%/30%_70%_70%_30%] bg-[#aa7d3f]/15 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-[#aa7d3f]" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Stakeholder Resonance</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">We identify and engage the key influencers within your organization. By aligning their personal vision with the firm's evolution, we turn potential resistance into active stewardship.</p>
              </div>
              <div className="space-y-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[50%_50%_20%_80%/80%_20%_50%_50%] bg-[#aa7d3f]/15 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#aa7d3f]" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Adoption Stewardship</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">We provide the hands-on support needed to turn the new architecture into a daily reality. From workshop facilitation to executive coaching, we ensure the change "sticks."</p>
              </div>
              <div className="space-y-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[30%_70%_30%_70%/70%_30%_70%_30%] bg-[#aa7d3f]/15 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-[#aa7d3f]" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Impact Verification</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">We establish feedback loops to measure the real impact of the transformation. We adjust the strategy in real-time based on the actual systemic response.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CHAPTER 03: FUTURE HORIZON */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-40 pt-20 border-t border-black/5">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-4">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">FUTURE HORIZON</h2>
               <h3 className="text-2xl font-bold text-black">03 / Strategic Innovations</h3>
               <p className="text-sm text-black leading-relaxed">Previewing the next generation of systemic tools we are currently architecting.</p>
               <div className="h-px w-full bg-black/10" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-12">
            <p className="text-base text-black leading-[1.8] max-w-4xl">
              The firm is committed to the frontier of organizational design. We are currently developing a suite of advanced services that leverage emerging technology to create even deeper levels of resonance and clarity. These are the tools that will define the next decade of strategic execution.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4 group opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">AI-Driven Decision Ops</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">Integrating custom LLM architectures into the firm's decision protocols to provide real-time strategic insights and automated workflow optimization based on internal data signals.</p>
              </div>
              <div className="space-y-4 group opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <Binary className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Digital Twin Modeling</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">Creating high-fidelity digital replicas of an organization's operating system to simulate the impact of strategic changes before they are implemented in the real environment.</p>
              </div>
              <div className="space-y-4 group opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Global Resilience Systems</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">Designing "borderless" operating models for companies expanding into volatile international markets, ensuring systemic integrity across diverse regulatory and cultural landscapes.</p>
              </div>
              <div className="space-y-4 group opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-black">Predictive Pulse Dashboards</h4>
                </div>
                <p className="text-sm text-black leading-relaxed">Moving beyond static KPIs to real-time "resonance metrics" that predict organizational friction before it impacts the bottom line.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ENGAGEMENT MODEL - DENSE AND BROAD */}
      <section className="w-full px-6 lg:px-20 mb-80 bg-slate-50 py-40 border-y border-black/5">
        <div className="max-w-4xl mb-32">
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#aa7d3f] mb-6">Engagement Model</h2>
          <p className="text-3xl md:text-5xl font-bold tracking-tight text-black leading-none">The path from diagnostic <br /> to <span className="italic">delivered reality.</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <span className="text-6xl font-black text-black/5 select-none tracking-tighter">01</span>
              <h4 className="text-xl font-bold text-black tracking-tight">Diagnostic Framing</h4>
            </div>
            <p className="text-sm text-black leading-relaxed">We conduct a deep-tissue scan of the organization's current operating rhythm. We don't just ask what's wrong; we observe where the momentum is leaking and what structural legacy is holding the vision back.</p>
            <ul className="space-y-3 pt-4 border-t border-black/5">
              <li className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40"><ArrowRight className="w-3 h-3" /> Systemic Mapping</li>
              <li className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40"><ArrowRight className="w-3 h-3" /> Friction Audits</li>
            </ul>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <span className="text-6xl font-black text-black/5 select-none tracking-tighter">02</span>
              <h4 className="text-xl font-bold text-black tracking-tight">Architecture Design</h4>
            </div>
            <p className="text-sm text-black leading-relaxed">We architect a bespoke solution that fits the firm's unique cadence. This isn't a template; it's a precision-engineered model designed to be owned and maintained by your people, not ours.</p>
            <ul className="space-y-3 pt-4 border-t border-black/5">
              <li className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40"><ArrowRight className="w-3 h-3" /> Protocol Engineering</li>
              <li className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40"><ArrowRight className="w-3 h-3" /> Flow Prototyping</li>
            </ul>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <span className="text-6xl font-black text-black/5 select-none tracking-tighter">03</span>
              <h4 className="text-xl font-bold text-black tracking-tight">Active Activation</h4>
            </div>
            <p className="text-sm text-black leading-relaxed">We transition the design into the real world. We stay until the new operating system is breathing on its own, ensuring that the firm's momentum is self-sustaining and the strategy is lived daily.</p>
            <ul className="space-y-3 pt-4 border-t border-black/5">
              <li className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40"><ArrowRight className="w-3 h-3" /> Habit Stewardship</li>
              <li className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40"><ArrowRight className="w-3 h-3" /> Resilience Testing</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION - Broad Fluid Exit */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-[#223028] transition-transform duration-[4s] hover:scale-105"
          style={{
            borderRadius: '100% 100% 0 0 / 100% 100% 0 0',
            transform: 'translateY(10%)'
          }}
        />

        <div className="relative z-10 text-center px-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-none tracking-tight mb-10">
            INITIATE <br />
            <span className="italic font-light text-[#8fb28a]">RESONANCE.</span>
          </h2>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-6 text-xl font-bold text-white hover:text-[#8fb28a] transition-all"
          >
            START THE WORK
            <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  )
}

export default Services
