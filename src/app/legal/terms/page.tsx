import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>

        <div className="bg-white p-8 rounded-lg shadow-sm prose max-w-none">
          <p className="text-sm text-gray-600 mb-6">Last updated: December 24, 2025</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing and using Houlnd Realty ("the Platform"), you accept and agree to be bound by the terms
            and provisions of this agreement. If you do not agree to these terms, please do not use the Platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Permission is granted to temporarily use Houlnd Realty for personal, non-commercial
            transitory viewing and property searching only. This license does not include:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for commercial purposes</li>
            <li>Attempting to reverse engineer any software on the Platform</li>
            <li>Removing any copyright or proprietary notations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            When you create an account with us, you must provide accurate, complete, and current information.
            Failure to do so constitutes a breach of the Terms. You are responsible for safeguarding your password
            and for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Property Listings</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All property listings must be accurate, truthful, and not misleading. Promoters are responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Providing accurate property details, pricing, and location information</li>
            <li>Uploading genuine property photographs</li>
            <li>Updating listing status (sold, rented, etc.) promptly</li>
            <li>Responding to genuine buyer inquiries in a timely manner</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            Houlnd Realty reserves the right to remove any listing that violates our policies or is found to be fraudulent.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Payment Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The contact unlock fee of ₹99 (plus applicable taxes) is:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Non-refundable once contact information is revealed</li>
            <li>Valid for lifetime access to that specific property's contact details</li>
            <li>Processed securely through our payment partner Razorpay</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. User Conduct</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Harass, abuse, or harm other users</li>
            <li>Post false, inaccurate, or misleading information</li>
            <li>Scrape or extract data from the Platform using automated means</li>
            <li>Attempt to gain unauthorized access to any systems or networks</li>
            <li>Use the Platform for any illegal or unauthorized purpose</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Platform and its original content, features, and functionality are owned by Houlnd Realty
            and are protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disclaimer of Warranties</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Platform is provided on an "as is" and "as available" basis. Houlnd Realty makes no warranties,
            expressed or implied, regarding the accuracy, reliability, or availability of the Platform or the
            information contained therein.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Houlnd Realty shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages resulting from your use of or inability to use the Platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We reserve the right to modify these terms at any time. We will notify users of any material changes
            via email or through a notice on the Platform. Continued use of the Platform after such modifications
            constitutes acceptance of the updated terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms shall be governed by and construed in accordance with the laws of India, without regard
            to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            Questions about the Terms of Service should be sent to{' '}
            <a href="mailto:legal@houlndrealty.com" className="text-blue-600 hover:underline">
              legal@houlndrealty.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
