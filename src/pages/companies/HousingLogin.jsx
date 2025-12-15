import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Key, Eye, EyeOff } from 'lucide-react';

const HousingManagementLogin = () => {
  const [userType, setUserType] = useState('manager');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    staffId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const userTypes = [
    {
      id: 'manager',
      name: 'Property Manager',
      icon: Building2,
      description: 'Full property management access',
      color: 'blue'
    },
    {
      id: 'staff',
      name: 'Staff Member',
      icon: Users,
      description: 'Limited staff access',
      color: 'green'
    },
    {
      id: 'tenant',
      name: 'Tenant',
      icon: Key,
      description: 'Tenant portal access',
      color: 'purple'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      
      // Redirect based on user type
      switch(userType) {
        case 'manager':
          navigate('/housing-management/dashboard');
          break;
        case 'staff':
          navigate('/housing-management/staff');
          break;
        case 'tenant':
          navigate('/housing-management/tenant');
          break;
        default:
          navigate('/housing-management/dashboard');
      }
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-navy-900 mb-2">BARAKA HOUSING AGENCY</h1>
            <p className="text-green-600 font-semibold">Management Portal</p>
          </div>
          <p className="text-gray-600">Sign in to access your property management dashboard</p>
        </div>

        {/* User Type Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Your Role</h3>
          <div className="space-y-2">
            {userTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setUserType(type.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    userType === type.id
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${type.color}-100`}>
                    <Icon className={`w-5 h-5 text-${type.color}-600`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{type.name}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Staff ID (for staff/manager) */}
            {(userType === 'manager' || userType === 'staff') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff ID
                </label>
                <input
                  type="text"
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                  placeholder="Enter your staff ID"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 rounded border-gray-300" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-blue-600 hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Help Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Need help? Contact support at <span className="text-blue-600">support@barakahousing.com</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>&copy; 2024 BARAKA HOUSING AGENCY. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default HousingManagementLogin;
