import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react'

const VideoDisplay = () => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [images, setImages] = useState({})
  const videoRef = useRef(null)
  const slideshowInterval = useRef(null)

  // Sample media data - mix of videos and images for slideshow
  const mediaItems = [
    {
      type: 'video',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: 'Project Management Excellence',
      description: 'Delivering successful projects worldwide'
    },
    {
      type: 'image',
      imageId: 1,
      title: 'Business Solutions',
      description: 'Innovative approaches to modern challenges',
      duration: 5000 // 5 seconds for images
    },
    {
      type: 'video',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      title: 'Strategic Planning',
      description: 'Building foundations for success'
    },
    {
      type: 'image',
      imageId: 2,
      title: 'Team Collaboration',
      description: 'Working together for better results',
      duration: 5000
    },
    {
      type: 'image',
      imageId: 3,
      title: 'Digital Transformation',
      description: 'Leading the way in technology solutions',
      duration: 5000
    }
  ]

  const currentMedia = mediaItems[currentMediaIndex]

  // Fetch images from database
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imageIds = mediaItems
          .filter(item => item.type === 'image')
          .map(item => item.imageId)
        
        if (imageIds.length === 0) return

        // Fetch images from API
        const imagePromises = imageIds.map(async (id) => {
          try {
            const response = await fetch(`/api/images/${id}`)
            if (response.ok) {
              const imageData = await response.json()
              return { [id]: imageData }
            }
          } catch (error) {
            console.error(`Failed to fetch image ${id}:`, error)
          }
          return null
        })

        const results = await Promise.all(imagePromises)
        const imageMap = results.reduce((acc, result) => {
          if (result) {
            return { ...acc, ...result }
          }
          return acc
        }, {})
        
        setImages(imageMap)
      } catch (error) {
        console.error('Error fetching images:', error)
      }
    }

    fetchImages()
  }, []) // Only run once on mount

  // Auto-advance slideshow
  useEffect(() => {
    const startSlideshow = () => {
      slideshowInterval.current = setInterval(() => {
        if (!isPlaying) {
          nextMedia()
        }
      }, currentMedia.type === 'video' ? 30000 : currentMedia.duration || 5000)
    }

    startSlideshow()

    return () => {
      if (slideshowInterval.current) {
        clearInterval(slideshowInterval.current)
      }
    }
  }, [currentMediaIndex, isPlaying, currentMedia])

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const togglePlay = () => {
    if (currentMedia.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleMediaEnd = () => {
    setIsPlaying(false)
    nextMedia()
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-navy-900 text-white p-3">
        <h4 className="text-sm font-semibold truncate">{currentMedia.title}</h4>
        <p className="text-xs text-gray-300 truncate">{currentMedia.description}</p>
      </div>

      {/* Media Content */}
      <div
        className="relative bg-black"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {currentMedia.type === 'video' ? (
          <video
            ref={videoRef}
            src={currentMedia.src}
            className="w-full h-32 object-cover"
            muted={isMuted}
            onEnded={handleMediaEnd}
            onError={() => {
              console.error('Video failed to load')
              nextMedia()
            }}
          />
        ) : (
          <img
            src={
              currentMedia.imageId && images[currentMedia.imageId] 
                ? images[currentMedia.imageId].file_path 
                : `https://picsum.photos/seed/greggory-${currentMedia.imageId}/400/300.jpg`
            }
            alt={currentMedia.title}
            className="w-full h-32 object-cover"
            onError={() => {
              console.error('Image failed to load')
              nextMedia()
            }}
          />
        )}

        {/* Overlay Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              {currentMedia.type === 'video' && (
                <button
                  onClick={togglePlay}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              )}
              {currentMedia.type === 'video' && (
                <button
                  onClick={toggleMute}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="text-xs">
              {currentMediaIndex + 1} / {mediaItems.length}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Dot Navigation */}
      <div className="bg-gray-50 p-2 flex justify-center gap-1">
        {mediaItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentMediaIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentMediaIndex ? 'bg-teal-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default VideoDisplay
