import React from 'react'
import BrandHeader from '../../components/BrandHeader'

export default function MamaGirlsHousing(){
  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <BrandHeader />
      <h1 className="text-3xl font-bold text-navy-900 mb-4">MAMA GIRLS HOUSING AND REAL ESTATE AGENCY</h1>
      <p className="text-gray-700 mb-6">Greggory Properties presents MAMA GIRLS HOUSING AND REAL ESTATE AGENCY — a dedicated real estate management and property services subsidiary specializing in residential and commercial property management, sales, and development.</p>
      <section className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Our Services</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Property sales and acquisitions</li>
            <li>Property management and maintenance</li>
            <li>Lettings and tenant management</li>
            <li>Real estate advisory and valuation</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-gray-700">For enquiries, use the Contact page or email <a href="mailto:info@greggoryproperties.com" className="text-teal-600">info@greggoryproperties.com</a>.</p>
        </div>
      </section>
    </div>
  )
}
