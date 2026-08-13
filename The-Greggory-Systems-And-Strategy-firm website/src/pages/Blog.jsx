import React, { useState, useEffect } from 'react'
import { ArrowRight, BookOpen, CalendarDays, Command, User, Sparkles, TrendingUp, Search, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getApiUrl } from '../services/api'

const Blog = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Subscription state
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [subStatus, setSubStatus] = useState(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(getApiUrl('/api/blog-articles'))
        const result = await response.json()
        if (result.success) {
          setArticles(result.articles)
        } else {
          setError('Failed to load articles')
        }
      } catch (err) {
        console.error('Error fetching blog articles:', err)
        setError('An error occurred while fetching articles')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return

    setSubmitting(true)
    setSubStatus(null)

    try {
      const response = await fetch('/api/blog-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          source: 'website_blog'
        })
      })

      const result = await response.json()
      if (result.success) {
        setSubStatus('success')
        setEmail('')
      } else {
        setSubStatus('error')
      }
    } catch (err) {
      console.error('Subscription error:', err)
      setSubStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fdfaf6] text-[#111] pt-32 selection:bg-[#8fb28a] selection:text-white font-sans overflow-x-hidden">

      {/* 1. HERO SECTION - Broadly defined, smaller professional typography */}
      <section className="w-full px-6 lg:px-20 mb-32">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 border-b border-black/5 pb-20">
          <div className="lg:w-2/3">
            <div className="flex items-center gap-3 opacity-60 mb-8">
              <BookOpen className="w-4 h-4 text-black" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">The Journal / Insights & Strategy</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-black">
              Practical Thinking for <br />
              <span className="text-[#aa7d3f] italic">Systemic Momentum.</span>
            </h1>
          </div>
          <div className="lg:w-1/3">
            <p className="text-base text-black leading-relaxed font-normal">
              Exploring the intersection of human psychology, technological architecture, and the mechanics of sustainable business flow.
            </p>
          </div>
        </div>
      </section>

      {/* 2. THE JOURNAL BOOK - Dense, informative entries */}
      <section className="w-full px-6 lg:px-20 mb-60">

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="w-10 h-10 border-t-2 border-[#8fb28a] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-40">
            <p className="text-black font-bold uppercase tracking-widest">{error}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-black font-bold uppercase tracking-widest">No articles found in the repository.</p>
          </div>
        ) : (
          <div className="space-y-40">
            {articles.map((article, index) => (
              <div key={article.id || article._id} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-4">
                  <div className="sticky top-40 space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-[#aa7d3f] uppercase tracking-[0.3em]">
                        {new Date(article.published_date || article.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </span>
                      <div className="h-px w-10 bg-[#aa7d3f]/30" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{article.category || 'Strategy'}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-black leading-tight group-hover:text-[#aa7d3f] transition-colors">
                      {article.title}
                    </h3>
                    <div className="pt-4 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-400" />
                       </div>
                       <span className="text-xs font-bold text-black uppercase tracking-widest">{article.author || 'Firm Contributor'}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="space-y-10 group">
                    {article.image_url && (
                      <div className="relative w-full aspect-[21/9] overflow-hidden rounded-[80px_20px_100px_40px] mb-12 shadow-2xl">
                         <img
                           src={article.image_url}
                           alt={article.title}
                           className="w-full h-full object-cover grayscale brightness-110 contrast-110 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                         />
                      </div>
                    )}

                    <p className="text-lg md:text-xl text-black font-medium leading-relaxed max-w-4xl border-l-4 border-[#8fb28a]/20 pl-8">
                      {article.excerpt || "Strategic briefing excerpt pending Node synchronization."}
                    </p>

                    <div className="text-base text-black leading-[1.8] max-w-4xl space-y-6" dangerouslySetInnerHTML={{ __html: (article.content || "").substring(0, 500) + (article.content && article.content.length > 500 ? '...' : '') }} />

                    <div className="pt-10">
                      <Link
                        to={`/blog/${article.id || article._id}`}
                        className="inline-flex items-center gap-4 text-sm font-black border-b-2 border-black pb-2 hover:gap-8 transition-all"
                      >
                        READ FULL PERSPECTIVE
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. SUBSCRIPTION NARRATIVE - Broad and Minimal */}
      <section className="w-full px-6 lg:px-20 mb-80 bg-slate-50 py-40 border-y border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#8fb28a] mb-6">Stay Tuned</h2>
            <p className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-none mb-8">Notes on structural <span className="italic">clarity.</span></p>
            <p className="text-base text-black max-w-md">Subscribe to receive monthly deep-dives into the systems and habits that drive organizational resonance.</p>
          </div>

          <div className="relative">
            <form onSubmit={handleSubscribe} className="flex flex-col gap-6">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your professional email"
                className="w-full bg-transparent border-b-2 border-black/10 py-6 text-xl text-black placeholder:text-slate-300 focus:outline-none focus:border-[#8fb28a] transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="self-start group inline-flex items-center gap-6 text-xl font-bold text-black border-b-4 border-black pb-2 hover:gap-10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'PROCESSING...' : 'JOIN THE JOURNAL'}
                <Sparkles className={`w-6 h-6 text-[#aa7d3f] ${submitting ? 'animate-spin' : ''}`} />
              </button>

              {subStatus === 'success' && (
                <p className="text-[#8fb28a] font-bold uppercase tracking-widest animate-fade-in">Welcome to the Journal. Your subscription is active.</p>
              )}
              {subStatus === 'error' && (
                <p className="text-red-500 font-bold uppercase tracking-widest animate-fade-in">System error. Please try again later.</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION - Broad Fluid Exit */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-[#1a1a1a] transition-transform duration-[4s] hover:scale-105"
          style={{
            borderRadius: '100% 100% 0 0 / 100% 100% 0 0',
            transform: 'translateY(10%)'
          }}
        />

        <div className="relative z-10 text-center px-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-none tracking-tight mb-10">
            CONTRIBUTE TO THE <br />
            <span className="italic font-light text-[#8fb28a]">RESONANCE.</span>
          </h2>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-6 text-xl font-bold text-white hover:text-[#8fb28a] transition-all"
          >
            CONNECT WITH OUR AUTHORS
            <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  )
}

export default Blog
