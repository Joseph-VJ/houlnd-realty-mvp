import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Houlnd Realty. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-6">
            <Link href="/about" className="hover:text-gray-700">About</Link>
            <Link href="/contact" className="hover:text-gray-700">Contact</Link>
            <Link href="/legal/terms" className="hover:text-gray-700">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-gray-700">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
