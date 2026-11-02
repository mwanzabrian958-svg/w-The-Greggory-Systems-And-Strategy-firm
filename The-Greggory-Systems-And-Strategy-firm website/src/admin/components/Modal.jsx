import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true
}) {
  const modalRef = useRef(null);
  
  // Size classes — all full-screen occupation, no centered popups
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = previousOverflow;
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] h-[100dvh] w-screen bg-white"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="flex h-full w-full flex-col overflow-hidden bg-white"
      >
        {title && (
          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="group rounded-xl p-2 transition-all hover:bg-slate-100"
              >
                <X className="h-6 w-6 text-slate-500 transition-colors group-hover:text-rose-500" />
              </button>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto bg-white p-6 text-slate-900 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;