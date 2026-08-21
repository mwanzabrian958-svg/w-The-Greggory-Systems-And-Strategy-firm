import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../services/api';

/**
 * Blog - Main Journal Grid
 * Displays small compact blocks pulling from the database.
 */
const Blog = () => {
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
          setError('Mission Relay Failure: Content not found.');
        }
      } catch (err) {
        console.error('Relay error:', err);
        setError('Network Protocol Error');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black pt-40 pb-40 font-sans selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header Node */}
        <header className="mb-20 border-b-8 border-black pb-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-white rounded-xl">
               <BookOpen size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">The Strategic Journal</span>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center py-40">
            <RefreshCw className="animate-spin mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Polling Database Matrix...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-40 border-4 border-dashed border-slate-100 rounded-[40px]">
            <p className="text-xl font-bold uppercase opacity-20">Zero Archives Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id || article._id}
                to={`/blog/${article.id || article._id}`}
                className="group flex flex-col bg-white border-4 border-black p-6 hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 rounded-[40px]"
              >
                {/* Visual block */}
                <div className="aspect-video w-full overflow-hidden border-2 border-black mb-6 bg-slate-50 rounded-[24px]">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt=""
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
