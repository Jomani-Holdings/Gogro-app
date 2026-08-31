import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative min-h-[60vh] bg-navy text-white flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/40" />
      <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
        <p className="text-orange font-bold uppercase tracking-widest text-sm mb-4">
          404
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-offwhite max-w-xl mx-auto mb-8 font-light">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
          Let&apos;s get you back on the road.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold bg-orange text-white border border-transparent hover:bg-transparent hover:border-white py-4 px-8 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
