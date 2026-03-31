import React from 'react'

const BrandMark = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 160 80"
    className={className}
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <g fill="#3949ab">
      <path d="M18 64c10-28 14-34 32-34-10 5-12 11-9 17 8-9 18-12 30-12-12 6-16 12-14 17 10-8 24-12 41-12-14 6-20 12-18 16 8-5 14-7 24-7-7 5-12 10-14 15 10-5 20-7 32-7-12 10-27 15-46 15-22 0-39-2-58-8z"/>
      <path d="M36 22c3-7 10-12 18-14l-3 7c5-2 9-2 14-2-5 2-8 5-10 7 7 0 12 1 16 5-10 0-17 0-26-3 0 2-3 5-9 7z"/>
    </g>
  </svg>
)

const BrandHeader = ({
  align = 'left',
  size = 'md',
  wordmark = 'THE GREGGORY FOUNDATION LTD',
  tagline = 'Your Vision Delivered with Trust',
  wrapperClass = '',
}) => {
  const isCenter = align === 'center'
  const sizes = {
    sm: { 
      title: 'text-lg', 
      tagline: 'text-xs',
      padding: 'px-3 py-2',
      border: 'border-2'
    },
    md: { 
      title: 'text-2xl', 
      tagline: 'text-sm',
      padding: 'px-4 py-3',
      border: 'border-2'
    },
    lg: { 
      title: 'text-3xl', 
      tagline: 'text-base',
      padding: 'px-6 py-4',
      border: 'border-2'
    },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className={`inline-block bg-white/90 shadow-md ${s.border} border-navy-900/20 rounded-lg ${s.padding} ${isCenter ? 'mx-auto' : ''} ${wrapperClass}`}>
      <div className={`flex flex-col ${isCenter ? 'items-center text-center' : 'items-start'}`}>
        <h1 className={`${s.title} font-extrabold text-navy-900`}>
          {wordmark}
        </h1>
        {tagline && (
          <p className={`${s.tagline} font-medium text-teal-700 mt-1`}>
            {tagline}
          </p>
        )}
      </div>
    </div>
  )
}

export default BrandHeader
