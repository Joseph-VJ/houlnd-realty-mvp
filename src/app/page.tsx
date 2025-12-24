import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">Houlnd</div>
              <div className="text-sm text-gray-500">Realty</div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16 text-center sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Find Your Perfect Property
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            India's first real estate marketplace with transparent pricing per square foot.
            <br />
            Zero brokerage. Direct owner contact. Verified listings.
          </p>

          {/* Primary CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/register?type=customer"
              className="group relative w-full sm:w-auto"
            >
              <div className="rounded-xl border-2 border-blue-600 bg-white p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-3xl mb-3">🏠</div>
                <div className="text-xl font-bold text-gray-900 mb-2">I Want to Buy</div>
                <div className="text-sm text-gray-600 mb-4">
                  Browse verified properties with transparent pricing
                </div>
                <div className="inline-flex items-center text-blue-600 font-medium">
                  Get Started
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link
              href="/register?type=promoter"
              className="group relative w-full sm:w-auto"
            >
              <div className="rounded-xl border-2 border-green-600 bg-white p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-3xl mb-3">💼</div>
                <div className="text-xl font-bold text-gray-900 mb-2">I Want to Sell</div>
                <div className="text-sm text-gray-600 mb-4">
                  List your property and connect with genuine buyers
                </div>
                <div className="inline-flex items-center text-green-600 font-medium">
                  List Property
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Value Props */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                ₹
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Zero Brokerage</h3>
              <p className="mt-2 text-sm text-gray-600">
                Pay only ₹99 to unlock verified owner contact. No hidden charges.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Verified Listings</h3>
              <p className="mt-2 text-sm text-gray-600">
                Every property is verified by our team before going live.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                📊
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Sq.ft Price Filter</h3>
              <p className="mt-2 text-sm text-gray-600">
                India's first marketplace with transparent price per square foot filtering.
              </p>
            </div>
          </div>

          {/* Browse Link */}
          <div className="mt-12">
            <Link
              href="/search"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse Properties Without Signup →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Houlnd Realty. All rights reserved.</p>
            <div className="mt-2 flex justify-center gap-6">
              <Link href="/about" className="hover:text-gray-700">About</Link>
              <Link href="/contact" className="hover:text-gray-700">Contact</Link>
              <Link href="/legal/terms" className="hover:text-gray-700">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-gray-700">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
