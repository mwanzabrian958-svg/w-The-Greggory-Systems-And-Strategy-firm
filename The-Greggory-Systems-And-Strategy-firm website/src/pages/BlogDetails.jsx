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
      <div className="max-w-7xl mx-auto px-6">

        {/* Navigation */}
        <button
          onClick={() => navigate('/blog')}
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] mb-12 opacity-60 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Journal
        </button>

        {/* Title Node */}
        <h1 className="text-4xl md:text-5xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-black mb-16 border-b border-black/5 pb-16">
          {article.title}
        </h1>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Column: Image Asset */}
          <div className="lg:w-1/3">
            <div className="sticky top-40 space-y-8">
              {article.image_url && (
                <div className="relative w-full aspect-square overflow-hidden rounded-[40px] shadow-2xl bg-slate-100 border border-black/5">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-6 pt-8 border-t border-black/5">
                <div className="flex flex-col gap-2">
                   <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Node Identity</p>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white"><User size={18} /></div>
                      <p className="text-xs font-bold uppercase tracking-widest">{article.author || 'Firm Contributor'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-2xl border border-black/5">
                      <p className="text-[6px] font-black uppercase text-slate-400 mb-1">Timeline</p>
                      <p className="text-[9px] font-bold uppercase">{new Date(article.published_date || article.created_at).toLocaleDateString()}</p>
                   </div>
                   <div className="bg-white p-4 rounded-2xl border border-black/5">
                      <p className="text-[6px] font-black uppercase text-slate-400 mb-1">Sector</p>
                      <p className="text-[9px] font-bold uppercase">{article.category || 'Strategy'}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Content */}
          <div className="lg:w-2/3">
            <div className="max-w-3xl">
              {article.excerpt && (
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-black mb-16 border-l-8 border-[#8fb28a]/20 pl-8 italic">
                  {article.excerpt}
                </p>
              )}

              <div
                className="prose prose-lg prose-slate max-w-none prose-headings:text-black prose-p:text-[#111] prose-p:leading-[1.8] prose-p:font-normal prose-strong:font-bold prose-img:rounded-3xl"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-32 pt-20 border-t border-black/5 flex flex-col items-center">
                <div className="w-px h-20 bg-gradient-to-b from-black/20 to-transparent mb-12" />
                <h4 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400">End of Transmission</h4>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default BlogDetails
