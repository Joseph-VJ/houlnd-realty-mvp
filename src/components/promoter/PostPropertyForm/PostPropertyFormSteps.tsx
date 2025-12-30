/**
 * Post Property Form Steps Component
 *
 * Handles both create and edit modes for property listings.
 * Uses the same 8-step flow with different review components.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { Step1Basic } from './Step1Basic'
import { Step2Location } from './Step2Location'
import { Step3Details } from './Step3Details'
import { Step4Amenities } from './Step4Amenities'
import { Step5Photos } from './Step5Photos'
import { Step6Availability } from './Step6Availability'
import { Step7Agreement } from './Step7Agreement'
import { Step8Review } from './Step8Review'
import { Step8ReviewEdit } from './Step8ReviewEdit'

interface PostPropertyFormStepsProps {
  listingId?: string
  isEditMode?: boolean
}

const STEPS = [
  { number: 1, title: 'Basic Details', component: Step1Basic },
  { number: 2, title: 'Location', component: Step2Location },
  { number: 3, title: 'Property Details', component: Step3Details },
  { number: 4, title: 'Amenities', component: Step4Amenities },
  { number: 5, title: 'Photos', component: Step5Photos },
  { number: 6, title: 'Availability', component: Step6Availability },
  { number: 7, title: 'Agreement', component: Step7Agreement },
]

export function PostPropertyFormSteps({ listingId, isEditMode = false }: PostPropertyFormStepsProps) {
  const { currentStep, goToStep } = usePostPropertyStore()

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Get the current step component (use edit version for step 8 in edit mode)
  const getCurrentStepComponent = () => {
    if (currentStep === 8) {
      return isEditMode ? Step8ReviewEdit : Step8Review
    }
    return STEPS[currentStep - 1].component
  }

  const CurrentStepComponent = getCurrentStepComponent()

  // Get step config for step 8
  const getStepConfig = (stepNumber: number) => {
    if (stepNumber === 8) {
      return { number: 8, title: isEditMode ? 'Review & Update' : 'Review & Submit' }
    }
    return STEPS[stepNumber - 1]
  }

  return (
    <>
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
            <Link href="/promoter/listings">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-900 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all">
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
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                {isEditMode ? 'Edit Property' : 'Post New Property'}
              </h1>
              <p className="text-lg text-gray-900">
                {isEditMode
                  ? 'Update your property listing details'
                  : 'List your property and connect with verified buyers'}
              </p>
            </div>
            <div className="mt-3 md:mt-0">
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                Step {currentStep} of 8
              </span>
            </div>
          </div>

          {/* Desktop Step Indicator */}
          <div className="hidden md:flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((stepNumber, index) => {
              const step = getStepConfig(stepNumber)
              return (
                <div key={stepNumber} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <button
                    onClick={() => {
                      // Allow going back to previous steps, not forward
                      if (stepNumber < currentStep) {
                        goToStep(stepNumber)
                      }
                    }}
                    disabled={stepNumber > currentStep}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${
                      stepNumber === currentStep
                        ? 'bg-blue-600 text-white scale-110'
                        : stepNumber < currentStep
                          ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer hover:scale-105'
                          : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {stepNumber < currentStep ? '✓' : stepNumber}
                  </button>

                  {/* Connector Line */}
                  {index < 7 && (
                    <div
                      className={`flex-1 h-1.5 mx-2 rounded-full transition-all ${
                        stepNumber < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile Step Indicator */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-900">
                {getStepConfig(currentStep).title}
              </div>
              <div className="text-sm text-gray-900 font-medium">{currentStep}/8</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${(currentStep / 8) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Title (Desktop) */}
          <div className="hidden md:flex justify-between mt-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((stepNumber) => {
              const step = getStepConfig(stepNumber)
              return (
                <div
                  key={stepNumber}
                  className={`text-xs flex-1 text-center transition-all ${
                    stepNumber === currentStep
                      ? 'text-blue-600 font-bold'
                      : stepNumber < currentStep
                        ? 'text-green-600 font-semibold'
                        : 'text-gray-900 font-medium'
                  }`}
                >
                  {step.title}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Step Component */}
        <div className="mb-8">
          <CurrentStepComponent listingId={listingId} />
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-900">
          <p>
            Need help? Check our{' '}
            <a href="/help/posting-property" className="text-blue-600 hover:underline">
              guide to posting a property
            </a>
            .
          </p>
        </div>
      </main>
    </>
  )
}
