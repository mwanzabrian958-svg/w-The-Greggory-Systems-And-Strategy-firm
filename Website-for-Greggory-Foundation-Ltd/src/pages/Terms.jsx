import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6">
            <ArrowLeft size={20} />
            Back to Login
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Use</h1>
          <p className="text-gray-300">Last updated: October 19, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using The Greggory Foundation Ltd. website and services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials (information or software) on The Greggory Foundation Ltd.'s website for personal, non-commercial transitory viewing only.
            </p>

            <h2>3. Services</h2>
            <p>
              The Greggory Foundation Ltd. provides project management consulting services including but not limited to business management, innovation & improvement, and dedicated project leadership.
            </p>

            <h2>4. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding content provided by users), features and functionality are and will remain the exclusive property of The Greggory Foundation Ltd.
            </p>

            <h2>6. Confidentiality</h2>
            <p>
              All client information and project details are treated with strict confidentiality in accordance with industry standards and professional ethics.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              In no event shall The Greggory Foundation Ltd. or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on The Greggory Foundation Ltd.'s website.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              The Greggory Foundation Ltd. reserves the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page.
            </p>

            <h2>9. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
              <br />
              Email: thegregoryfoundationltd@gmail.com
              <br />
              Phone: +254799789956
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Terms
