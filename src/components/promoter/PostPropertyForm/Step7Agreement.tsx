/**
 * Step 7: Commission Agreement
 * - Display commission terms
 * - Require acceptance checkbox
 * - Store acceptance timestamp
 */

'use client'

import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function Step7Agreement() {
  const { formData, setFormData, nextStep, previousStep } = usePostPropertyStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreement_accepted) {
      alert('Please accept the commission agreement to continue')
      return
    }

    // Set acceptance timestamp
    setFormData({ agreement_accepted_at: new Date() as any })

    nextStep()
  }

  const handleAcceptChange = (checked: boolean) => {
    setFormData({
      agreement_accepted: checked,
      agreement_accepted_at: checked ? new Date() as any : null,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Commission Agreement</h2>
              <p className="text-gray-600 mt-2">
                Please review and accept our commission terms to list your property
              </p>
            </div>

            {/* Agreement Terms */}
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Houlnd Realty Commission Agreement
              </h3>

              <div className="space-y-4 text-sm text-gray-700">
                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Commission Structure</h4>
                  <p>
                    By listing your property on Houlnd Realty, you agree to pay a commission of
                    2% of the final sale price upon successful completion of the sale.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">2. Contact Unlock Fee</h4>
                  <p>
                    Interested buyers pay a one-time fee of ₹99 to unlock your contact details.
                    This fee is non-refundable and belongs to Houlnd Realty as a platform service
                    charge.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">3. Listing Approval</h4>
                  <p>
                    Your listing will be reviewed by our team and must be approved before it
                    becomes visible to buyers. We may request additional information or reject
                    listings that don't meet our quality standards.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">4. Accurate Information</h4>
                  <p>
                    You confirm that all information provided about the property is accurate and
                    truthful. Misleading or false information may result in immediate removal of
                    your listing and potential legal action.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">5. Property Ownership</h4>
                  <p>
                    You confirm that you are the legal owner of the property or have explicit
                    authorization from the owner to list it for sale on this platform.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">6. Commission Payment</h4>
                  <p>
                    Commission is payable within 7 days of sale completion (registration of sale
                    deed). Non-payment may result in legal proceedings to recover the owed amount.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">7. Listing Removal</h4>
                  <p>
                    You may remove your listing at any time. However, if your property is sold
                    through leads generated from Houlnd Realty within 90 days of listing removal,
                    the commission terms still apply.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">8. Privacy & Data</h4>
                  <p>
                    Your contact information will be masked until a buyer pays the unlock fee. We
                    will not share your personal information with third parties without your
                    consent, except as required by law.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">9. Dispute Resolution</h4>
                  <p>
                    Any disputes arising from this agreement will be resolved through arbitration
                    under the Arbitration and Conciliation Act, 1996, with jurisdiction in
                    Bangalore, Karnataka.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">10. Modifications</h4>
                  <p>
                    Houlnd Realty reserves the right to modify these terms with prior notice.
                    Modifications will not affect listings already published under the previous
                    terms.
                  </p>
                </section>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  For the complete terms and conditions, please visit our{' '}
                  <a href="/legal/commission" className="text-blue-600 hover:underline">
                    Commission Agreement page
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Acceptance Checkbox */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreement_accepted || false}
                  onChange={(e) => handleAcceptChange(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    I accept the Commission Agreement <span className="text-red-500">*</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    I have read, understood, and agree to the commission terms outlined above,
                    including the 2% commission on sale and the ₹99 contact unlock fee paid by
                    buyers.
                  </div>
                  {formData.agreement_accepted_at && (
                    <div className="text-xs text-green-600 mt-2">
                      ✓ Accepted on {new Date(formData.agreement_accepted_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-yellow-800 mb-1">
                    Important Notice
                  </div>
                  <div className="text-xs text-yellow-700">
                    This is a legally binding agreement. By checking the box above and submitting
                    your listing, you agree to pay the specified commission upon successful sale
                    of your property.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={previousStep}>
          ← Back
        </Button>
        <Button type="submit" size="lg" disabled={!formData.agreement_accepted}>
          Next: Review & Submit →
        </Button>
      </div>
    </form>
  )
}
