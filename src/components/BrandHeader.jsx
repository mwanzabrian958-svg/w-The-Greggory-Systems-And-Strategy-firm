import React from 'react'
import { SITE_NAME, SITE_TAGLINE } from '../constants/siteBrand'

const BrandMark = ({ className = '' }) => (
  <img
    src="/brand-header.png/b7.PNG"
    alt="The-Greggory-Systems-And-Strategy-firm Logo"
    className={`${className} object-contain`}
  />
)

const BrandHeader = ({
  align = 'left',
  size = 'md',
  wordmark = SITE_NAME,
  tagline = SITE_TAGLINE,
  wrapperClass = '',
  markOnlyOnMobile = false,
  responsive = false,
}) => {
  const isCenter = align === 'center'
  const sizes = {
    sm: {
      title: 'text-base sm:text-lg',
      tagline: 'text-xs sm:text-xs',
      padding: 'px-2 py-1 sm:px-3 py-2',
      border: 'border-2'
    },
    md: {
      title: 'text-lg sm:text-xl md:text-2xl',
      tagline: 'text-xs sm:text-sm md:text-sm',
      padding: 'px-3 py-2 sm:px-4 py-3',
      border: 'border-2'
    },
    lg: {
      title: 'text-xl sm:text-2xl md:text-3xl',
      tagline: 'text-xs sm:text-sm md:text-base',
      padding: 'px-4 py-2 sm:px-6 py-4',
      border: 'border-2'
    },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className={`inline-block bg-white/90 shadow-md ${s.border} border-navy-900/20 rounded-lg ${s.padding} ${isCenter ? 'mx-auto' : ''} ${wrapperClass}`}>
      <div className={`flex ${isCenter ? 'flex-col items-center text-center' : 'flex-row items-start'}`}>
        <BrandMark className="w-20 h-10 sm:w-24 sm:h-12 md:w-32 md:h-16 mr-3 sm:mr-4" />
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
    </div>
  )
}

export default BrandHeader
