import React from 'react'
import { ArrowRight, Sparkles, Orbit, Zap, Heart, Globe, Shield, Command, Fingerprint, Microscope, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'

const About = () => {
  return (
    <div className="relative min-h-screen bg-[#fdfaf6] text-[#111] pt-32 selection:bg-[#8fb28a] selection:text-white font-sans overflow-x-hidden">

      {/* 1. HERO SECTION - Broadly defined, smaller professional typography */}
      <section className="w-full px-6 lg:px-20 mb-40">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
          <div className="lg:w-2/3">
            <div className="flex items-center gap-3 opacity-60 mb-8">
              <Fingerprint className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">The Architectural Identity</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              We design the underlying operating systems <br />
              that allow strategy to breathe <span className="text-[#8fb28a]">independently.</span>
            </h1>
          </div>
          <div className="lg:w-1/3">
            <p className="text-base text-black leading-relaxed font-normal">
              The-Greggory-Systems-And-Strategy-firm was founded on a singular premise: that complexity is the greatest tax on human ambition. We exist to dismantle that tax.
            </p>
          </div>
        </div>
      </section>

      {/* 2. THE LONG NARRATIVE - Broad layout, small readable font */}
      <section className="w-full px-6 lg:px-20 mb-60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-6">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#aa7d3f]">01 / The Origin</h2>
               <p className="text-sm text-slate-400 leading-relaxed uppercase tracking-widest font-bold">The evolution of systemic resonance.</p>
               <div className="h-px w-20 bg-[#aa7d3f]/20" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-16">
            <p className="text-base text-black leading-[1.8] max-w-3xl">
              We began not as a consultancy, but as a laboratory for operational resilience. We observed how even the most brilliant strategies often collapsed under the weight of their own implementation. The missing link was never the "what"—it was always the "how" of the ecosystem.
            </p>
            <p className="text-base text-black leading-[1.8] max-w-3xl">
              By studying the intersection of human psychology, technological architecture, and market dynamics, we developed a methodology that prioritizes flow over force. We don't push organizations toward change; we design the environment so that change becomes the path of least resistance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mt-40">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-6">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#8fb28a]">02 / Integrity</h2>
               <p className="text-sm text-slate-400 leading-relaxed uppercase tracking-widest font-bold">Mapping the organizational organism.</p>
               <div className="h-px w-20 bg-[#8fb28a]/20" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-16">
            <p className="text-base text-black leading-[1.8] max-w-3xl">
              Most firms look at a company as a collection of departments. We look at it as a living organism. When one part of the system is out of sync, the entire structure vibrates with friction. Our intervention starts with a deep mapping of these vibrations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 max-w-3xl">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Microscope className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-black">Deep Diagnosis</h3>
                <p className="text-sm text-black leading-relaxed">We identify the hidden tactical frictions that leak energy and slow down decision-making at every level.</p>
              </div>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-black">Signal Clarity</h3>
                <p className="text-sm text-black leading-relaxed">We transform internal communications from static noise into a clear frequency that every team member can tune into.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PHILOSOPHY - Broad definition of values */}
      <section className="w-full px-6 lg:px-20 mb-80">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-2xl bg-[#8fb28a]/10 flex items-center justify-center">
                <Orbit className="w-5 h-5 text-[#4c6a4d]" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-black">Ecosystem Thinking</h3>
              <p className="text-sm text-black leading-relaxed">We move beyond isolated solutions. Every strategy we deploy considers the ripple effect across your entire organization.</p>
            </div>
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-2xl bg-[#aa7d3f]/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#aa7d3f]" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-black">Radical Momentum</h3>
              <p className="text-sm text-black leading-relaxed">Speed is a by-product of clarity. By removing obstacles, we unlock a natural, sustainable velocity without burnout.</p>
            </div>
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center">
                <Heart className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-black">Cultural Resonance</h3>
              <p className="text-sm text-black leading-relaxed">Systems are for people. We design with empathy, ensuring our technical solutions feel natural and empowering.</p>
            </div>
        </div>
      </section>

      {/* 4. THE SINGLE LINE DIVIDER */}
      <div className="w-full px-6 lg:px-20">
         <div className="h-px w-full bg-slate-200" />
      </div>

      {/* 5. LEADERSHIP SECTION - Broadly defined, at the bottom */}
      <section className="py-32 w-full px-6 lg:px-20">
        <div className="flex flex-col lg:flex-row items-start gap-20">
          <div className="lg:w-1/3">
             <div className="relative w-full aspect-[4/5] max-w-sm">
                <div className="absolute inset-0 bg-[#8fb28a]/10 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] rotate-3 -z-10" />
                <div
                  className="w-full h-full object-cover grayscale brightness-110 contrast-110 shadow-2xl transition-all duration-700 hover:grayscale-0"
                  style={{
                    backgroundImage: 'url("/images/brian-mwanza-ceo.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '80px 40px 100px 50px',
                  }}
                />
             </div>
          </div>

          <div className="lg:w-2/3 space-y-10">
             <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-[#8fb28a]">Firm Leadership</span>
                <h2 className="text-4xl font-bold tracking-tight">Brian Mwanza</h2>
                <p className="text-sm font-bold text-[#aa7d3f] uppercase tracking-[0.2em]">Founder & Managing Director</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl">
                <p className="text-sm text-black leading-[1.8]">
                  Brian Mwanza is the visionary force behind The-Greggory-Systems-And-Strategy-firm. With over a decade of experience in systemic design and business strategy, he has guided some of the most ambitious organizations through complex digital and operational transformations.
                </p>
                <p className="text-sm text-black leading-[1.8]">
                  His philosophy is rooted in the belief that "Strategy is not a document; it's a pulse." Under his leadership, the firm has evolved from a boutique advisory to a global architect of business resonance, known for its uncompromising commitment to clarity and human-centric systems.
                </p>
             </div>

             <div className="pt-6">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                      <Fingerprint className="w-4 h-4" />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">"Design for resonance, not just function."</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-40 bg-white w-full px-6 lg:px-20 text-center">
         <div className="max-w-3xl mx-auto flex flex-col items-center gap-10">
            <h2 className="text-3xl font-bold tracking-tight">Ready to integrate <br /> these systems into your vision?</h2>
            <Link to="/contact" className="group inline-flex items-center gap-4 px-8 py-4 rounded-full bg-black text-white font-bold text-base hover:bg-slate-800 transition-all">
               Start the Conversation
               <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
         </div>
      </section>

    </div>
  )
}

export default About
