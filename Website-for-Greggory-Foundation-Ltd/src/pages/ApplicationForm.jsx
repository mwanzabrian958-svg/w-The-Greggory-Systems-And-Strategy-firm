import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ApplicationForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    employerName: '',
    employerAddress: '',
    employerPhone: '',
    monthlyIncome: '',
    applicantSignature: '',
    providerName: '',
    providerSignature: ''
  });

  const [tenants, setTenants] = useState([
    { id: 1, fullName: '', idNumber: '', phoneNumber: '', email: '', employerName: '', employerAddress: '', employerPhone: '', monthlyIncome: '', applicantSignature: '', photo: '' }
  ]);

  // Room navigation state
  const [currentRoom, setCurrentRoom] = useState(1);

  const goToPreviousRoom = () => {
    if (currentRoom > 1) {
      setCurrentRoom(currentRoom - 1);
    }
  };

  const goToNextRoom = () => {
    // Allow navigation up to room 20 for demo purposes
    if (currentRoom < 20) {
      setCurrentRoom(currentRoom + 1);
    }
  };

  const [showContactMessage, setShowContactMessage] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const addTenant = () => {
    const newTenantId = Math.max(...tenants.map(t => t.id)) + 1;
    setTenants([...tenants, { 
      id: newTenantId, 
      fullName: '', 
      idNumber: '', 
      phoneNumber: '', 
      email: '', 
      employerName: '', 
      employerAddress: '', 
      employerPhone: '', 
      monthlyIncome: '', 
      applicantSignature: '',
      photo: ''
    }]);
  };

  const removeTenant = (id) => {
    if (tenants.length > 1) {
      setTenants(tenants.filter(tenant => tenant.id !== id));
    }
  };

  const handleTenantChange = (id, field, value) => {
    setTenants(tenants.map(tenant => 
      tenant.id === id ? { ...tenant, [field]: value } : tenant
    ));
  };

  const handleTenantPhotoUpload = (tenantId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTenants(tenants.map(tenant => 
          tenant.id === tenantId ? { ...tenant, photo: reader.result } : tenant
        ));
      };
      reader.readAsDataURL(file);
    } else {
      // Handle photo removal
      setTenants(tenants.map(tenant => 
        tenant.id === tenantId ? { ...tenant, photo: '' } : tenant
      ));
    }
  };

  // Get property and room info from URL parameters
  const propertyId = searchParams.get('propertyId');
  const roomId = searchParams.get('roomId');

  // Mock property data (in real app, this would come from API or context)
  const getPropertyInfo = (id) => {
    const properties = {
      '1': { name: 'Modern Apartment', building: 'Baraka Heights', location: 'Kangundo Town', price: 15000, securityDeposit: 15000 },
      '2': { name: 'Cozy Studio', building: 'Tala Plaza', location: 'Tala Town', price: 8000, securityDeposit: 8000 },
      '3': { name: 'Luxury Suite', building: 'Greggory Court', location: 'Kangundo', price: 25000, securityDeposit: 25000 }
    };
    return properties[id] || { name: 'Property Name', building: 'Building Name', location: 'Location', price: 0, securityDeposit: 0 };
  };

  const selectedProperty = getPropertyInfo(propertyId);

  useEffect(() => {
    document.title = 'Rental Application Form - BARAKA HOUSING AGENCY';
  }, []);

  const handleFormChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const printApplication = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" id="application-form">
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
          
          body {
            font-size: 12px;
            line-height: 1.4;
          }
          
          .min-h-screen {
            min-height: auto;
          }
          
          .max-w-4xl {
            max-width: 100%;
          }
          
          .bg-gray-50 {
            background: white;
          }
          
          .bg-white {
            background: white;
          }
          
          .shadow-lg {
            box-shadow: none;
          }
          
          .rounded-lg {
            border-radius: 0;
          }
          
          .mb-8 {
            margin-bottom: 1rem;
            page-break-inside: avoid;
          }
          
          .space-y-4 > * {
            margin-bottom: 0.5rem;
          }
          
          .space-y-6 > * {
            margin-bottom: 0.75rem;
          }
          
          .space-y-3 > * {
            margin-bottom: 0.25rem;
          }
          
          .text-lg {
            font-size: 14px;
          }
          
          .text-xl {
            font-size: 16px;
          }
          
          .text-2xl {
            font-size: 18px;
          }
          
          .p-6 {
            padding: 12px;
          }
          
          .p-4 {
            padding: 8px;
          }
          
          .px-4, .px-3 {
            padding-left: 6px;
            padding-right: 6px;
          }
          
          .py-2 {
            padding-top: 4px;
            padding-bottom: 4px;
          }
          
          .w-32, .w-24, .w-20 {
            width: 80px;
            height: 80px;
          }
          
          .border-2 {
            border-width: 1px;
          }
          
          .border-dashed {
            border-style: solid;
          }
          
          h3 {
            page-break-after: avoid;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          
          .flex {
            display: block;
          }
          
          .flex-1 {
            width: 100%;
            margin-bottom: 0.5rem;
          }
          
          .flex-shrink-0 {
            float: right;
            margin: 0 0 0.5rem 0.5rem;
          }
          
          input {
            border: 1px solid #000 !important;
            background: white !important;
          }
          
          .bg-gray-200 {
            background: white !important;
          }
          
          .border-gray-400 {
            border-color: #000 !important;
          }
          
          .bg-gradient-to-r {
            background: #f8f9fa !important;
            color: #000 !important;
          }
        }
      `}</style>
      
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          /* Page break styling */
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Ensure sections fit on single page */
          .print-section {
            page-break-inside: avoid;
            break-inside: avoid;
            max-height: 90vh;
            overflow: visible;
          }
          
          /* Main container styling */
          body {
            margin: 0;
            padding: 0;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
          
          /* Ensure proper spacing for printing */
          .mb-8 {
            margin-bottom: 2rem !important;
          }
          
          .space-y-6 > * + * {
            margin-top: 1.5rem !important;
          }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Form Header */}
        <div className="bg-teal-600 text-white p-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/brand-header.png/sam.PNG" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">Rental Application Form</h1>
            <p className="text-teal-100 text-lg">BARAKA HOUSING AGENCY</p>
            <p className="text-teal-200 text-sm mt-1">Your Trusted Housing Partner</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">

          {/* Tenant Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tenant Information</h3>
            <div className="mb-4">
              <button
                onClick={addTenant}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-md flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Add Tenant
              </button>
            </div>
            {tenants.map((tenant, index) => (
              <div key={tenant.id} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">Tenant {index + 1}</h4>
                  {tenants.length > 1 && (
                    <button
                      onClick={() => removeTenant(tenant.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex items-start gap-6">
                  {/* Tenant Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-40 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
                      {tenant.photo ? (
                        <img 
                          src={tenant.photo} 
                          alt={`Tenant ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          <span className="text-gray-500 text-xs">Tenant {index + 1} Photo</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200">
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById(`file-input-${tenant.id}`).click();
                              }}
                              className="bg-white text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-100 transition-colors"
                            >
                              📁 Files
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById(`camera-input-${tenant.id}`).click();
                              }}
                              className="bg-white text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-100 transition-colors"
                            >
                              📷 Camera
                            </button>
                          </div>
                          {tenant.photo && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTenantPhotoUpload(tenant.id, null);
                              }}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                            >
                              🗑️ Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        id={`file-input-${tenant.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleTenantPhotoUpload(tenant.id, e.target.files[0])}
                        className="hidden"
                      />
                      <input
                        id={`camera-input-${tenant.id}`}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleTenantPhotoUpload(tenant.id, e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  </div>
                  {/* Tenant Information Fields */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={tenant.fullName}
                          onChange={(e) => handleTenantChange(tenant.id, 'fullName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                        <input
                          type="text"
                          value={tenant.idNumber}
                          onChange={(e) => handleTenantChange(tenant.id, 'idNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Enter ID number"
                        />
                      </div>
                    </div>
                    {/* Tenant Signature */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tenant {index + 1} Signature</label>
                      <input
                        type="text"
                        value={tenant.applicantSignature}
                        onChange={(e) => handleTenantChange(tenant.id, 'applicantSignature', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Sign here"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Room Information */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Selected Property Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Property:</span> {selectedProperty.name}
              </div>
              <div>
                <span className="font-medium">Building:</span> {selectedProperty.building}
              </div>
              <div>
                <span className="font-medium">Location:</span> {selectedProperty.location}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">🔢Room:</span>
                <button 
                  onClick={goToPreviousRoom}
                  disabled={currentRoom === 1}
                  className="no-print p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  title="Previous Room"
                >
                  <span className="text-gray-500 hover:text-gray-700">◀</span>
                </button>
                <div className="px-3 py-1 bg-gray-100 rounded border border-gray-300 min-w-[3rem] text-center">
                  <span className="text-sm font-medium text-gray-800">{currentRoom}</span>
                </div>
                <button 
                  onClick={goToNextRoom}
                  disabled={currentRoom === 20}
                  className="no-print p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  title="Next Room"
                >
                  <span className="text-gray-500 hover:text-gray-700">▶</span>
                </button>
              </div>
              <div>
                <span className="font-medium">Floor:</span> 1st Floor
              </div>
              <div>
                <span className="font-medium">Rent:</span> KES {selectedProperty.price.toLocaleString()}/month
              </div>
              <div>
                <span className="font-medium">Security Deposit:</span> KES {selectedProperty.securityDeposit.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Total Move-in Cost:</span> KES {(selectedProperty.price + selectedProperty.securityDeposit).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Rules and Regulations */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Rules and Regulations</h3>
            <div className="space-y-6">
              {/* Agent Responsibilities */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">1. AGENT RESPONSIBILITIES</h4>
                <p className="text-sm text-gray-700 mb-3">The Agent, on behalf of the Landlord, shall have the following responsibilities:</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside ml-6">
                  <li><span className="font-semibold">Property Maintenance and Repairs:</span> To maintain the Property in a habitable condition and to perform necessary repairs to the structure, systems, and appliances provided with the Property.</li>
                  <li><span className="font-semibold">Rent Collection and Financial Management:</span> To collect rent and manage all financial aspects related to the Property.</li>
                  <li><span className="font-semibold">Tenant Screening and Placement:</span> To have conducted the screening process for this tenancy.</li>
                  <li><span className="font-semibold">Regular Property Inspections:</span> To conduct regular inspections of the Property with proper notice.</li>
                </ul>
              </div>

              {/* Tenant Responsibilities */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">2. TENANT RESPONSIBILITIES</h4>
                <p className="text-sm text-gray-700 mb-3">The Tenant shall have the following responsibilities:</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside ml-6">
                  <li><span className="font-semibold">Timely Rent Payment:</span> To pay the full amount of rent on or before the 5th day of each month.</li>
                  <li><span className="font-semibold">Property Cleanliness and Maintenance:</span> To maintain the Property in a clean and sanitary condition and to promptly alert the Agent to any needed repairs.</li>
                  <li><span className="font-semibold">No Unauthorized Modifications:</span> Not to make any alterations, repairs, or modifications to the Property without the prior written consent of the Agent.</li>
                  <li><span className="font-semibold">Proper Waste Disposal:</span> To dispose of all waste in a clean and sanitary manner.</li>
                  <li><span className="font-semibold">Respect for Neighbors and Property Rules:</span> To conduct themselves in a manner that does not disturb neighbors and to comply with all reasonable rules of the Property.</li>
                </ul>
              </div>

              {/* Landlord Rights */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">3. LANDLORD RIGHTS</h4>
                <p className="text-sm text-gray-700 mb-3">The Landlord, through the Agent, reserves the following rights:</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside ml-6">
                  <li><span className="font-semibold">Property Access:</span> To enter the Property for necessary purposes (e.g., inspections, repairs) after providing the Tenant with 24-hour notice, except in cases of emergency.</li>
                  <li><span className="font-semibold">Rent Review:</span> To review and adjust the rent as per the terms agreed upon in this Agreement, upon renewal.</li>
                  <li><span className="font-semibold">Termination Rights:</span> To terminate the tenancy as per the lease terms and in accordance with state law for cause, including but not limited to non-payment of rent or material breach of this Agreement.</li>
                  <li><span className="font-semibold">Security Deposit Retention:</span> To retain all or part of the security deposit to cover the costs of repairing damages beyond normal wear and tear, outstanding rent, or necessary cleaning after the Tenant vacates.</li>
                </ul>
              </div>

              {/* Lease Termination and Deposit Refund */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">4. LEASE TERMINATION AND DEPOSIT REFUND</h4>
                <p className="text-sm text-gray-700 mb-3">In case of lease termination, the following process shall apply:</p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside ml-6">
                  <li><span className="font-semibold">Notice Period:</span> The Tenant must provide at least 30 days written notice before vacating the Property. Failure to provide proper notice may result in forfeiture of the security deposit.</li>
                  <li><span className="font-semibold">Property Inspection:</span> A joint inspection will be conducted by the Agent and Tenant within 48 hours of vacating to assess the Property condition and document any damages.</li>
                  <span className="font-semibold">Deposit Refund Process:</span> The Tenant must submit a written request for security deposit refund within 7 days of vacating, including:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Forwarding address for deposit mailing</li>
                    <li>Copy of the lease termination notice</li>
                    <li>Utility clearance certificates from service providers</li>
                    <li>Property handover checklist signed by both parties</li>
                  </ul>
                  <li><span className="font-semibold">Refund Timeline:</span> The security deposit will be refunded within 21 business days of Property vacating, subject to deductions for:</li>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Unpaid rent or utility bills</li>
                    <li>Cost of repairs beyond normal wear and tear</li>
                    <li>Professional cleaning services if required</li>
                    <li>Replacement of damaged or missing items</li>
                  </ul>
                  <li><span className="font-semibold">Dispute Resolution:</span> In case of deposit refund disputes, both parties agree to first attempt mediation through BARAKA HOUSING AGENCY before pursuing legal action.</li>
                </ul>
              </div>
            </div>
          </div>


          {/* Contract Agreement */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contract Agreement</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  This Rental Agreement is entered into on this date _______________ between Agent Name _______________ and the undersigned Tenant 1 Name _______________.
                  The Tenant(s) agree to lease the specified property in accordance with the terms and conditions outlined in this agreement, including payment of rent, maintenance obligations, and compliance with all property rules and regulations.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The Agent agrees to provide the Tenant(s) with peaceful enjoyment of the premises and maintain the property in habitable condition. Both parties acknowledge their respective rights and responsibilities as detailed in the Rules and Regulations section of this form. This agreement constitutes a legally binding contract upon execution by both parties. The undersigned Tenant 1 Name / Organization _______________ hereby acknowledge and accept all terms and conditions herein.
                </p>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Signatures</h3>
            <div className="space-y-6">
              {/* Tenant Signatures */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Signature(s)</label>
                <div className="space-y-3">
                  {tenants.map((tenant, index) => (
                    <div key={tenant.id}>
                      <label className="block text-xs text-gray-600 mb-1">Tenant {index + 1} Signature</label>
                      <input
                        type="text"
                        name={`tenantSignature_${tenant.id}`}
                        value={formData[`tenantSignature_${tenant.id}`] || ''}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder={`Tenant ${index + 1} signature`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Staff Name and Signature */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
                  <input
                    type="text"
                    name="providerName"
                    value={formData.providerName || ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter agency staff name"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff Signature</label>
                  <input
                    type="text"
                    name="providerSignature"
                    value={formData.providerSignature}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Staff signature"
                  />
                </div>
                {/* Company Stamp - Bottom Right */}
                <div className="flex-shrink-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Stamp</label>
                  <div className="w-32 h-32 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs text-center"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6 border-t">
            <button
              onClick={() => window.close()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close Window
            </button>
            <button
              onClick={printApplication}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Print Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
