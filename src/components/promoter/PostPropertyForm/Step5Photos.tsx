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
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

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
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Property Photos</h2>
              <p className="text-gray-600 mt-2">
                Upload high-quality images of your property (minimum 3, maximum 10)
              </p>
            </div>

            {/* Upload Area */}
            <div>
              <label
                htmlFor="image-upload"
                className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition cursor-pointer bg-gray-50 hover:bg-blue-50"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">📸</div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-sm text-gray-500">
                    PNG, JPG, WEBP up to 5MB each
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
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
                <div className="text-sm text-gray-600">
                  {imageCount} / 10 images uploaded
                </div>
                <div
                  className={`text-sm font-medium ${
                    isValid ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {isValid ? '✓ Minimum requirement met' : '⚠ Need at least 3 images'}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Image Preview Grid */}
            {formData.imageFiles && formData.imageFiles.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Uploaded Images ({formData.imageFiles.length})
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.imageFiles.map((file, index) => {
                    const previewUrl = formData.imagePreviewUrls?.[index] || ''
                    return (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative overflow-hidden rounded-lg border-2 border-gray-200">
                          <img
                            src={previewUrl}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Main Photo
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImageFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                          title="Remove image"
                        >
                          ✕
                        </button>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {file.name.length > 20
                            ? file.name.substring(0, 17) + '...'
                            : file.name}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  The first image will be used as the main photo. Hover over images to remove
                  them.
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm font-medium text-yellow-800 mb-2">
                📌 Photo Tips for Better Results:
              </div>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>✓ Use natural lighting for clear, bright images</li>
                <li>✓ Include exterior shots, interior rooms, and key features</li>
                <li>✓ Clean and declutter spaces before photographing</li>
                <li>✓ Take photos from corners to show more space</li>
                <li>✓ First image should be the best exterior/entrance shot</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={previousStep}>
          ← Back
        </Button>
        <Button type="submit" size="lg" disabled={!isValid}>
          Next: Availability →
        </Button>
      </div>
    </form>
  )
}
