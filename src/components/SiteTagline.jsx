const SiteTagline = ({ text = 'Strategic Project Development for all clients' }) => {
  return (
    <div className="w-full bg-[#07111f] border-b border-white/5 py-3 shadow-sm relative z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4">
           <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
           <p className="text-center text-amber-200/80 text-xs sm:text-sm font-black uppercase tracking-[0.3em] whitespace-nowrap">
             {text}
           </p>
           <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
        </div>
      </div>
    </div>
  )
}

export default SiteTagline
