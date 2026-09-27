import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../services/api';
import { SectionLoader } from '../components/Loading';
import { useSeo, SEO } from '../hooks/useSeo'

/**
 * Blog - Main Journal Grid
 * Displays small compact blocks pulling from the database.
 */
const Blog = () => {
  useSeo(SEO.blog)
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(getApiUrl('/api/blog-articles'));
        const result = await response.json();
        if (result.success) {
          setArticles(result.articles || []);
        } else {
          setError('We could not load the journal right now. Please try again.');
        }
      } catch {
        setError('We could not load the journal. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black pt-40 pb-40 font-sans selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Journal header */}
        <header className="mb-12 border-b-8 border-black pb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-white rounded-xl">
               <BookOpen size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">The Strategic Journal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Insights & analysis</h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600">Notes on systems design, strategy, and execution from the firm.</p>
        </header>

        {loading ? (
          <SectionLoader label="Loading articles…" rows={2} maxWidth="max-w-md" />
        ) : error ? (
          <div className="text-center py-24 border border-rose-200 bg-rose-50 rounded-[24px] px-6">
            <p className="text-sm font-bold text-rose-700">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition">Try again</button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-[24px] px-6">
            <p className="text-lg font-bold">No articles yet</p>
            <p className="mt-2 text-sm text-slate-500">New insights are on the way — check back soon, or contact us to start the conversation.</p>
            <Link to="/contact" className="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition">Contact us</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id || article._id}
                to={`/blog/${article.id || article._id}`}
                className="group flex flex-col bg-white border-2 border-black p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 rounded-3xl"
              >
                {/* Visual block */}
                <div className="aspect-video w-full overflow-hidden border-2 border-black mb-6 bg-slate-50 rounded-2xl">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title || 'Journal article cover'}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                       <BookOpen size={48} />
                    </div>
                  )}
                </div>

                {/* Info block */}
                <div className="flex-1 flex flex-col justify-between">
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-2 opacity-40">{article.category}</p>
                      <h3 className="text-xl font-black uppercase leading-tight group-hover:text-teal-600 transition-colors">
                        {article.title}
                      </h3>
                   </div>
                   <div className="mt-8 pt-4 border-t border-black/10 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{new Date(article.published_date || article.created_at).toLocaleDateString()}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Blog;
