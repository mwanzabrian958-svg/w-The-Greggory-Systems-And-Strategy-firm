import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6">
            <ArrowLeft size={20} />
            Back to Login
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-300">Last updated: October 19, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul>
              <li>Name, email address, and contact information</li>
              <li>Company name and professional details</li>
              <li>Account credentials and preferences</li>
              <li>Communications with us</li>
              <li>Project-related information you submit</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new services and features</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not share your personal information with third parties except:
            </p>
            <ul>
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and property</li>
              <li>With service providers who assist our operations</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Export your data</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>

            <h2>7. Third-Party Services</h2>
            <p>
              Our Service may contain links to third-party websites or services that are not owned or controlled by THE GREGGORY FOUNDATION LTD. We have no control over and assume no responsibility for their privacy policies.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our Service does not address anyone under the age of 18. We do not knowingly collect personally identifiable information from anyone under 18.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
              <br />
              Email: brianmwanza651@gmail.com
              <br />
              Phone: +254799789956
              <br />
              Address: rafiki kabarak, kabarak
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Privacy
