import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal Component - Reusable modal with backdrop blur and animations
 * Used throughout admin panel for forms, confirmations, and detailed views
 */
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true
}) {
  const modalRef = useRef(null);
  
  // Size classes — all full-screen occupation, no centered popups
  const sizeClasses = {
    sm: 'w-full max-h-[95vh]',
    md: 'w-full max-h-[95vh]',
    lg: 'w-full max-h-[95vh]',
    xl: 'w-full max-h-[95vh]',
    full: 'w-full h-[95vh]',
    screen: 'w-screen h-screen'
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isScreen = size === 'screen';

  return (
    <div 
      className={`fixed inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-md p-0`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300`} />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} bg-[#0f172a]/95 backdrop-blur-md ${isScreen ? 'h-screen rounded-none' : 'rounded-none'} overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all group"
              >
                <X className="w-6 h-6 text-slate-400 group-hover:text-rose-500 transition-colors" />
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;