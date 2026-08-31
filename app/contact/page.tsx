import { PageHero } from "@/app/components/PageHero";
import { getWhatsAppLink, siteConfig } from "@/app/lib/site-config";
import { MessageCircle, Phone, Mail } from "lucide-react";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="20"
      height="20"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Have a question or ready to get started? Our team is here to help."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center text-center gap-4 bg-success text-white rounded-2xl p-10 hover:bg-success/90 transition-colors shadow-lg"
          >
            <MessageCircle size={48} />
            <h2 className="text-2xl font-bold">Chat on WhatsApp</h2>
            <p className="text-white/90">
              The fastest way to reach us. Message our team and we&apos;ll get
              back to you.
            </p>
            <span className="inline-flex items-center justify-center bg-white text-success font-semibold py-3 px-6 rounded-lg">
              Start a Conversation
            </span>
          </a>

          <div className="flex flex-col gap-6">
            <div className="bg-white border border-grey/40 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-textdark mb-6">
                Contact Details
              </h2>
              <ul className="flex flex-col gap-5">
                <li className="flex items-center gap-4">
                  <div className="bg-navy/5 rounded-full p-3 text-navy">
                    <Phone size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-textdark/60">Phone</span>
                    <a
                      href={`tel:${siteConfig.whatsapp.number}`}
                      className="text-lg font-semibold text-textdark hover:text-orange"
                    >
                      {siteConfig.whatsapp.display}
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <div className="bg-navy/5 rounded-full p-3 text-navy">
                    <Mail size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-textdark/60">
                      General Inquiries
                    </span>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-lg font-semibold text-textdark hover:text-orange"
                    >
                      {siteConfig.email}
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-grey/40 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-textdark mb-4">
                Follow Us
              </h2>
              <div className="flex gap-4">
                <a
                  href={siteConfig.social.facebook}
                  className="bg-navy/5 p-3 rounded-full text-navy hover:bg-orange hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
                <a
                  href={siteConfig.social.instagram}
                  className="bg-navy/5 p-3 rounded-full text-navy hover:bg-orange hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-navy/5 p-3 rounded-full text-navy hover:bg-success hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
