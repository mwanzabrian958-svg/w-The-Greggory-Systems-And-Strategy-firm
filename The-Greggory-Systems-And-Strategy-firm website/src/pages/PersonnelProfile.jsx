import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getApiUrl } from '../services/api'
import { X, RefreshCw, WifiOff } from 'lucide-react'
import DOMPurify from 'dompurify'
import { PageLoader } from '../components/Loading'
import { useSeo, SEO } from '../hooks/useSeo'

const PersonnelProfile = () => {
  useSeo(SEO.personnel)
  const { id } = useParams()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      setPerson(null)
      try {
        const res = await fetch(getApiUrl('/api/company-personnel/' + id))
        if (!res.ok) {
          if (mounted) {
            setError({ type: res.status === 404 ? 'not-found' : 'server' })
          }
          return
        }
        const json = await res.json()
        if (!mounted) return
        if (json && json.success) setPerson(json.personnel)
        else setError({ type: 'not-found' })
      } catch (e) {
        if (mounted) {
          setError({
            type: !navigator.onLine || e instanceof TypeError ? 'connection' : 'server',
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id, retryCount])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center pt-32">
        <PageLoader label="Loading Profile" minHeight="min-h-[40vh]" tone="sage" />
      </div>
    )
  }

  if (error || !person) {
    const isConnectionError = error?.type === 'connection'
    const isNotFound = error?.type === 'not-found'

    return (
      <div className="min-h-screen bg-[#fdfaf6] text-[#111] pt-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-20">
          {isConnectionError ? (
            <WifiOff size={32} className="mb-4 text-[#8fb28a]" aria-hidden="true" />
          ) : null}
          <h1 className="text-3xl font-bold">
            {isNotFound ? 'Profile not found' : isConnectionError ? 'Unable to connect' : 'Profile temporarily unavailable'}
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            {isNotFound
              ? 'This team member profile may have been removed or the link may be incorrect.'
              : isConnectionError
                ? 'We couldn’t connect to load this profile. Check your internet connection, then try again.'
                : 'We couldn’t load this profile right now. Please try again in a moment.'}
          </p>
          {!isNotFound && (
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="inline-flex items-center gap-2 mt-8 rounded-lg bg-[#0f172a] px-5 py-3 font-bold text-white transition-colors hover:bg-slate-700"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
          )}
          <Link to="/about" className="inline-flex items-center gap-2 mt-8 ml-4 text-[#8fb28a] font-bold hover:underline">
            Back to About
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-[#111] pt-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-20 py-16">

        {/* Top-left photo | Top-right name + position + X (shared row) */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">

          {/* Photo block (top left) */}
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
                  {person.name ? person.name.charAt(0) : ''}
                </div>
              )}
            </div>
          </div>

          {/* Name & position block (top right) */}
          <div className="lg:w-3/5 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">{person.name}</h1>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#aa7d3f]">
                  {person.position}
                </p>
              </div>

              {/* X — closes the personnel viewing session */}
              <Link
                to="/about"
                aria-label="Close personnel view"
                className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center hover:bg-slate-700 transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <X size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[#aa7d3f]/20 my-10" />

        {/* Below the photo: all credentials & records posted by admin */}
        <div className="max-w-none">
          {person.bio ? (
            <div
              className="space-y-4 text-sm leading-[1.9] text-black"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(person.bio) }}
            />
          ) : (
            <p className="text-sm text-slate-400">No credentials have been published for this profile yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PersonnelProfile
