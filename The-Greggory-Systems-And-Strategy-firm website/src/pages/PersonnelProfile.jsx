import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getApiUrl } from '../services/api'
import { ChevronLeft } from 'lucide-react'

const slug = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const PersonnelProfile = () => {
  const { id } = useParams()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch(getApiUrl(`/api/company-personnel/${id}`))
        const json = await res.json()
        if (!mounted) return
        if (json?.success) setPerson(json.personnel)
        else setError(json?.message || 'Personnel not found')
      } catch (e) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center pt-32">
        <div className="h-10 w-10 rounded-full border-4 border-white/10 border-t-[#8fb28a] animate-spin" />
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] text-[#111] pt-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-20">
          <h1 className="text-3xl font-bold">Person not found</h1>
          <p className="mt-4 text-slate-500">{error || 'This team member could not be located.'}</p>
          <Link to="/about" className="inline-flex items-center gap-2 mt-8 text-[#8fb28a] font-bold hover:underline">
            <ChevronLeft size={16} /> Back to About
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-[#111] pt-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-20 py-16">

        {/* Back link */}
        <Link
          to="/about"
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.3em] text-[#8fb28a] hover:text-[#111] transition-colors mb-12"
        >
          <ChevronLeft size={14} /> Back to About
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Left: photo */}
          <div className="lg:w-2/5">
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[32px] shadow-xl bg-slate-100">
              {person.image_url ? (
                <img
                  src={person.image_url}
                  alt={person.name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                  className="w-full h-full object-cover grayscale contrast-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#8fb28a]/10 text-6xl font-black text-[#8fb28a]">
                  {person.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Right: name + position + credentials */}
          <div className="lg:w-3/5">
            <h1 className="text-4xl font-bold tracking-tight">{person.name}</h1>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#aa7d3f] mt-2">
              {person.position}
            </p>

            <div className="h-px w-12 bg-[#aa7d3f]/20 my-6" />

            {/* Bio/credentials — render HTML directly as trusted admin content */}
            {person.bio && (
              <div
                className="prose prose-lg text-slate-700 max-w-none"
                dangerouslySetInnerHTML={{ __html: person.bio }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonnelProfile