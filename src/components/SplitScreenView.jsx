import React, { useState } from 'react'
import { X, ArrowLeft, ArrowRight, Monitor, Smartphone } from 'lucide-react'

const SplitScreenView = ({ isOpen, onClose, url, title }) => {
  const [activeView, setActiveView] = useState('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!isOpen) return null

  const handleViewChange = (view) => {
    setActiveView(view)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getViewWidth = () => {
    switch (activeView) {
      case 'mobile':
        return '375px'
      case 'tablet':
        return '768px'
      case 'desktop':
        return '100%'
      default:
        return '100%'
    }
  }

  const getViewHeight = () => {
    if (isFullscreen) return '100vh'
    return '600px'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-2xl ${isFullscreen ? 'w-full h-full' : 'max-w-7xl w-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {url}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-1 bg-white rounded-lg p-1">
            <button
              onClick={() => handleViewChange('mobile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                activeView === 'mobile' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile
            </button>
            <button
              onClick={() => handleViewChange('tablet')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                activeView === 'tablet' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Tablet
            </button>
            <button
              onClick={() => handleViewChange('desktop')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                activeView === 'desktop' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Size:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {getViewWidth()}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 bg-gray-100 overflow-auto" style={{ height: getViewHeight() }}>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: getViewWidth(), margin: '0 auto' }}>
            <iframe
              src={url}
              className="w-full h-full border-0"
              style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '500px' }}
              title={title}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Preview Mode:</span> {activeView} view
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open(url, '_blank')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Open in New Tab
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(url)}
                className="text-gray-600 hover:text-gray-700"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplitScreenView
