import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Modal } from './Modal';

/**
 * Confirmation Dialog Component
 * Used for destructive actions and important confirmations
 */
export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon: Icon = AlertTriangle
}) {
  
  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
      confirmButtonLoading: 'bg-red-600/50'
    },
    warning: {
      icon: 'bg-yellow-100 text-yellow-600',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      confirmButtonLoading: 'bg-yellow-600/50'
    },
    success: {
      icon: 'bg-green-100 text-green-600',
      confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
      confirmButtonLoading: 'bg-green-600/50'
    },
    info: {
      icon: 'bg-blue-100 text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
      confirmButtonLoading: 'bg-blue-600/50'
    }
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full ${style.icon} flex items-center justify-center mx-auto mb-4`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${style.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );

  // Variants with different icons
}

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, itemName = 'item' }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Confirmation"
      message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      icon={XCircle}
    />
  );
}

export function SaveConfirmDialog({ isOpen, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Save Changes"
      message="Do you want to save your changes? Any unsaved changes will be lost."
      confirmText="Save Changes"
      cancelText="Cancel"
      variant="success"
      icon={CheckCircle}
    />
  );
}

export function WarningDialog({ isOpen, onClose, onConfirm, message }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Warning"
      message={message}
      confirmText="Continue"
      cancelText="Go Back"
      variant="warning"
      icon={AlertTriangle}
    />
  );
}

export function InfoDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText="OK"
      variant="info"
      icon={Info}
    />
  );
}

export default ConfirmDialog;