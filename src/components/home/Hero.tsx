import Link from "next/link";

export function Hero() {
  return (
    <div className="py-16 text-center sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Find Your Perfect Property
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
        India&apos;s first real estate marketplace with transparent pricing per square foot.
        <br />
        Zero brokerage. Direct owner contact. Verified listings.
      </p>

      {/* Primary CTAs */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
        <Link
          href="/auth-decision?intent=buy"
          className="group relative w-full sm:w-auto"
        >
          <div className="rounded-xl border-2 border-blue-600 bg-white p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-4xl mb-3">🏠</div>
            <div className="text-xl font-bold text-gray-900 mb-2">I Want to Buy</div>
            <div className="text-sm text-gray-600 mb-4">
              Browse verified properties with transparent pricing
            </div>
            <div className="inline-flex items-center text-blue-600 font-semibold">
              Get Started
              <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/auth-decision?intent=sell"
          className="group relative w-full sm:w-auto"
        >
          <div className="rounded-xl border-2 border-blue-600 bg-white p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-4xl mb-3">💼</div>
            <div className="text-xl font-bold text-gray-900 mb-2">I Want to Sell</div>
            <div className="text-sm text-gray-600 mb-4">
              List your property and connect with genuine buyers
            </div>
            <div className="inline-flex items-center text-blue-600 font-semibold">
              List Property
              <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
