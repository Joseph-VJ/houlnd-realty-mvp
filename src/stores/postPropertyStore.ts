/**
 * Post Property Form Store (Zustand)
 *
 * This store manages the state for the 8-step property posting form.
 * It persists data across steps and handles form submission.
 *
 * Steps:
 * 1. Basic Details (property_type, total_price, total_sqft, price_type)
 * 2. Location (city, locality, address, latitude, longitude)
 * 3. Details (bedrooms, bathrooms, description)
 * 4. Amenities (amenities array, amenities_price)
 * 5. Photos (image files to upload)
 * 6. Availability (time slots for site visits - optional)
 * 7. Agreement (commission agreement acceptance)
 * 8. Review (preview all data before submit)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PostPropertyFormData {
  // Step 1: Basic Details
  property_type: 'PLOT' | 'APARTMENT' | 'VILLA' | 'HOUSE' | 'LAND' | 'COMMERCIAL' | ''
  total_price: number | null
  total_sqft: number | null
  price_type: 'NEGOTIABLE' | 'FIXED' | ''

  // Step 2: Location
  city: string
  locality: string
  address: string
  latitude: number | null
  longitude: number | null

  // Step 3: Details
  bedrooms: number | null
  bathrooms: number | null
  description: string
  furnishing_status: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED' | ''

  // Step 4: Amenities
  amenities: string[]
  amenities_price: number | null

  // Step 5: Photos
  imageFiles: File[]
  imagePreviewUrls: string[]

  // Step 6: Availability (optional)
  availability_slots: Array<{
    day_of_week: string
    start_time: string
    end_time: string
  }>

  // Step 7: Agreement
  agreement_accepted: boolean
  agreement_accepted_at: Date | null
}

interface PostPropertyStore {
  // Form data
  formData: PostPropertyFormData

  // Current step (1-8)
  currentStep: number

  // Actions
  setFormData: (data: Partial<PostPropertyFormData>) => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void
  resetForm: () => void
  addImageFile: (file: File, previewUrl: string) => void
  removeImageFile: (index: number) => void
  setAmenities: (amenities: string[]) => void
  addAvailabilitySlot: (slot: { day_of_week: string; start_time: string; end_time: string }) => void
  removeAvailabilitySlot: (index: number) => void
}

const initialFormData: PostPropertyFormData = {
  // Step 1
  property_type: '',
  total_price: null,
  total_sqft: null,
  price_type: '',

  // Step 2
  city: '',
  locality: '',
  address: '',
  latitude: null,
  longitude: null,

  // Step 3
  bedrooms: null,
  bathrooms: null,
  description: '',
  furnishing_status: '',

  // Step 4
  amenities: [],
  amenities_price: null,

  // Step 5
  imageFiles: [],
  imagePreviewUrls: [],

  // Step 6
  availability_slots: [],

  // Step 7
  agreement_accepted: false,
  agreement_accepted_at: null,
}

export const usePostPropertyStore = create<PostPropertyStore>()(
  persist(
    (set) => ({
      formData: initialFormData,
      currentStep: 1,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 8),
        })),

      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      goToStep: (step) =>
        set(() => ({
          currentStep: Math.max(1, Math.min(step, 8)),
        })),

      resetForm: () =>
        set(() => ({
          formData: initialFormData,
          currentStep: 1,
        })),

      addImageFile: (file, previewUrl) =>
        set((state) => ({
          formData: {
            ...state.formData,
            imageFiles: [...state.formData.imageFiles, file],
            imagePreviewUrls: [...state.formData.imagePreviewUrls, previewUrl],
          },
        })),

      removeImageFile: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            imageFiles: state.formData.imageFiles.filter((_, i) => i !== index),
            imagePreviewUrls: state.formData.imagePreviewUrls.filter((_, i) => i !== index),
          },
        })),

      setAmenities: (amenities) =>
        set((state) => ({
          formData: { ...state.formData, amenities },
        })),

      addAvailabilitySlot: (slot) =>
        set((state) => ({
          formData: {
            ...state.formData,
            availability_slots: [...state.formData.availability_slots, slot],
          },
        })),

      removeAvailabilitySlot: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            availability_slots: state.formData.availability_slots.filter((_, i) => i !== index),
          },
        })),
    }),
    {
      name: 'post-property-form',
      // Don't persist image files (they're too large for localStorage)
      partialize: (state) => ({
        ...state,
        formData: {
          ...state.formData,
          imageFiles: [],
          imagePreviewUrls: [],
        },
      }),
    }
  )
)
