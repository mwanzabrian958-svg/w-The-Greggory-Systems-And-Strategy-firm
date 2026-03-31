import React from 'react'
import { useAuth } from '../context/AuthContext'

const ProfilePhoto = ({ size = 'w-12 h-12', className = '' }) => {
  const { user, profilePhotoUrl } = useAuth()

  if (!user) {
    return (
      <div className={`${size} ${className} bg-gray-200 rounded-full flex items-center justify-center`}>
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993v-1.986a2 2 0 01-2-2h-3.742v-2.918c0-1.104-.433-2.326-1.104-2.326v-2.918c0-1.104.433-2.326 1.104-2.326v2.918h3.742a2 2 0 01 2 2v17.988c0 1.104.433 2.326 1.104 2.326v-2.918h-3.742a2 2 0 01-2-2z" />
        </svg>
      </div>
    )
  }

  // Use profile photo URL from context instead of blob
  const photoUrl = profilePhotoUrl

  return (
    <div className={`${size} ${className} relative overflow-hidden group`}>
      {photoUrl ? (
        <>
          {/* Profile Photo */}
          <img 
            src={photoUrl}
            alt={`${user.first_name} ${user.last_name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              console.error('Profile photo failed to load:', e)
              e.target.style.display = 'none'
            }}
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="text-white text-xs">
              <div>Profile Photo</div>
              <div className="text-xs opacity-75">Click to change</div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Default Avatar */}
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-teal-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          
          {/* Add Photo Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="text-white text-xs">
              <div>No Photo</div>
              <div className="text-xs opacity-75">Click to add</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProfilePhoto
