import Link from "next/link";

interface PageHeroCta {
  label: string;
  href: string;
  external?: boolean;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  cta?: PageHeroCta;
}

export function PageHero({ title, subtitle, cta }: PageHeroProps) {
  return (
    <section className="relative bg-navy text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/40" />
      <div className="relative z-10 container mx-auto px-6 md:px-12 py-20 md:py-28">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-lg md:text-xl text-offwhite mt-4 max-w-2xl font-light">
            {subtitle}
          </p>
        ) : null}
        {cta ? (
          <div className="mt-8">
            {cta.external ? (
              <a
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold bg-orange text-white border border-transparent hover:bg-transparent hover:border-white py-4 px-8 transition-colors"
              >
                {cta.label}
              </a>
            ) : (
              <Link
                href={cta.href}
                className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold bg-orange text-white border border-transparent hover:bg-transparent hover:border-white py-4 px-8 transition-colors"
              >
                {cta.label}
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
