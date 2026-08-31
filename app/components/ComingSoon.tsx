import Link from "next/link";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-6 md:px-12 py-16 max-w-4xl">
      <Link href="/" className="text-sm text-navy hover:text-orange font-medium">
        &larr; Back to home
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold text-textdark mt-6">
        {title}
      </h1>
      <p className="text-lg text-textdark/70 mt-4">Content coming soon.</p>
    </div>
  );
}
