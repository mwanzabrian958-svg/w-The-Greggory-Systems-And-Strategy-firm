import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MoreVertical, LogOut, User, Settings, HelpCircle, Shield } from 'lucide-react';

/**
 * Dropdown Menu Component
 * Reusable dropdown for navigation and actions
 */
export function DropdownMenu({ trigger, items, position = 'bottom-right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positionClasses = {
    'bottom-right': 'right-0 mt-2',
    'bottom-left': 'left-0 mt-2',
    'top-right': 'right-0 bottom-full mb-2',
    'top-left': 'left-0 bottom-full mb-2'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`absolute ${positionClasses[position]} w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150`}>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider ? (
                <div className="border-t border-gray-100 my-2" />
              ) : (
                <button
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * User Profile Dropdown
 */
export function UserProfileDropdown({ user, onLogout, onViewProfile, onChangePassword }) {
  const displayName = user?.display_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'User';
  
  const items = [
    {
      icon: User,
      label: 'Profile',
      onClick: onViewProfile
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => window.location.href = '/admin/settings'
    },
    {
      divider: true
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      onClick: () => window.location.href = '/admin/support'
    },
    {
      divider: true
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: onLogout,
      danger: true
    }
  ];

  const trigger = (
    <button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="text-left hidden md:block">
        <p className="text-sm font-medium text-gray-900">{displayName}</p>
        <p className="text-xs text-gray-500 capitalize">{user?.admin_level || user?.developer_level || user?.primary_role || 'User'}</p>
      </div>
      <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
    </button>
  );

  return <DropdownMenu trigger={trigger} items={items} position="bottom-right" />;
}

/**
 * Action Menu Dropdown (Three dots)
 */
export function ActionMenu({ items }) {
  const trigger = (
    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <MoreVertical className="w-5 h-5 text-gray-500" />
    </button>
  );

  return <DropdownMenu trigger={trigger} items={items} position="bottom-right" />;
}

/**
 * Status Dropdown
 */
export function StatusDropdown({ currentStatus, onStatusChange }) {
  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-500' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-500' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { value: 'suspended', label: 'Suspended', color: 'bg-red-500' }
  ];

  const items = statusOptions.map(status => ({
    label: status.label,
    onClick: () => onStatusChange(status.value),
    icon: () => (
      <div className={`w-3 h-3 rounded-full ${status.color}`} />
    )
  }));

  const trigger = (
    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
      <div className={`w-2 h-2 rounded-full ${statusOptions.find(s => s.value === currentStatus)?.color || 'bg-gray-500'}`} />
      <span className="text-sm capitalize">{currentStatus}</span>
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </button>
  );

  return <DropdownMenu trigger={trigger} items={items} position="bottom-left" />;
}

/**
 * Filter Dropdown
 */
export function FilterDropdown({ filters, activeFilter, onFilterChange, label = 'Filter' }) {
  const items = filters.map(filter => ({
    label: filter.label,
    onClick: () => onFilterChange(filter.value),
    icon: activeFilter === filter.value ? () => (
      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ) : null
  }));

  const trigger = (
    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </button>
  );

  return <DropdownMenu trigger={trigger} items={items} position="bottom-left" />;
}

export default DropdownMenu;