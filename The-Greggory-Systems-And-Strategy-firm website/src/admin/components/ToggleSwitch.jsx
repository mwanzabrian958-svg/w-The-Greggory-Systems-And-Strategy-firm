import React from 'react';

/**
 * Toggle Switch Component
 * Used for boolean settings like maintenance mode, registration, etc.
 */
export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md',
  className = ''
}) {
  const sizeStyles = {
    sm: {
      switch: 'h-5 w-9',
      circle: 'h-3 w-3',
      translate: checked ? 'translate-x-4' : 'translate-x-1'
    },
    md: {
      switch: 'h-6 w-11',
      circle: 'h-4 w-4',
      translate: checked ? 'translate-x-6' : 'translate-x-1'
    },
    lg: {
      switch: 'h-7 w-13',
      circle: 'h-5 w-5',
      translate: checked ? 'translate-x-7' : 'translate-x-1'
    }
  };

  const style = sizeStyles[size];

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1">
        {label && (
          <label className={`block font-medium text-gray-900 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
            {label}
          </label>
        )}
        {description && (
          <p className={`text-gray-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {description}
          </p>
        )}
      </div>
      
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex ${style.switch} items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block ${style.circle} transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${style.translate}`}
        />
      </button>
    </div>
  );
}

/**
 * Toggle Group Component
 * For grouping related toggles
 */
export function ToggleGroup({ children, title, description }) {
  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export default ToggleSwitch;