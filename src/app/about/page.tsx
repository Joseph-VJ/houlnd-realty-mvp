import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">About Houlnd Realty</h1>

        <section className="bg-white p-8 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Houlnd Realty is India's first real estate marketplace with transparent pricing per square foot.
            We're revolutionizing the property search experience by eliminating hidden costs and connecting
            buyers directly with verified property owners.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our platform empowers homebuyers with the tools and information they need to make confident
            decisions, while giving property sellers a direct channel to reach genuine buyers.
          </p>
        </section>

        <section className="bg-white p-8 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-semibold mb-4">Why Choose Us?</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-gray-700">Zero brokerage fees - Pay only ₹99 to unlock verified owner contact</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-gray-700">Transparent price per sqft filtering for easy comparison</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-gray-700">Every property verified by our team before going live</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-gray-700">Direct contact with property owners - no intermediaries</span>
            </li>
          </ul>
        </section>

        <section className="bg-white p-8 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Founded in 2024, Houlnd Realty was born out of frustration with the traditional real estate
            industry's lack of transparency. Our founders experienced firsthand the challenges of comparing
            properties when prices were presented without a common metric.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We built Houlnd to solve this problem by making price per square foot the primary filter,
            allowing buyers to make apples-to-apples comparisons and find the best value for their money.
          </p>
        </section>

        <section className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              Email: <a href="mailto:support@houlndrealty.com" className="text-blue-600 hover:underline">support@houlndrealty.com</a>
            </p>
            <p className="text-gray-700">
              Phone: <a href="tel:+918001234567" className="text-blue-600 hover:underline">+91 800-123-4567</a>
            </p>
            <p className="text-gray-700">
              Address: 123 Real Estate Plaza, Mumbai, Maharashtra 400001
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
