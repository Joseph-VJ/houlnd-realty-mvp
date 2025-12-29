export function ValueProps() {
  return (
    <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
      <div className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-4">
          ₹
        </div>
        <h3 className="text-lg font-bold text-gray-900">Zero Brokerage</h3>
        <p className="mt-3 text-sm text-gray-900 leading-relaxed">
          Pay only ₹99 to unlock verified owner contact. No hidden charges.
        </p>
      </div>
      <div className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-4">
          ✓
        </div>
        <h3 className="text-lg font-bold text-gray-900">Verified Listings</h3>
        <p className="mt-3 text-sm text-gray-900 leading-relaxed">
          Every property is verified by our team before going live.
        </p>
      </div>
      <div className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-4">
          📊
        </div>
        <h3 className="text-lg font-bold text-gray-900">Sq.ft Price Filter</h3>
        <p className="mt-3 text-sm text-gray-900 leading-relaxed">
          India&apos;s first marketplace with transparent price per square foot filtering.
        </p>
      </div>
    </div>
  );
}
