import React from 'react';
import { Mail, Lock, User, Phone, MapPin, Building2, Briefcase, Search, X, Check, AlertCircle } from 'lucide-react';

/**
 * Form Input Component with validation and icons
 * Reusable input component for all admin forms
 */
export function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon: Icon,
  name,
  autoComplete,
  className = '',
  showClearButton = false,
  onClear,
  helperText
}) {
  const inputId = name || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        )}
        
        <input
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${showClearButton ? 'pr-10' : 'pr-4'} py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        
        {showClearButton && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Email Input Component
 */
export function EmailInput(props) {
  return <FormInput {...props} type="email" icon={Mail} autoComplete="email" />;
}

/**
 * Password Input Component
 */
export function PasswordInput({ showPassword, onTogglePassword, ...props }) {
  return (
    <div className="relative">
      <FormInput {...props} type={showPassword ? 'text' : 'password'} icon={Lock} autoComplete="current-password" />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
      </button>
    </div>
  );
}

/**
 * Textarea Component
 */
export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 4,
  helperText,
  className = ''
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
          error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Select Component
 */
export function Select({
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  helperText,
  className = ''
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
          error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Search Input Component
 */
export function SearchInput({ value, onChange, placeholder = 'Search...', onClear, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default FormInput;