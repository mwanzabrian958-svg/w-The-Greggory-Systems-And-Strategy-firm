import React, { useEffect } from 'react'
import BrandHeader from '../../components/BrandHeader'
import { Link } from 'react-router-dom'

export default function MamaGirlsHousing(){
  const title = 'MAMA GIRLS HOUSING AND REAL ESTATE AGENCY — Greggory Properties'
  const metaDescription = 'MAMA GIRLS HOUSING AND REAL ESTATE AGENCY is Greggory Properties\' specialist in property sales, lettings and professional property management.'

  useEffect(() => {
    document.title = title
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = metaDescription
    return () => {
      // optionally restore previous title (no-op here)
    }
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <BrandHeader />
      <h1 className="text-3xl font-bold text-navy-900 mb-2">MAMA GIRLS HOUSING AND REAL ESTATE AGENCY</h1>
      <p className="text-teal-600 font-semibold mb-4">Greggory Properties' dedicated real-estate & property management team</p>

      <p className="text-gray-700 mb-6">MAMA GIRLS HOUSING AND REAL ESTATE AGENCY — a dedicated real estate management and property services subsidiary specializing in residential and commercial property management, sales, and development.</p>

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
          <p className="text-gray-700 mb-4">For enquiries, use the Contact page or email <a href="mailto:info@greggoryproperties.com" className="text-teal-600">info@greggoryproperties.com</a>.</p>
          <Link to="/contact" className="inline-block bg-teal-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
            Contact MAMA GIRLS HOUSING
          </Link>
        </div>
      </section>
    </div>
  )
}
