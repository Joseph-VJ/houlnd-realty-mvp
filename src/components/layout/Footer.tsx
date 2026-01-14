import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-white/90 backdrop-blur-md mt-16 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-600">
          <p className="font-medium">© 2025 Houlnd Realty. All rights reserved.</p>
          <div className="mt-3 flex justify-center gap-6">
            <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            <Link href="/legal/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
