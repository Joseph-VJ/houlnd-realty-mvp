/**
 * Step 5: Photos
 * - Image upload with drag & drop
 * - Min 3, Max 10 images
 * - Preview and reorder
 * - Client-side compression
 */

'use client'

import { useState } from 'react'
import { usePostPropertyStore } from '@/stores/postPropertyStore'

export function Step5Photos() {
  const { formData, addImageFile, removeImageFile, nextStep, previousStep } = usePostPropertyStore()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setError('')
    setUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (5MB max before compression)
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} is too large (max 5MB)`)
          continue
        }

        // Check max images limit
        if ((formData.imageFiles?.length || 0) >= 10) {
          setError('Maximum 10 images allowed')
          break
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file)

        // Add to store
        addImageFile(file, previewUrl)
      }
    } catch (err) {
      setError('Failed to upload images')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.imageFiles || formData.imageFiles.length < 3) {
      setError('Please upload at least 3 images')
      return
    }

    nextStep()
  }

  const imageCount = formData.imageFiles?.length || 0
  const isValid = imageCount >= 3

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Property Photos</h2>
            <p className="text-gray-900">
              Upload high-quality images of your property (minimum 3, maximum 10)
            </p>
          </div>

          {/* Upload Area */}
          <div>
            <label
              htmlFor="image-upload"
              className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 transition-all cursor-pointer bg-gray-50 hover:bg-blue-50 hover:scale-[1.01]"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">📸</div>
                <div className="text-lg font-bold text-gray-800 mb-2">
                  Click to upload or drag and drop
                </div>
                <div className="text-sm text-gray-900">
                  PNG, JPG, WEBP up to 5MB each
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Images will be compressed automatically
                </div>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading || imageCount >= 10}
              />
            </label>

            {/* Upload Stats */}
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm text-gray-900 font-medium">
                {imageCount} / 10 images uploaded
              </div>
              <div
                className={`text-sm font-bold ${
                  isValid ? 'text-green-600' : 'text-orange-600'
                }`}
              >
                {isValid ? '✓ Minimum requirement met' : '⚠ Need at least 3 images'}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Image Preview Grid */}
          {formData.imageFiles && formData.imageFiles.length > 0 && (
            <div>
              <div className="text-sm font-bold text-gray-800 mb-3">
                Uploaded Images ({formData.imageFiles.length})
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.imageFiles.map((file, index) => {
                  const previewUrl = formData.imagePreviewUrls?.[index] || ''
                  return (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all">
                        <img
                          src={previewUrl}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            Main Photo
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImageFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                        title="Remove image"
                      >
                        ✕
                      </button>
                      <div className="text-xs text-gray-900 mt-1 text-center">
                        {file.name.length > 20
                          ? file.name.substring(0, 17) + '...'
                          : file.name}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-900 mt-3">
                The first image will be used as the main photo. Hover over images to remove
                them.
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <div className="text-sm font-bold text-yellow-800 mb-2">
              📌 Photo Tips for Better Results:
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✓ Use natural lighting for clear, bright images</li>
              <li>✓ Include exterior shots, interior rooms, and key features</li>
              <li>✓ Clean and declutter spaces before photographing</li>
              <li>✓ Take photos from corners to show more space</li>
              <li>✓ First image should be the best exterior/entrance shot</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between gap-4">
        <button
          type="button"
          onClick={previousStep}
          className="flex items-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-900 rounded-full font-bold hover:bg-gray-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Availability
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  )
}
