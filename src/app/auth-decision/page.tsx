'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function AuthDecisionPage() {
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent'); // 'buy' or 'sell'

  const isBuying = intent === 'buy';
  const icon = isBuying ? '🏠' : '💼';
  const title = isBuying ? 'I Want to Buy' : 'I Want to Sell';
  const description = isBuying 
    ? 'Browse verified properties with transparent pricing'
    : 'List your property and connect with genuine buyers';
  
  const registerType = isBuying ? 'customer' : 'promoter';
  const loginRedirect = isBuying ? '/search' : '/promoter/post-new-property';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{icon}</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {title}
          </h1>
          <p className="text-lg text-gray-600">
            {description}
          </p>
        </div>

        {/* Main Question */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            Do you have a Houlnd account?
          </h2>

          <div className="space-y-4">
            {/* Yes - Login */}
            <Link
              href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
              className="block w-full"
            >
              <div className="group relative rounded-xl border-2 border-green-600 bg-white p-6 hover:bg-green-50 transition-all hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
                      ✓
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-gray-900">Yes, I have an account</div>
                      <div className="text-sm text-gray-600">Log in to continue</div>
                    </div>
                  </div>
                  <svg className="h-6 w-6 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* No - Sign Up */}
            <Link
              href={`/register?type=${registerType}`}
              className="block w-full"
            >
              <div className="group relative rounded-xl border-2 border-blue-600 bg-white p-6 hover:bg-blue-50 transition-all hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-2xl">
                      +
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-gray-900">No, I&apos;m new here</div>
                      <div className="text-sm text-gray-600">Create a free account</div>
                    </div>
                  </div>
                  <svg className="h-6 w-6 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Browse without signup (buyers only) */}
          {isBuying && (
            <div className="mt-8 text-center">
              <Link
                href="/search"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Or browse properties without signing up →
              </Link>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Back to home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
