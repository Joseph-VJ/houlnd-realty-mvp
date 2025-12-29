import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

        <div className="bg-white p-8 rounded-lg shadow-sm prose max-w-none">
          <p className="text-sm text-gray-900 mb-6">Last updated: December 24, 2025</p>

          <p className="text-gray-900 leading-relaxed mb-6">
            At Houlnd Realty, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
          <p className="text-gray-900 leading-relaxed mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-900">
            <li>Name and contact information (email address, phone number)</li>
            <li>Account credentials (username, password)</li>
            <li>Property preferences and search history</li>
            <li>Payment information (processed securely through Razorpay)</li>
            <li>Communications with us (support tickets, feedback)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Automatically Collected Information</h3>
          <p className="text-gray-900 leading-relaxed mb-4">
            When you use our Platform, we automatically collect:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-900">
            <li>Device information (browser type, operating system, IP address)</li>
            <li>Usage data (pages viewed, time spent, features used)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-900 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-900">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Personalize your experience and show relevant properties</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, prevent, and address fraud and security issues</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing and Disclosure</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">With Property Owners/Promoters</h3>
          <p className="text-gray-900 leading-relaxed mb-4">
            When you unlock contact details for a property, we share your name and contact information
            with the property owner/promoter so they can respond to your inquiry.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">With Service Providers</h3>
          <p className="text-gray-900 leading-relaxed mb-4">
            We share information with third-party service providers who perform services on our behalf,
            including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-900">
            <li>Payment processing (Razorpay)</li>
            <li>Cloud hosting and storage</li>
            <li>Analytics and performance monitoring</li>
            <li>Customer support tools</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">What We Don't Do</h3>
          <p className="text-gray-900 leading-relaxed mb-4">
            We do not sell your personal information to third parties for their marketing purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p className="text-gray-900 leading-relaxed mb-4">
            We use industry-standard security measures to protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-900">
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Secure password hashing (bcrypt)</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
          </ul>
          <p className="text-gray-900 leading-relaxed mb-4">
            However, no method of transmission over the Internet is 100% secure. While we strive to protect
            your information, we cannot guarantee its absolute security.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights and Choices</h2>
          <p className="text-gray-900 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-900">
            <li>Access, update, or delete your personal information through your account settings</li>
            <li>Opt out of marketing communications (unsubscribe link in emails)</li>
            <li>Request a copy of your data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Object to or restrict certain processing of your information</li>
          </ul>
          <p className="text-gray-900 leading-relaxed mb-4">
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@houlndrealty.com" className="text-blue-600 hover:underline">
              privacy@houlndrealty.com
            </a>
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies and Tracking Technologies</h2>
          <p className="text-gray-900 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-900">
            <li>Remember your preferences and settings</li>
            <li>Understand how you use our Platform</li>
            <li>Improve our services and user experience</li>
          </ul>
          <p className="text-gray-900 leading-relaxed mb-4">
            You can control cookies through your browser settings. Note that disabling cookies may affect
            the functionality of the Platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
          <p className="text-gray-900 leading-relaxed mb-4">
            We retain your personal information for as long as necessary to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-900">
            <li>Provide our services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
          <p className="text-gray-900 leading-relaxed mb-4">
            When you delete your account, we will delete or anonymize your personal information within 30 days,
            except where we are required to retain it for legal purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-900 leading-relaxed mb-4">
            Our Platform is not intended for users under the age of 18. We do not knowingly collect
            personal information from children. If you believe we have collected information from a child,
            please contact us immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to This Privacy Policy</h2>
          <p className="text-gray-900 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any material changes
            by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage
            you to review this Privacy Policy periodically.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. International Data Transfers</h2>
          <p className="text-gray-900 leading-relaxed mb-4">
            Your information may be transferred to and processed in countries other than your country of residence.
            These countries may have data protection laws that are different from the laws of your country.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p className="text-gray-900 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <ul className="list-none mb-4 text-gray-900">
            <li>Email: <a href="mailto:privacy@houlndrealty.com" className="text-blue-600 hover:underline">privacy@houlndrealty.com</a></li>
            <li>Phone: <a href="tel:+918001234567" className="text-blue-600 hover:underline">+91 800-123-4567</a></li>
            <li>Address: 123 Real Estate Plaza, Mumbai, Maharashtra 400001, India</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
}
