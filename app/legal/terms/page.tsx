import { PageHero } from "@/app/components/PageHero";

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms & Conditions" />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        <div className="bg-white border border-grey/40 rounded-2xl p-10 text-center">
          <span className="inline-flex items-center gap-2 bg-yellow/20 text-textdark font-semibold text-sm uppercase tracking-widest rounded-full px-4 py-2">
            Pending Legal Review / Coming Soon
          </span>
          <p className="text-lg text-textdark/70 mt-4">
            {/* PLACEHOLDER: no legal clauses invented — finalised copy will be added here */}
            Our Terms &amp; Conditions are being finalised and will be published
            here once reviewed.
          </p>
        </div>
      </section>
    </>
  );
}
