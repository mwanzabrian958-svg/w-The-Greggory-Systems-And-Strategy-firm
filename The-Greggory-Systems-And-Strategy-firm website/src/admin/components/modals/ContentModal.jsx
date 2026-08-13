import React, { useState } from 'react';
import { X, Briefcase, Plus, Search, Edit, Trash2, Eye, FileText, Image, Video, Code, Layout, Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Link, Save, Clock, User } from 'lucide-react';

export function ContentModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('pages');
  const [editingContent, setEditingContent] = useState(null);

  const [pages, setPages] = useState([
    { id: 1, title: 'Home', slug: '/', status: 'Published', lastModified: '2024-05-19', author: 'Admin', views: 1234 },
    { id: 2, title: 'About Us', slug: '/about', status: 'Published', lastModified: '2024-05-18', author: 'Admin', views: 856 },
    { id: 3, title: 'Services', slug: '/services', status: 'Published', lastModified: '2024-05-17', author: 'Admin', views: 2341 },
    { id: 4, title: 'Projects', slug: '/projects', status: 'Published', lastModified: '2024-05-16', author: 'Admin', views: 1567 },
    { id: 5, title: 'Contact', slug: '/contact', status: 'Published', lastModified: '2024-05-15', author: 'Admin', views: 987 },
  ]);

  const [posts, setPosts] = useState([
    { id: 1, title: 'Latest Industry Trends', category: 'Insights', status: 'Published', date: '2024-05-19', author: 'Jane Doe', views: 456 },
    { id: 2, title: 'Project Management Best Practices', category: 'Education', status: 'Draft', date: '2024-05-18', author: 'John Smith', views: 0 },
    { id: 3, title: 'Digital Transformation Guide', category: 'Technology', status: 'Published', date: '2024-05-17', author: 'Jane Doe', views: 789 },
  ]);

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Published': return 'bg-green-100 text-green-800 border-green-300';
      case 'Draft': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Archived': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Content Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('pages')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'pages' ? 'bg-white border-b-2 border-violet-600 text-violet-600' : 'text-gray-600 hover:text-gray-900'}`}>Pages</button>
          <button onClick={() => setActiveTab('posts')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'posts' ? 'bg-white border-b-2 border-violet-600 text-violet-600' : 'text-gray-600 hover:text-gray-900'}`}>Blog Posts</button>
          <button onClick={() => setActiveTab('media')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'media' ? 'bg-white border-b-2 border-violet-600 text-violet-600' : 'text-gray-600 hover:text-gray-900'}`}>Media Library</button>
          <button onClick={() => setActiveTab('editor')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'editor' ? 'bg-white border-b-2 border-violet-600 text-violet-600' : 'text-gray-600 hover:text-gray-900'}`}>Editor</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'pages' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search pages..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                </div>
                <button onClick={() => { setEditingContent({}); setActiveTab('editor'); }} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                  <Plus className="w-4 h-4" /> New Page
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Page Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Modified</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Views</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pages.map(page => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{page.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{page.slug}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(page.status)}`}>
                            {page.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{page.lastModified}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{page.views.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button onClick={() => { setEditingContent(page); setActiveTab('editor'); }} className="p-1 hover:bg-violet-100 rounded transition-colors">
                              <Edit className="w-4 h-4 text-violet-600" />
                            </button>
                            <button className="p-1 hover:bg-red-100 rounded transition-colors">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search posts..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                </div>
                <button onClick={() => { setEditingContent({}); setActiveTab('editor'); }} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                  <Plus className="w-4 h-4" /> New Post
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Author</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Views</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{post.category}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{post.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{post.author}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{post.views}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button onClick={() => { setEditingContent(post); setActiveTab('editor'); }} className="p-1 hover:bg-violet-100 rounded transition-colors">
                              <Edit className="w-4 h-4 text-violet-600" />
                            </button>
                            <button className="p-1 hover:bg-red-100 rounded transition-colors">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search media..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                  <Plus className="w-4 h-4" /> Upload Media
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div key={item} className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-violet-200 to-purple-300 flex items-center justify-center">
                      <Image className="w-8 h-8 text-violet-600" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">image-{item}.jpg</p>
                      <p className="text-xs text-gray-500">1.2 MB • JPG</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingContent ? `Editing: ${editingContent.title || 'New Content'}` : 'New Content'}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('pages')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" defaultValue={editingContent?.title || ''} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="Enter title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input type="text" defaultValue={editingContent?.slug || ''} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="/url-slug" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                      <option value="">Select category</option>
                      <option value="Insights">Insights</option>
                      <option value="Education">Education</option>
                      <option value="Technology">Technology</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Editor</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 border-b px-3 py-2 flex items-center gap-1 flex-wrap">
                      <button className="p-2 hover:bg-gray-200 rounded"><Bold className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-gray-200 rounded"><Italic className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-gray-200 rounded"><Underline className="w-4 h-4" /></button>
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      <button className="p-2 hover:bg-gray-200 rounded"><AlignLeft className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-gray-200 rounded"><AlignCenter className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-gray-200 rounded"><AlignRight className="w-4 h-4" /></button>
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      <button className="p-2 hover:bg-gray-200 rounded"><List className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-gray-200 rounded"><Link className="w-4 h-4" /></button>
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      <button className="p-2 hover:bg-gray-200 rounded"><Image className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-gray-200 rounded"><Video className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-gray-200 rounded"><Code className="w-4 h-4" /></button>
                    </div>
                    <textarea
                      defaultValue={editingContent?.content || ''}
                      className="w-full h-64 p-4 focus:outline-none resize-none"
                      placeholder="Start writing your content..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Author: Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Last modified: {editingContent?.lastModified || 'Just now'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}