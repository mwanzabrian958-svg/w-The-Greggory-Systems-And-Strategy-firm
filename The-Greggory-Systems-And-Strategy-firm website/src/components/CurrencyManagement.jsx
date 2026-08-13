import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Globe, 
  TrendingUp, 
  Star, 
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Calculator
} from 'lucide-react'
import {
  getActiveCurrencies,
  searchCurrencies,
  getDefaultCurrency,
  convertCurrency,
  getUniqueRegions,
  updateExchangeRate,
  bulkUpdateExchangeRates,
  setDefaultCurrency,
  toggleCurrencyActive,
  suggestCurrencyByLocation,
  formatCurrency
} from '../utils/currencyUtils'

const CurrencyManagement = ({ onRefresh }) => {
  const [currencies, setCurrencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(null)
  const [conversionResult, setConversionResult] = useState(null)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    exchange_rate: '',
    region: '',
    is_active: true
  })

  const [conversionData, setConversionData] = useState({
    amount: '',
    from_currency: 'KES',
    to_currency: 'USD'
  })

  useEffect(() => {
    loadCurrencies()
  }, [searchTerm, filterRegion, showActiveOnly])

  const loadCurrencies = () => {
    setLoading(true)
    try {
      const filteredCurrencies = searchCurrencies(searchTerm, filterRegion, showActiveOnly)
      setCurrencies(filteredCurrencies)
    } catch (error) {
      console.error('Error loading currencies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCurrency = () => {
    // Note: System currencies are predefined, this is for demonstration
    alert('System currencies are predefined. Use the edit function to modify existing currencies.')
    setShowAddModal(false)
    resetForm()
  }

  const handleUpdateCurrency = () => {
    try {
      // Update exchange rate for the selected currency
      const success = updateExchangeRate(formData.code, parseFloat(formData.exchange_rate))
      
      if (success) {
        setShowEditModal(false)
        resetForm()
        loadCurrencies()
        if (onRefresh) onRefresh()
        alert('Currency updated successfully')
      } else {
        alert('Failed to update currency')
      }
    } catch (error) {
      console.error('Error updating currency:', error)
      alert('Error updating currency')
    }
  }

  const handleSetDefault = (currencyCode) => {
    try {
      const success = setDefaultCurrency(currencyCode)
      
      if (success) {
        loadCurrencies()
        if (onRefresh) onRefresh()
        alert('Default currency updated successfully')
      } else {
        alert('Failed to set default currency')
      }
    } catch (error) {
      console.error('Error setting default currency:', error)
      alert('Error setting default currency')
    }
  }

  const handleDeactivateCurrency = (currencyCode) => {
    if (!confirm('Are you sure you want to deactivate this currency?')) return

    try {
      const success = toggleCurrencyActive(currencyCode)
      
      if (success) {
        loadCurrencies()
        if (onRefresh) onRefresh()
        alert('Currency deactivated successfully')
      } else {
        alert('Failed to deactivate currency')
      }
    } catch (error) {
      console.error('Error deactivating currency:', error)
      alert('Error deactivating currency')
    }
  }

  const handleConvertCurrency = () => {
    try {
      if (!conversionData.amount || !conversionData.from_currency || !conversionData.to_currency) {
        alert('Please fill in all conversion fields')
        return
      }

      const result = convertCurrency(
        parseFloat(conversionData.amount),
        conversionData.from_currency,
        conversionData.to_currency
      )
      
      setConversionResult(result)
    } catch (error) {
      console.error('Error converting currency:', error)
      alert('Error converting currency: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      exchange_rate: '',
      region: '',
      is_active: true
    })
  }

  const openEditModal = (currency) => {
    setSelectedCurrency(currency)
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchange_rate: currency.exchange_rate,
      region: currency.region || '',
      is_active: currency.is_active
    })
    setShowEditModal(true)
  }

  const getUniqueRegionsFromSystem = () => {
    return getUniqueRegions()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading currencies...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Currency Management</h2>
          <p className="text-gray-600">Manage currencies and exchange rates for international clients</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConvertModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            Convert Currency
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Currency
          </button>
          <button
            onClick={loadCurrencies}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Regions</option>
            {getUniqueRegionsFromSystem().map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Active only</span>
          </label>
        </div>
      </div>

      {/* Currency List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exchange Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currencies.map((currency) => (
              <tr key={currency.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {currency.name}
                        {currency.isDefault && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      </div>
                      {currency.isDefault && (
                        <div className="text-xs text-gray-500">Default Currency</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                    {currency.code}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {currency.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>{currency.exchangeRate}</span>
                    <span className="text-xs text-gray-500">to KES</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {currency.region || 'Global'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    currency.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currency.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {!currency.isDefault && (
                      <button
                        onClick={() => handleSetDefault(currency.code)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Set as Default"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(currency)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {currency.isActive ? (
                      <button
                        onClick={() => handleDeactivateCurrency(currency.code)}
                        className="text-red-600 hover:text-red-800"
                        title="Deactivate"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleCurrencyActive(currency.code)}
                        className="text-green-600 hover:text-green-800"
                        title="Reactivate"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currencies.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No currencies found</h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first currency.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Currency
            </button>
          </div>
        )}
      </div>

      {/* Add Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New Currency</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                <input
                  type="text"
                  placeholder="USD"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Name</label>
                <input
                  type="text"
                  placeholder="US Dollar"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                <input
                  type="text"
                  placeholder="$"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Rate (to KES)</label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="0.0065"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData({...formData, exchange_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  placeholder="United States"
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">Active</label>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCurrency}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Currency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Currency Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Currency</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                <input
                  type="text"
                  value={formData.code}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Rate (to KES)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData({...formData, exchange_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">Active</label>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCurrency}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Currency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Converter Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Currency Converter</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="1000"
                  value={conversionData.amount}
                  onChange={(e) => setConversionData({...conversionData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <select
                    value={conversionData.from_currency}
                    onChange={(e) => setConversionData({...conversionData, from_currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getActiveCurrencies().map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <select
                    value={conversionData.to_currency}
                    onChange={(e) => setConversionData({...conversionData, to_currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getActiveCurrencies().map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleConvertCurrency}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Convert
              </button>
              
              {conversionResult && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Conversion Result</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Original:</span> {conversionResult.original_amount} {conversionResult.from_currency}</p>
                    <p><span className="font-medium">Converted:</span> {conversionResult.converted_amount.toFixed(2)} {conversionResult.to_currency}</p>
                    <p><span className="font-medium">Exchange Rate:</span> {conversionResult.exchange_rate_used.toFixed(6)}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowConvertModal(false)
                  setConversionResult(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CurrencyManagement
