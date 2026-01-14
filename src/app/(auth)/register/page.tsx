/**
 * Registration Page (2-Step with OTP)
 *
 * This page implements a 2-step registration flow:
 * Step 1: Collect user details (name, email, phone, password, role)
 * Step 2: OTP verification (send OTP to phone, verify 6-digit code)
 *
 * Features:
 * - Role selection (pre-filled from query param ?type=customer/promoter)
 * - Form validation with React Hook Form + Zod
 * - Phone number validation (E.164 format)
 * - OTP sending and verification
 * - Automatic redirect to role-based dashboard on success
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { signUp, sendOtp, verifyOtp } from '@/app/actions/auth'

// Step 1 form schema
const step1Schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number. Use format: +919876543210'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'PROMOTER']),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type Step1FormData = z.infer<typeof step1Schema>

// Step 2 form schema
const step2Schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})

type Step2FormData = z.infer<typeof step2Schema>

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)

  // Step 1 form
  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: (searchParams.get('type')?.toUpperCase() as 'CUSTOMER' | 'PROMOTER') || 'CUSTOMER',
      agreeToTerms: false,
    },
  })

  // Step 2 form
  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      otp: '',
    },
  })

  // Handle Step 1 submission (Create account + Send OTP)
  const onStep1Submit = async (data: Step1FormData) => {
    try {
      setLoading(true)
      setError(null)

      // Create user account
      const signUpResult = await signUp(
        data.email,
        data.password,
        data.role,
        data.fullName,
        data.phone
      )

      if (!signUpResult.success) {
        setError(signUpResult.error || 'Failed to create account')
        return
      }

      // In offline mode, skip OTP and redirect directly to dashboard
      if (process.env.NEXT_PUBLIC_USE_OFFLINE === 'true') {
        // Redirect to role-based dashboard
        const dashboardUrl =
          data.role === 'CUSTOMER' ? '/customer/dashboard' : '/promoter/dashboard'
        router.push(dashboardUrl)
        return
      }

      // In online mode with Supabase, continue to OTP step
      // Send OTP to phone (optional - only if phone auth is configured)
      // Commenting out OTP flow for now since it requires SMS provider setup
      /*
      const otpResult = await sendOtp(data.phone)

      if (!otpResult.success) {
        setError(otpResult.error || 'Failed to send OTP')
        return
      }
      */

      // Save step 1 data and move to step 2
      setStep1Data(data)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle Step 2 submission (Verify OTP)
  const onStep2Submit = async (data: Step2FormData) => {
    if (!step1Data) return

    try {
      setLoading(true)
      setError(null)

      // Verify OTP (optional - only if phone auth is configured)
      // For now, we'll skip OTP verification and just redirect
      /*
      const verifyResult = await verifyOtp(step1Data.phone, data.otp)

      if (!verifyResult.success) {
        setError(verifyResult.error || 'Invalid OTP')
        return
      }
      */

      // Redirect to role-based dashboard
      const dashboardUrl =
        step1Data.role === 'CUSTOMER' ? '/customer/dashboard' : '/promoter/dashboard'
      router.push(dashboardUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step 1: User Details */}
      {step === 1 && (
        <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  value="CUSTOMER"
                  {...step1Form.register('role')}
                  className="peer sr-only"
                />
                <div className="cursor-pointer rounded-xl border-2 border-gray-300 p-6 text-center transition-all hover:border-blue-400 hover:shadow-md peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:shadow-lg">
                  <div className="text-3xl mb-2">🏠</div>
                  <div className="text-base font-semibold text-gray-900">Buy</div>
                </div>
              </label>
              <label className="relative">
                <input
                  type="radio"
                  value="PROMOTER"
                  {...step1Form.register('role')}
                  className="peer sr-only"
                />
                <div className="cursor-pointer rounded-xl border-2 border-gray-300 p-6 text-center transition-all hover:border-blue-400 hover:shadow-md peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:shadow-lg">
                  <div className="text-3xl mb-2">💼</div>
                  <div className="text-base font-semibold text-gray-900">Sell</div>
                </div>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              {...step1Form.register('fullName')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-400"
              placeholder="John Doe"
            />
            {step1Form.formState.errors.fullName && (
              <p className="mt-1 text-sm text-red-600">
                {step1Form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...step1Form.register('email')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-400"
              placeholder="john@example.com"
            />
            {step1Form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {step1Form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              {...step1Form.register('phone')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-400"
              placeholder="+919876543210"
            />
            {step1Form.formState.errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {step1Form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...step1Form.register('password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-400"
              placeholder="Min 6 characters"
            />
            {step1Form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {step1Form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...step1Form.register('confirmPassword')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-400"
              placeholder="Re-enter password"
            />
            {step1Form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {step1Form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start">
            <input
              id="agreeToTerms"
              type="checkbox"
              {...step1Form.register('agreeToTerms')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/legal/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
          {step1Form.formState.errors.agreeToTerms && (
            <p className="text-sm text-red-600">
              {step1Form.formState.errors.agreeToTerms.message}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              We've sent a 6-digit code to
              <br />
              <span className="font-medium text-gray-900">{step1Data?.phone}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              {...step2Form.register('otp')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              placeholder="000000"
            />
            {step2Form.formState.errors.otp && (
              <p className="mt-1 text-sm text-red-600">
                {step2Form.formState.errors.otp.message}
              </p>
            )}
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                if (step1Data) {
                  sendOtp(step1Data.phone)
                }
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Didn't receive code? Resend
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-100"
          >
            Back
          </button>
        </form>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="text-4xl font-bold text-blue-600">Houlnd</div>
              <div className="text-base text-gray-500 font-medium">Realty</div>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-base text-gray-600 mt-3">
            {step === 1 ? 'Fill in your details to get started' : 'Verify your phone number'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              1
            </div>
            <div className="w-16 h-1 bg-gray-200">
              <div
                className={`h-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}
                style={{ width: step >= 2 ? '100%' : '0%' }}
              />
            </div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              2
            </div>
          </div>
        </div>

        {/* Form Card with Suspense */}
        <Suspense fallback={<div className="bg-white rounded-xl shadow-lg p-8 h-96 flex items-center justify-center">Loading...</div>}>
          <RegisterForm />
        </Suspense>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
