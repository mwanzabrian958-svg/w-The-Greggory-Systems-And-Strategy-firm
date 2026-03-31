import React from 'react'
import { Link } from 'react-router-dom'

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and optional heading */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <img 
              src="/brand-header.png/sja.PNG" 
              alt="SJA" 
              className="h-[144px] w-auto object-contain"
              style={{ display: 'block' }}
            />
          </div>
          {title ? <h2 className="text-2xl font-bold text-navy-900 mt-6">{title}</h2> : null}
          {subtitle ? <p className="text-gray-500 text-sm mt-2">{subtitle}</p> : null}
        </div>

        {children}
      </div>
    </div>
  )
}

export default AuthLayout
