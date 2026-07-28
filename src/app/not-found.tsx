import { Compass, MoveLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-gray-100 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <div className="relative bg-primary/10 p-5 rounded-full text-primary">
              <Compass className="w-16 h-16 animate-[spin_8s_linear_infinite]" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">
          Looks Like You&apos;re Lost
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          We can&apos;t seem to find the page you&apos;re looking for. It might
          have been moved, deleted, or perhaps it never existed.
        </p>

        <Link
          href="/admin/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/30 w-full sm:w-auto group"
        >
          <MoveLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
