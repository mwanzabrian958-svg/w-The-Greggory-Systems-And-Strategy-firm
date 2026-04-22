import { useState, useRef } from 'react'
import { Camera, X, Check, Loader2, User } from 'lucide-react'

export default function AdminProfilePhoto({ adminId, currentImageId, onPhotoUpdate }) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError('')
    setSuccess('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target.result)
    reader.readAsDataURL(file)

    // Convert to base64 and upload
    setIsUploading(true)
    
    try {
      const base64Reader = new FileReader()
      base64Reader.onload = async (e) => {
        const base64String = e.target.result.split(',')[1]
        
        const response = await fetch(`/api/admin-verification/profile/${adminId}/photo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataBase64: base64String,
            contentType: file.type,
            fileName: file.name
          })
        })

        const data = await response.json()

        if (data.success) {
          setSuccess('Profile photo updated successfully!')
          onPhotoUpdate?.(data.image_id)
        } else {
          setError(data.message || 'Failed to upload photo')
        }
        setIsUploading(false)
      }
      base64Reader.readAsDataURL(file)
    } catch (err) {
      setError('Network error. Please try again.')
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!currentImageId) return
    
    setIsUploading(true)
    try {
      // Update profile to remove photo reference
      const response = await fetch(`/api/admin-verification/profile/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_image_id: null })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Photo removed successfully')
        setPreviewUrl(null)
        onPhotoUpdate?.(null)
      } else {
        setError(data.message || 'Failed to remove photo')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
    setIsUploading(false)
  }

  const getImageUrl = () => {
    if (previewUrl) return previewUrl
    if (currentImageId) return `/api/images/${currentImageId}`
    return null
  }

  const imageUrl = getImageUrl()

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5" />
        Profile Photo
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        {/* Photo Preview */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            {imageUrl ? 'Change Photo' : 'Add Photo'}
          </button>

          {(imageUrl || currentImageId) && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-xs text-gray-500 text-center">
          Supported formats: JPG, PNG, GIF<br />
          Max size: 5MB
        </p>
      </div>
    </div>
  )
}
