const SiteTagline = ({ text = 'Strategic Project Development for all clients' }) => {
  return (
    <div className="w-full bg-teal-50 border-b border-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-teal-700 text-sm py-2 font-medium tracking-wide">
          {text}
        </p>
      </div>
    </div>
  )
}

export default SiteTagline
