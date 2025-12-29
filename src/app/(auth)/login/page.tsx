/**
 * Login Page
 *
 * This page allows existing users to login with email/password.
 *
 * Features:
 * - Separate login sections for Buyers (CUSTOMER) and Sellers (PROMOTER)
 * - Email and password login
 * - Form validation with React Hook Form + Zod
 * - Role-based routing after login
 * - Tab-based UI to switch between buyer and seller login
 */

'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>
type LoginType = 'buyer' | 'seller'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loginType, setLoginType] = useState<LoginType>('buyer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      setError(null)

      const result = await signIn(data.email, data.password)

      if (!result.success) {
        setError(result.error || 'Login failed')
        return
      }

      // Redirect based on user role
      const role = result.data?.role
      let redirectUrl = '/customer/dashboard' // Default

      if (role === 'PROMOTER') {
        redirectUrl = '/promoter/dashboard'
      } else if (role === 'ADMIN') {
        redirectUrl = '/admin/dashboard'
      }

      // Validate that the login type matches the user's role
      if (loginType === 'buyer' && role === 'PROMOTER') {
        setError('This account is registered as a Seller. Please use the Seller login.')
        return
      }
      if (loginType === 'seller' && role === 'CUSTOMER') {
        setError('This account is registered as a Buyer. Please use the Buyer login.')
        return
      }

      // Check if there's a redirect URL from previous page
      const redirectedFrom = searchParams.get('redirectedFrom')
      if (redirectedFrom) {
        redirectUrl = redirectedFrom
      }

      // Refresh the router to pick up the new auth state
      router.refresh()
      router.push(redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => {
            setLoginType('buyer')
            setError(null)
            form.reset()
          }}
          className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
            loginType === 'buyer'
              ? 'bg-blue-600 text-white border-b-2 border-blue-600'
              : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Buy Property</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginType('seller')
            setError(null)
            form.reset()
          }}
          className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
            loginType === 'seller'
              ? 'bg-green-600 text-white border-b-2 border-green-600'
              : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Sell Property</span>
          </div>
        </button>
      </div>

      {/* Form Content */}
      <div className="p-8">
        {/* Description */}
        <div className="mb-6 text-center">
          {loginType === 'buyer' ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Buyer Login</h2>
              <p className="text-sm text-gray-900">
                Find your dream property with transparent pricing
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Seller Login</h2>
              <p className="text-sm text-gray-900">
                List your properties and connect with verified buyers
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...form.register('email')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-900"
              placeholder="john@example.com"
              autoComplete="email"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...form.register('password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-900"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...form.register('rememberMe')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 active:opacity-80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg ${
              loginType === 'buyer' ? 'bg-blue-600' : 'bg-green-600'
            }`}
          >
            {loading ? 'Logging in...' : `Login as ${loginType === 'buyer' ? 'Buyer' : 'Seller'}`}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-900">Or</span>
          </div>
        </div>

        {/* Social Login (Future) */}
        <div className="mt-6">
          <button
            type="button"
            disabled
            className="w-full border border-gray-300 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with Google (Coming Soon)
          </button>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-sm text-gray-900">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Sign Up as {loginType === 'buyer' ? 'Buyer' : 'Seller'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="text-4xl font-bold text-blue-600">Houlnd</div>
              <div className="text-base text-gray-900 font-medium">Realty</div>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-base text-gray-900 mt-3">Choose how you want to login</p>
        </div>

        {/* Form Card with Suspense */}
        <Suspense fallback={<div className="bg-white rounded-xl shadow-lg p-8 h-96 flex items-center justify-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
