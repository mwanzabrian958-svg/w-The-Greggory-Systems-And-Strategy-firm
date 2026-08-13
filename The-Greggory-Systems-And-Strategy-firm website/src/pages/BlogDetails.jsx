import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, User, CalendarDays, Share2, Tag, MessageSquare } from 'lucide-react'
import { getApiUrl } from '../services/api'

const BlogDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/blog-articles/${id}`))
        const result = await response.json()
        if (result.success) {
          setArticle(result.article)
        } else {
          setError('Article not found')
        }
      } catch (err) {
        console.error('Error fetching blog article:', err)
        setError('An error occurred while fetching the article')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center pt-32">
        <div className="w-10 h-10 border-t-2 border-[#8fb28a] rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] text-center pt-60 px-6">
        <h2 className="text-2xl font-bold mb-4">{error || 'Article not found'}</h2>
        <Link to="/blog" className="text-[#8fb28a] font-bold hover:underline">Back to Journal</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-[#111] pt-32 pb-40 font-sans selection:bg-[#8fb28a] selection:text-white">
      <div className="max-w-5xl mx-auto px-6">

        {/* Navigation */}
        <button
          onClick={() => navigate('/blog')}
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] mb-12 opacity-60 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Journal
        </button>

        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-6 mb-12 text-[10px] font-black uppercase tracking-widest text-[#aa7d3f]">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {new Date(article.published_date || article.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#aa7d3f]/20" />
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {article.category || 'Strategy'}
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#aa7d3f]/20" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {article.read_time || '5 min'} Read
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] text-black mb-16">
          {article.title}
        </h1>

        {/* Author Block */}
        <div className="flex items-center justify-between py-10 border-y border-black/5 mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Authored by</p>
              <p className="text-sm font-bold text-black uppercase">{article.author || 'Firm Contributor'}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="p-3 bg-white border border-black/5 rounded-2xl hover:bg-black hover:text-white transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Image */}
        {article.image_url && (
          <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-[80px_20px_100px_40px] mb-24 shadow-2xl bg-slate-100">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <article className="max-w-3xl mx-auto">
          {article.excerpt && (
            <p className="text-xl md:text-2xl font-medium leading-relaxed text-black mb-16 border-l-8 border-[#8fb28a]/20 pl-8 italic">
              {article.excerpt}
            </p>
          )}

          <div
            className="prose prose-lg prose-slate max-w-none prose-headings:text-black prose-p:text-[#111] prose-p:leading-[1.8] prose-p:font-normal prose-strong:font-bold prose-img:rounded-3xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Post-content node */}
          <div className="mt-32 pt-20 border-t border-black/5 flex flex-col items-center">
            <div className="w-px h-20 bg-gradient-to-b from-black/20 to-transparent mb-12" />
            <h4 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400">End of Briefing</h4>
          </div>
        </article>

      </div>
    </div>
  )
}

export default BlogDetails
