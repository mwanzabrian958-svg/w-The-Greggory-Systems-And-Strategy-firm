import React, { useRef } from 'react'
import { ArrowRight, Workflow, Compass, Rocket, ShieldCheck, Command, Microscope, Radio, Layers3, Orbit, Zap, Heart, Cpu, Globe, BarChart3, Binary, Eye, Target, Activity, Fingerprint, ShieldAlert, Terminal, Search, PenTool, Database, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Services = () => {
  const scrollRefs = {
    diagnostic: useRef(null),
    protocol: useRef(null),
    flow: useRef(null),
    habit: useRef(null),
    resilience: useRef(null)
  }

  const scrollToTopic = (id) => {
    scrollRefs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative min-h-screen bg-[#fdfaf6] text-[#111] pt-32 selection:bg-[#8fb28a] selection:text-white font-sans overflow-x-hidden">

      {/* 1. HERO SECTION */}
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
              This is the full index of what we do today and where we are headed — project development, maintenance, upgrades, and upkeep for individuals and organizations alike, for profit and for purpose — backed by the business consultancy that turns delivery into lasting success.
            </p>
          </div>
        </div>
      </section>

      {/* 2. THE COMPACT SERVICE BOOK - CURRENT CAPABILITIES */}
      <section className="w-full px-6 lg:px-20 mb-40">
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
              We design the fundamental mechanics of accountability. This is tactical intervention into the literal flow of energy and information.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { icon: Workflow, name: 'Workflow Engineering', desc: 'Tracing the path of core tasks, identifying friction, and re-engineering for maximum velocity.' },
                { icon: Compass, name: 'Decision Protocols', desc: 'Clear protocols for ownership, escalation, and documentation to eliminate decision paralysis.' },
                { icon: Layers3, name: 'Operating Rhythms', desc: 'Synchronizing cadence. Defining purpose, input, and output of coordination nodes.' },
                { icon: Target, name: 'Accountability Mapping', desc: 'Defining ownership of outcomes. Aligning incentives with systemic goals.' }
              ].map(item => (
                <div key={item.name} className="space-y-4 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#8fb28a]/15 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-[#4c6a4d]" />
                    </div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-black">{item.name}</h4>
                  </div>
                  <p className="text-sm text-black leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TRANSFORMATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-40 pt-20 border-t border-black/5">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-4">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#aa7d3f]">TRANSFORMATION</h2>
               <h3 className="text-2xl font-bold text-black">02 / Transformation Guidance</h3>
               <p className="text-sm text-black leading-relaxed">Navigating human and technical complexity of large-scale organizational shifts.</p>
               <div className="h-px w-full bg-black/10" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-12">
            <p className="text-base text-black leading-[1.8] max-w-4xl">
              Change is technical, but adoption is human. We bridge the gap between "the plan" and "the habit."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { icon: Microscope, name: 'Change Planning', desc: 'Roadmaps accounting for technical milestones and cultural readiness.' },
                { icon: Radio, name: 'Stakeholder Resonance', desc: 'Aligning personal vision with firm evolution to turn resistance into stewardship.' },
                { icon: ShieldCheck, name: 'Adoption Stewardship', desc: 'Hands-on support turning architecture into reality. Ensuring change sticks.' },
                { icon: Eye, name: 'Impact Verification', desc: 'Feedback loops measuring real impact and adjusting strategy in real-time.' }
              ].map(item => (
                <div key={item.name} className="space-y-4 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#aa7d3f]/15 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-[#aa7d3f]" />
                    </div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-black">{item.name}</h4>
                  </div>
                  <p className="text-sm text-black leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FUTURE HORIZON */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-40 pt-20 border-t border-black/5">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-4">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">FUTURE HORIZON</h2>
               <h3 className="text-2xl font-bold text-black">03 / Strategic Innovations</h3>
               <p className="text-sm text-black leading-relaxed">The next generation of systemic tools we are currently architecting.</p>
               <div className="h-px w-full bg-black/10" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { icon: Cpu, name: 'AI-Driven Decision Ops', desc: 'Integrating custom LLM architectures for real-time strategic insights.' },
                { icon: Binary, name: 'Digital Twin Modeling', desc: 'Digital replicas of your operating system to simulate change impact.' },
                { icon: Globe, name: 'Global Resilience Systems', desc: 'Border-less models for volatile international markets.' },
                { icon: BarChart3, name: 'Predictive Pulse Dashboards', desc: 'Real-time resonance metrics that predict organizational friction.' }
              ].map(item => (
                <div key={item.name} className="space-y-4 group opacity-70 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-black">{item.name}</h4>
                  </div>
                  <p className="text-sm text-black leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE EXPANDED ENGAGEMENT MODEL - MASSIVE SCROLLING JOURNEY */}
      <section className="w-full bg-slate-50 border-y border-black/5">

        {/* Engagement Hero */}
        <div className="w-full px-6 lg:px-20 py-24 bg-white">
          <div className="max-w-4xl">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#aa7d3f] mb-6">Engagement Model</h2>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-black leading-[1] mb-8">
              The path from diagnostic <br /> to <span className="italic text-[#8fb28a]">delivered reality.</span>
            </h3>
            <p className="text-lg text-black/60 max-w-2xl leading-relaxed mb-16">
              We don't just deliver reports; we architect and activate living systems. Our engagement model is a sequential hardening of your organization's core.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <button onClick={() => scrollToTopic('diagnostic')} className="group text-left p-8 bg-white border border-black/5 hover:border-black/20 transition-all shadow-sm">
                  <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Phase 01</span>
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-4 group-hover:text-[#8fb28a]">Diagnostic Framing</h4>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase text-[#aa7d3f] opacity-60 group-hover:opacity-100">
                     Explore Node <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </div>
               </button>
               <button onClick={() => scrollToTopic('protocol')} className="group text-left p-8 bg-white border border-black/5 hover:border-black/20 transition-all shadow-sm">
                  <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Phase 02</span>
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-4 group-hover:text-[#8fb28a]">Architecture Design</h4>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase text-[#aa7d3f] opacity-60 group-hover:opacity-100">
                     Explore Node <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </div>
               </button>
               <button onClick={() => scrollToTopic('habit')} className="group text-left p-8 bg-white border border-black/5 hover:border-black/20 transition-all shadow-sm">
                  <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Phase 03</span>
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-4 group-hover:text-[#8fb28a]">Active Activation</h4>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase text-[#aa7d3f] opacity-60 group-hover:opacity-100">
                     Explore Node <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </div>
               </button>
            </div>
          </div>
        </div>

        {/* PHASE 01: DIAGNOSTIC */}
        <div ref={scrollRefs.diagnostic} className="w-full px-6 lg:px-20 py-24 border-t border-black/5 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-5">
              <span className="text-[6rem] font-black text-gray-700 leading-none select-none">01</span>
              <h4 className="text-2xl font-bold uppercase tracking-tight text-black mb-8">Diagnostic Framing.</h4>
              <div className="p-8 bg-black text-white space-y-6 relative overflow-hidden">
                <Search className="absolute -bottom-10 -right-10 w-24 h-24 text-white/[0.05]" />
                <p className="text-xl font-serif italic text-[#8fb28a] leading-tight">
                  "Has this ever happened before, or is it the first time?" <br />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">(Ama ndio mara ya kwanza?)</span>
                </p>
                <p className="text-sm text-white/60 leading-relaxed font-light">
                  This is the fundamental diagnostic prompt. In every crisis or failure, we start here. Most organizations treat every problem as a "first time" occurrence, which leads to reactive chaos. Our framing identifies whether you are facing a structural legacy issue or a genuine systemic anomaly.
                </p>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-8">
                <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#aa7d3f] border-b border-black/10 pb-4">Extensive Protocol: Systemic Mapping</h5>
                <p className="text-lg text-black/70 leading-relaxed">
                  We conduct a deep-tissue scan of the organization's current operating rhythm. We don't just ask what's wrong; we observe where the momentum is leaking. We map the literal flow of information across every department, identifying the invisible "friction points" that drain team energy.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                   <div className="space-y-2">
                      <span className="block font-black text-[10px] uppercase opacity-40">Methodology</span>
                      <p className="text-xs font-medium">Kinetic energy audits. Measuring the literal speed of decision transfer between leadership and execution nodes.</p>
                   </div>
                   <div className="space-y-2">
                      <span className="block font-black text-[10px] uppercase opacity-40">Objective</span>
                      <p className="text-xs font-medium">Identifying structural legacy debt that holds back the vision. Eliminating ad-hoc reactive decision making.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PHASE 02: ARCHITECTURE DESIGN (Protocol Engineering & Flow Prototyping) */}
        <div className="w-full px-6 lg:px-20 py-24 bg-white border-y border-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24">
            <div className="lg:col-span-5">
              <span className="text-[6rem] font-black text-gray-700 leading-none select-none">02</span>
              <h4 className="text-2xl font-bold uppercase tracking-tight text-black mb-8">Architecture Design.</h4>
              <p className="text-base text-black/60 leading-relaxed">
                Once the diagnostic is complete, we architect the bespoke solution. This isn't a template; it's a precision-engineered model designed to be owned and maintained by your people, not ours.
              </p>
            </div>
          </div>

          {/* TOPIC: PROTOCOL ENGINEERING */}
          <div ref={scrollRefs.protocol} className="grid grid-cols-1 lg:grid-cols-12 gap-20 py-24 border-t border-black/5 scroll-mt-20">
            <div className="lg:col-span-4 space-y-8">
               <div className="w-16 h-16 bg-black flex items-center justify-center">
                  <Terminal className="w-8 h-8 text-white" />
               </div>
               <h4 className="text-3xl font-bold uppercase tracking-tighter text-black">Protocol <br/> Engineering.</h4>
               <p className="text-[10px] font-mono text-black/40 uppercase tracking-[0.3em]">Systemic Specification 1.0.4</p>
            </div>
            <div className="lg:col-span-8 space-y-12">
               <p className="text-xl font-medium tracking-tight text-black/90 leading-tight">
                  We specialize in the meticulous design of organizational protocols that transcend simple SOPs. We treat business processes as critical system code.
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                  <div className="space-y-4">
                     <h5 className="font-bold uppercase tracking-widest text-[10px] border-b border-black/10 pb-2 text-[#8fb28a]">Logic Gate Design</h5>
                     <p className="text-sm text-black/60 leading-relaxed">Every organizational decision is a logic gate. We map these gates to ensure there are no "null pointers" in your decision-making tree. By formalizing the criteria for every major transition, we eliminate the ambiguity that leads to systemic drift.</p>
                  </div>
                  <div className="space-y-4">
                     <h5 className="font-bold uppercase tracking-widest text-[10px] border-b border-black/10 pb-2 text-[#8fb28a]">Systemic Redundancy</h5>
                     <p className="text-sm text-black/60 leading-relaxed">We engineer protocols that survive the loss of "key nodes" (personnel or resources). This ensures that the firm's intelligence is distributed across the architecture rather than concentrated in vulnerable individuals.</p>
                  </div>
               </div>
               <div className="p-8 bg-[#fdfaf6] border border-black/5 space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Technical Specifications</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-mono text-[10px]">
                     <div className="space-y-1">
                        <span className="text-black font-bold uppercase">L-Velocity</span>
                        <p className="opacity-60">The speed at which a decision traverses the logic tree from input to execution.</p>
                     </div>
                     <div className="space-y-1">
                        <span className="text-black font-bold uppercase">E-Resonance</span>
                        <p className="opacity-60">The percentage of adherence to the protocol without manual override or error.</p>
                     </div>
                     <div className="space-y-1">
                        <span className="text-black font-bold uppercase">Shadow Paths</span>
                        <p className="opacity-60">Activation rate of secondary protocols during primary system compromise.</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* TOPIC: FLOW PROTOTYPING */}
          <div ref={scrollRefs.flow} className="grid grid-cols-1 lg:grid-cols-12 gap-20 py-24 border-t border-black/5 scroll-mt-20">
            <div className="lg:col-span-4 space-y-8">
               <div className="w-16 h-16 bg-[#8fb28a] flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
               </div>
               <h4 className="text-3xl font-bold uppercase tracking-tighter text-black">Flow <br/> Prototyping.</h4>
               <p className="text-[10px] font-mono text-black/40 uppercase tracking-[0.3em]">Kinetic Optimization Spec</p>
            </div>
            <div className="lg:col-span-8 space-y-12">
               <p className="text-xl font-medium tracking-tight text-black/90 leading-tight">
                  Before committing to permanent structural change, we model the movement of energy and capital in a simulated sandbox.
               </p>
               <div className="space-y-8">
                  <p className="text-sm text-black/60 leading-relaxed font-light border-l-2 border-[#8fb28a] pl-8">
                    "We simulate 'first-time' scenarios to see how the flow breaks, ensuring your actual operations never have to experience a catastrophic 'first time' without a roadmap."
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <h5 className="font-bold uppercase tracking-widest text-[10px] text-black">Kinetic Mapping</h5>
                        <p className="text-[12px] text-black/60 leading-relaxed">Visualizing your organization as a series of pipes and reservoirs. Identifying where information "pools" for too long, causing strategic stagnation.</p>
                     </div>
                     <div className="space-y-4">
                        <h5 className="font-bold uppercase tracking-widest text-[10px] text-black">Iteration Sandboxing</h5>
                        <p className="text-[12px] text-black/60 leading-relaxed">Testing new workflow models in isolated pilot groups. Pushing prototype processes to 3x their normal volume to see where bottlenecks emerge.</p>
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/10 border border-black/5">
                  {['Modeling', 'Execution', 'Measurement', 'Refinement'].map(step => (
                    <div key={step} className="p-6 bg-white text-center">
                       <span className="block text-[10px] font-black uppercase tracking-widest text-[#8fb28a] mb-2">Node</span>
                       <span className="font-bold text-[10px] uppercase">{step}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* PHASE 03: ACTIVE ACTIVATION (Habit Stewardship & Resilience Testing) */}
        <div className="w-full px-6 lg:px-20 py-24 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24">
            <div className="lg:col-span-5">
              <span className="text-[6rem] font-black text-gray-700 leading-none select-none">03</span>
              <h4 className="text-2xl font-bold uppercase tracking-tight text-black mb-8">Active Activation.</h4>
              <p className="text-base text-black/60 leading-relaxed">
                We stay until the new operating system is breathing on its own. Transitioning from design to lived reality.
              </p>
            </div>
          </div>

          {/* TOPIC: HABIT STEWARDSHIP */}
          <div ref={scrollRefs.habit} className="grid grid-cols-1 lg:grid-cols-12 gap-20 py-24 border-t border-black/5 scroll-mt-20">
            <div className="lg:col-span-4 space-y-8">
               <div className="w-16 h-16 bg-[#aa7d3f] flex items-center justify-center">
                  <Fingerprint className="w-8 h-8 text-white" />
               </div>
               <h4 className="text-3xl font-bold uppercase tracking-tighter text-black">Habit <br/> Stewardship.</h4>
               <p className="text-[10px] font-mono text-black/40 uppercase tracking-[0.3em]">Behavioral Spec 2.1.2</p>
            </div>
            <div className="lg:col-span-8 space-y-12">
               <p className="text-xl font-medium tracking-tight text-black/90 leading-tight">
                  Systems are only as effective as the people who operate them. We focus on the neurobiology of organizational change.
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                  <div className="space-y-4">
                     <h5 className="font-bold uppercase tracking-widest text-[10px] border-b border-black/10 pb-2 text-[#aa7d3f]">Environmental Cues</h5>
                     <p className="text-sm text-black/60 leading-relaxed">Designing your digital and physical workspaces to act as "silent nudge" systems. Interface guardrails that make following the correct protocol the easiest path to take.</p>
                  </div>
                  <div className="space-y-4">
                     <h5 className="font-bold uppercase tracking-widest text-[10px] border-b border-black/10 pb-2 text-[#aa7d3f]">Incentive Synchronization</h5>
                     <p className="text-sm text-black/60 leading-relaxed">Humans do what they are rewarded for. We synchronize micro-rewards so adherence to the system is naturally reinforcing for the individual node.</p>
                  </div>
               </div>
               <div className="p-8 bg-black text-white space-y-6 relative overflow-hidden">
                  <Fingerprint className="absolute -top-10 -right-10 w-40 h-40 text-white/[0.03]" />
                  <p className="text-lg italic font-serif text-[#aa7d3f] leading-tight relative z-10">
                     "We bridge the gap between 'the first time' a new habit is tried and the moment it becomes 'the always'."
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 border-t border-white/10 pt-8 text-[10px] font-mono uppercase tracking-widest opacity-60">
                     <div className="flex justify-between border-r border-white/10 pr-8">
                        <span>Signal Clarity</span>
                        <span className="text-[#aa7d3f]">Verified</span>
                     </div>
                     <div className="flex justify-between pl-4">
                        <span>Resonance Detection</span>
                        <span className="text-[#aa7d3f]">Active</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* TOPIC: RESILIENCE TESTING */}
          <div ref={scrollRefs.resilience} className="grid grid-cols-1 lg:grid-cols-12 gap-20 py-24 border-t border-black/5 scroll-mt-20">
            <div className="lg:col-span-4 space-y-8">
               <div className="w-16 h-16 bg-slate-900 flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 text-[#aa7d3f]" />
               </div>
               <h4 className="text-3xl font-bold uppercase tracking-tighter text-black">Resilience <br/> Testing.</h4>
               <p className="text-[10px] font-mono text-black/40 uppercase tracking-[0.3em]">Antifragility spec 3.0.1</p>
            </div>
            <div className="lg:col-span-8 space-y-16">
               <p className="text-xl font-medium tracking-tight text-black/90 leading-tight">
                  In an era of permanent volatility, "stable" is not enough. We move beyond stability into antifragility.
               </p>

               <div className="space-y-16">
                  <div className="space-y-4">
                     <h5 className="font-bold uppercase tracking-widest text-[10px] border-b border-black/10 pb-2 text-black">Chaos Engineering</h5>
                     <p className="text-lg text-black/60 leading-relaxed">
                        Inspired by high-availability tech, we introduce minor, random "glitches" to build the organization's immune response. We ensure that every minor "failure" during a test results in a permanent hardening of the protocol.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {[
                       { title: 'Stress Simulation', desc: 'Wargaming scenarios like 300% load or 50% node loss.' },
                       { title: 'Redundancy Design', desc: 'Engineering fail-safes so no single point can halt momentum.' },
                       { title: 'Recovery Logic', desc: 'Defining sequences to return the firm to peak resonance.' }
                     ].map(item => (
                       <div key={item.title} className="p-6 border border-black/10 hover:bg-black hover:text-white transition-all group">
                          <h6 className="font-black text-[10px] uppercase mb-4 text-[#aa7d3f]">{item.title}</h6>
                          <p className="text-[10px] opacity-60 leading-relaxed">{item.desc}</p>
                       </div>
                     ))}
                  </div>

                  <div className="p-8 bg-[#fdfaf6] border border-black/5 text-center space-y-6">
                     <p className="text-base italic font-medium leading-relaxed max-w-xl mx-auto">
                        "Has this ever happened before? In a crisis, the 'first time' is when most collapse. We ensure that when the real crisis hits, your team has simulated it before."
                     </p>
                     <div className="w-8 h-1 bg-[#aa7d3f] mx-auto" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
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
