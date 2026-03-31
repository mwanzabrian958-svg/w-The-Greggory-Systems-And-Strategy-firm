import React from 'react'

const FloatingWhatsApp = () => {
  const phone = '254799789956'
  const text = encodeURIComponent('Hello! I would like to learn more about your services.')
  const href = `https://wa.me/${phone}?text=${text}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-full shadow-lg transition-colors"
      aria-label="Chat on WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-current">
        <path d="M19.11 17.38c-.29-.14-1.69-.83-1.95-.92-.26-.1-.45-.14-.64.14-.19.29-.74.92-.91 1.11-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.32-1.44-.86-.77-1.44-1.72-1.61-2-.17-.29-.02-.45.12-.59.12-.12.29-.31.43-.46.14-.15.19-.24.29-.41.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.48-.17 0-.36-.02-.55-.02-.19 0-.5.07-.76.36-.26.29-1.01.98-1.01 2.4s1.03 2.79 1.18 2.98c.14.19 2.02 3.08 4.89 4.32.68.29 1.21.46 1.62.59.68.22 1.31.19 1.81.12.55-.08 1.69-.69 1.93-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.33zM16.02 3C8.84 3 3 8.83 3 16.01c0 2.29.61 4.44 1.67 6.3L3 29l6.88-1.8a12.98 12.98 0 0 0 6.14 1.56c7.18 0 12.99-5.82 12.99-13S23.2 3 16.02 3zm7.57 20.57a10.65 10.65 0 0 1-7.57 3.14c-1.31 0-2.58-.26-3.77-.77l-.27-.12-4.09 1.07 1.09-3.99-.13-.27a10.63 10.63 0 1 1 14.74 1.94z"/>
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  )
}

export default FloatingWhatsApp
