/**
 * Post New Property Page - 8-Step Form
 *
 * Steps:
 * 1. Basic Details (property type, price, sqft, price type)
 * 2. Location (city, locality, address, coordinates)
 * 3. Property Details (bedrooms, bathrooms, furnishing, description)
 * 4. Amenities (amenities selection, amenities price)
 * 5. Photos (image upload with preview)
 * 6. Availability (time slots for site visits - coming soon)
 * 7. Agreement (commission agreement acceptance)
 * 8. Review & Submit (summary and final submission)
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Step1Basic } from '@/components/promoter/PostPropertyForm/Step1Basic'
import { Step2Location } from '@/components/promoter/PostPropertyForm/Step2Location'
import { Step3Details } from '@/components/promoter/PostPropertyForm/Step3Details'
import { Step4Amenities } from '@/components/promoter/PostPropertyForm/Step4Amenities'
import { Step5Photos } from '@/components/promoter/PostPropertyForm/Step5Photos'
import { Step6Availability } from '@/components/promoter/PostPropertyForm/Step6Availability'
import { Step7Agreement } from '@/components/promoter/PostPropertyForm/Step7Agreement'
import { Step8Review } from '@/components/promoter/PostPropertyForm/Step8Review'

const STEPS = [
  { number: 1, title: 'Basic Details', component: Step1Basic },
  { number: 2, title: 'Location', component: Step2Location },
  { number: 3, title: 'Property Details', component: Step3Details },
  { number: 4, title: 'Amenities', component: Step4Amenities },
  { number: 5, title: 'Photos', component: Step5Photos },
  { number: 6, title: 'Availability', component: Step6Availability },
  { number: 7, title: 'Agreement', component: Step7Agreement },
  { number: 8, title: 'Review & Submit', component: Step8Review },
]

export default function PostNewPropertyPage() {
  const { currentStep, goToStep } = usePostPropertyStore()

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const CurrentStepComponent = STEPS[currentStep - 1].component

  return (
    <ProtectedRoute requiredRole="PROMOTER">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-xl font-bold text-gray-900">Houlnd Realty</span>
              </Link>
              <Link href="/promoter/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-medium">Cancel</span>
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Progress Indicator */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">Post New Property</h1>
                <p className="text-lg text-gray-600">List your property and connect with verified buyers</p>
              </div>
              <div className="mt-3 md:mt-0">
                <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                  Step {currentStep} of {STEPS.length}
                </span>
              </div>
            </div>

            {/* Desktop Step Indicator */}
            <div className="hidden md:flex items-center gap-2">
              {STEPS.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <button
                    onClick={() => {
                      // Allow going back to previous steps, not forward
                      if (step.number < currentStep) {
                        goToStep(step.number)
                      }
                    }}
                    disabled={step.number > currentStep}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${
                      step.number === currentStep
                        ? 'bg-blue-600 text-white scale-110'
                        : step.number < currentStep
                          ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer hover:scale-105'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number < currentStep ? '✓' : step.number}
                  </button>

                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1.5 mx-2 rounded-full transition-all ${
                        step.number < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Step Indicator */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-gray-900">
                  {STEPS[currentStep - 1].title}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {currentStep}/{STEPS.length}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Title (Desktop) */}
            <div className="hidden md:flex justify-between mt-3">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className={`text-xs flex-1 text-center transition-all ${
                    step.number === currentStep
                      ? 'text-blue-600 font-bold'
                      : step.number < currentStep
                        ? 'text-green-600 font-semibold'
                        : 'text-gray-500 font-medium'
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Component */}
          <div className="mb-8">
            <CurrentStepComponent />
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Need help? Check our{' '}
              <a href="/help/posting-property" className="text-blue-600 hover:underline">
                guide to posting a property
              </a>
              .
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
