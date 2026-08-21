import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
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
          setError('Data Node Missing')
        }
      } catch (err) {
        setError('Relay Failure')
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [id])

  if (loading) return <div style={{ background: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'black', fontWeight: 'bold' }}>Synchronizing Archive Node...</p></div>
  if (error || !article) return <div style={{ background: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'black', fontWeight: 'bold' }}>Archive Node Offline</p></div>

  const articleBody = article.content
    ? /<\/?[a-z][\s\S]*>/i.test(article.content)
      ? article.content
      : article.content.replace(/(?:\r\n|\r|\n)/g, '<br />')
    : ''

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', width: '100%', color: 'black', paddingTop: '80px', paddingBottom: '60px', fontFamily: 'sans-serif' }}>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Navigation - Public Hub Return */}
        <button
          onClick={() => navigate('/blog')}
          style={{ marginBottom: '40px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px', cursor: 'pointer', border: 'none', background: 'none', color: 'black' }}
        >
          ← BACK TO JOURNAL
        </button>

        {/* MASTER ARCHIVE BLOCK - TOTAL THEME ISOLATION */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '28px',
          background: '#FFFFFF',
          border: '6px solid #000000',
          borderRadius: '28px',
          padding: '28px',
          boxShadow: '18px 18px 0px 0px rgba(0,0,0,0.03)',
          color: '#000000'
        }} className="manuscript-block-mobile">

          {/* LEFT CONTEXT HUB: ASSETS & TELEMETRY */}
          <div style={{ width: '32%', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* 1. IMAGE ASSET */}
            {article.image_url && (
              <img
                src={article.image_url}
                alt="Tactical Asset"
                style={{ width: '100%', borderRadius: '24px', border: '5px solid #000000', display: 'block', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              />
            )}

            {/* 2. TELEMETRY NODE (UNDER IMAGE) */}
            <div style={{ padding: '14px 0', borderTop: '2px solid #000000', borderBottom: '2px solid #000000' }}>
               <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '900', color: '#000000' }}>
                 {new Date(article.published_date || article.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
               </p>
               <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#666666' }}>
                 {article.category}
               </p>
               <p style={{ margin: '0', fontSize: '12px', fontWeight: '900', color: '#000000' }}>
                 {article.read_time || '5 MIN'} READ
               </p>
            </div>

            {/* 3. STRATEGIC BRIEF (INTRO) */}
            <div style={{
              fontStyle: 'italic',
              fontSize: '15px',
              fontWeight: '700',
              lineHeight: '1.5',
              color: '#000000',
              borderLeft: '7px solid #000000',
              paddingLeft: '18px',
              backgroundColor: '#FAFAFA',
              padding: '18px 16px'
            }}>
               {article.excerpt}
            </div>

          </div>

          {/* RIGHT NARRATIVE HUB: THE MANUSCRIPT */}
          <div style={{ width: '68%', borderLeft: '1px solid #EEEEEE', paddingLeft: '28px' }} className="content-pad-mobile">

            {/* COMPACT HEADER NODE */}
            <header style={{ marginBottom: '26px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '900', lineHeight: '1.15', textTransform: 'uppercase', marginBottom: '10px', color: '#000000', letterSpacing: '-0.5px' }}>
                {article.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', background: '#000', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <User size={12} strokeWidth={3} />
                </div>
                <p style={{ fontSize: '11px', fontWeight: '900', color: '#888888', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  By: <span style={{ color: '#000000' }}>{article.author || 'ADMINISTRATOR'}</span>
                </p>
              </div>
            </header>

            {/* TACTICAL DIVIDER */}
            <div style={{ width: '100%', height: '4px', backgroundColor: '#000000', marginBottom: '26px' }}></div>

            {/* FULL BRIEFING FLOW */}
            <div
              className="blog-article-body"
              dangerouslySetInnerHTML={{ __html: articleBody }}
              style={{
                fontSize: '15px',
                lineHeight: '1.7',
                fontWeight: '500',
                color: '#000000',
                fontFamily: 'serif',
                textAlign: 'justify',
                background: '#ffffff'
              }}
            />

            {/* TERMINATION NODE */}
            <div style={{ marginTop: '50px', paddingTop: '18px', borderTop: '2px solid #EEEEEE', textAlign: 'center' }}>
               <div style={{ width: '40px', height: '4px', background: '#000', margin: '0 auto 20px auto' }}></div>
               <p style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '12px', color: '#CCCCCC', textTransform: 'uppercase' }}>
                 End of Briefing
               </p>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-article-body {
          color: #000000;
          background: #ffffff;
        }

        .blog-article-body > *:first-child {
          margin-top: 0;
        }

        .blog-article-body > *:last-child {
          margin-bottom: 0;
        }

        .blog-article-body p,
        .blog-article-body ul,
        .blog-article-body ol,
        .blog-article-body blockquote,
        .blog-article-body pre,
        .blog-article-body table,
        .blog-article-body img,
        .blog-article-body iframe,
        .blog-article-body figure {
          margin: 0.9rem 0;
        }

        .blog-article-body p,
        .blog-article-body li,
        .blog-article-body blockquote {
          color: #000000;
          font-size: 15px;
          line-height: 1.7;
        }

        .blog-article-body h1,
        .blog-article-body h2,
        .blog-article-body h3,
        .blog-article-body h4,
        .blog-article-body h5,
        .blog-article-body h6 {
          color: #000000;
          margin: 1.2rem 0 0.7rem;
          line-height: 1.2;
          font-weight: 800;
        }

        .blog-article-body img,
        .blog-article-body iframe,
        .blog-article-body video,
        .blog-article-body figure {
          display: block;
          max-width: 100%;
          height: auto;
          border-radius: 18px;
          background: #ffffff;
        }

        .blog-article-body a {
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .blog-article-body ul,
        .blog-article-body ol {
          padding-left: 2rem;
        }

        .blog-article-body blockquote {
          border-left: 5px solid #000000;
          padding-left: 1.25rem;
          font-style: italic;
        }

        @media (max-width: 1024px) {
          .manuscript-block-mobile { flex-direction: column !important; padding: 20px !important; border-radius: 20px !important; }
          .manuscript-block-mobile > div { width: 100% !important; padding-left: 0 !important; border-left: none !important; }
          .content-pad-mobile { margin-top: 20px; padding-top: 20px; border-top: 1px solid #EEE; }
        }
      `}} />
    </div>
  )
}

export default BlogDetails
