import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, RefreshCw, Clock, User, Tag, Calendar, ChevronLeft } from "lucide-react";
import { getApiUrl } from "../../services/api";

/**
 * BlogPreview - Standalone Full-Screen Display for reading blog posts.
 * Optimized with technical-grade tiny typography and zero background noise.
 */
export function BlogPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/blog-articles/${id}`));
        if (response.ok) {
          const data = await response.json();
          setArticle(data.article);
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center">
        <RefreshCw className="animate-spin text-teal-500" size={24} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center text-white p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4">Node Not Found</p>
        <button onClick={() => navigate('/admin/content')} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
          <ChevronLeft size={12} /> Return to Hub
        </button>
      </div>
    );
  }

  const previewContent = (() => {
    if (!article.content || !article.content.trim()) return "";
    const trimmed = article.content.trim();
    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);

    if (looksLikeHtml) {
      return trimmed;
    }

    return trimmed
      .split(/\n{2,}|\r\n\r\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p>${block.replace(/\n/g, '<br />')}</p>`)
      .join("");
  })();

  return (
    <div className="fixed inset-0 bg-[#020617] z-[500] flex flex-col overflow-hidden font-sans">
      {/* Header Relay */}
      <div className="bg-[#0f172a] px-6 py-3 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-500 border border-teal-500/20">
            <Tag size={16} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase leading-none tracking-tighter">Document Review</h2>
            <p className="text-[6px] text-teal-500 font-black uppercase tracking-[0.4em] mt-1">Strategic Relay View</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/content")}
          className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/10 flex items-center gap-2"
        >
          <X size={12} /> Close Node
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-12">
        <article className="max-w-4xl mx-auto space-y-10">
          {/* Metadata Bar */}
          <div className="flex flex-wrap gap-4 items-center justify-center py-4 border-y border-white/5 bg-white/2 rounded-2xl px-6">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">
              <Tag size={10} className="text-teal-500" />
              <span>{article.category || "General"}</span>
            </div>
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">
              <Clock size={10} className="text-blue-500" />
              <span>{article.read_time || "5m"} Read</span>
            </div>
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">
              <User size={10} className="text-purple-500" />
              <span>{article.author || "Admin"}</span>
            </div>
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">
              <Calendar size={10} className="text-amber-500" />
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Hero Asset */}
          {article.image_url && (
            <div className="rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-white/2">
              <img
                src={article.image_url}
                alt=""
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Core Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase text-center py-6">
              {article.title}
            </h1>

            <div className="prose prose-invert prose-sm max-w-none">
              <div
                className="blog-preview-content text-[11px] leading-relaxed text-slate-300 font-medium"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
          </div>

          {/* End of Transmission Node */}
          <div className="pt-20 pb-10 flex flex-col items-center">
            <div className="w-px h-10 bg-gradient-to-b from-teal-500/50 to-transparent mb-4"></div>
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.8em]">End of Transmission</p>
          </div>
        </article>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-preview-content {
          color: #e2e8f0;
          background: transparent;
        }

        .blog-preview-content p,
        .blog-preview-content ul,
        .blog-preview-content ol,
        .blog-preview-content blockquote,
        .blog-preview-content h1,
        .blog-preview-content h2,
        .blog-preview-content h3,
        .blog-preview-content h4,
        .blog-preview-content h5,
        .blog-preview-content h6,
        .blog-preview-content img,
        .blog-preview-content figure,
        .blog-preview-content iframe {
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .blog-preview-content p,
        .blog-preview-content li,
        .blog-preview-content blockquote {
          color: #e2e8f0;
        }

        .blog-preview-content a {
          color: #67e8f9;
          text-decoration: underline;
        }

        .blog-preview-content img,
        .blog-preview-content iframe,
        .blog-preview-content video {
          display: block;
          max-width: 100%;
          height: auto;
          border-radius: 16px;
        }
      `}} />

      {/* Footer Relay */}
      <footer className="bg-[#0f172a] border-t border-white/5 p-6 flex justify-between items-center flex-shrink-0">
         <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em]">Property of Greggory Systems & Strategy Firm © {new Date().getFullYear()}</p>
         <div className="flex gap-4">
           <button onClick={() => navigate(`/admin/content/create`)} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">Edit Node</button>
           <button onClick={() => navigate('/admin/content')} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/10 transition-all">Back to Relay</button>
         </div>
      </footer>
    </div>
  );
}
