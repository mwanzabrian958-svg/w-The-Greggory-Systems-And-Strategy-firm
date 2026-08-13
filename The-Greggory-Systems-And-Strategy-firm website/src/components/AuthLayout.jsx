import React from 'react'
import { Link } from 'react-router-dom'

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden flex flex-col items-center justify-center px-4 py-4 sm:py-8">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(245,158,11,0.1),_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_rgba(45,212,191,0.05),_transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and optional heading */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gold-500/20 rounded-full blur-2xl group-hover:bg-gold-500/40 transition-all duration-700" />
              <img
                src="/brand-header.png/sja.PNG"
                alt="SJA"
                className="relative h-20 w-auto object-contain brightness-110 contrast-125 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
          {title && (
            <div className="mt-4">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">{title}</h2>
              <div className="h-1 w-12 bg-gold-500 mx-auto mt-2 rounded-full" />
            </div>
          )}
          {subtitle && <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">{subtitle}</p>}
        </div>

        <div className="bg-white/5 backdrop-blur-2xl py-6 px-6 shadow-2xl rounded-[32px] border border-white/10 sm:px-10 relative overflow-hidden">
          {/* Decorative inner glow */}
          <div className="absolute -top-24 -right-24 h-48 w-48 bg-gold-500/10 blur-[80px] rounded-full pointer-events-none" />
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
