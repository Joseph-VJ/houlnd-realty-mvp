import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

        <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer Support</h3>
              <p className="text-gray-900">Email: <a href="mailto:support@houlndrealty.com" className="text-blue-600 hover:underline">support@houlndrealty.com</a></p>
              <p className="text-gray-900">Phone: <a href="tel:+918001234567" className="text-blue-600 hover:underline">+91 800-123-4567</a></p>
              <p className="text-gray-900 text-sm mt-1">Monday - Friday: 9 AM - 6 PM IST</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Inquiries</h3>
              <p className="text-gray-900">Email: <a href="mailto:business@houlndrealty.com" className="text-blue-600 hover:underline">business@houlndrealty.com</a></p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Media & Press</h3>
              <p className="text-gray-900">Email: <a href="mailto:press@houlndrealty.com" className="text-blue-600 hover:underline">press@houlndrealty.com</a></p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Head Office</h3>
              <p className="text-gray-900">Houlnd Realty Pvt. Ltd.</p>
              <p className="text-gray-900">123 Real Estate Plaza</p>
              <p className="text-gray-900">Bandra Kurla Complex</p>
              <p className="text-gray-900">Mumbai, Maharashtra 400001</p>
              <p className="text-gray-900">India</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 text-sm">
            For property-specific inquiries, please use the contact form on the property detail page.
            For general support, reach out to us using the contact information above.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
