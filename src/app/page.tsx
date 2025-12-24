import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ValueProps } from "@/components/home/ValueProps";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Hero />
        <ValueProps />

        {/* Browse Link */}
        <div className="mt-12 text-center pb-20">
          <Link
            href="/search"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse Properties Without Signup →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
