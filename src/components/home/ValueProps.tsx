export function ValueProps() {
  return (
    <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
          ₹
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Zero Brokerage</h3>
        <p className="mt-2 text-sm text-gray-600">
          Pay only ₹99 to unlock verified owner contact. No hidden charges.
        </p>
      </div>
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
          ✓
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Verified Listings</h3>
        <p className="mt-2 text-sm text-gray-600">
          Every property is verified by our team before going live.
        </p>
      </div>
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
          📊
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Sq.ft Price Filter</h3>
        <p className="mt-2 text-sm text-gray-600">
          India&apos;s first marketplace with transparent price per square foot filtering.
        </p>
      </div>
    </div>
  );
}
