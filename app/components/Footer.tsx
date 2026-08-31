import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/app/lib/site-config";

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

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy pt-16 pb-8 text-white border-t-4 border-orange">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1 flex flex-col gap-4 items-center text-center md:items-start md:text-left">
            <Image
              src={siteConfig.logoMark.src}
              alt={siteConfig.logoMark.alt}
              width={48}
              height={48}
              className="h-12 w-12 mb-2"
            />
            <p className="font-semibold text-lg text-orange uppercase tracking-wide">
              Taking You Further
            </p>
            <p className="text-grey text-sm">Fueling growth. Driving futures.</p>
            <p className="text-grey text-sm mt-4 italic">
              A venture by Jomani Holdings.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4 items-center text-center md:items-start md:text-left">
            <h3 className="font-bold text-lg mb-2">Quick Links</h3>
            <Link href="/about" className="text-grey hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="/how-it-works" className="text-grey hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/rewards" className="text-grey hover:text-white transition-colors">
              Rewards
            </Link>
            <Link href="/apply" className="text-orange hover:text-orange/80 font-semibold transition-colors">
              Apply Now
            </Link>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4 items-center text-center md:items-start md:text-left">
            <h3 className="font-bold text-lg mb-2">Services</h3>
            {siteConfig.services.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="text-grey hover:text-white transition-colors"
              >
                {service.label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4 items-center text-center md:items-start md:text-left">
            <h3 className="font-bold text-lg mb-2">Support</h3>
            <Link href="/contact" className="text-grey hover:text-white transition-colors">
              Help Centre
            </Link>
            <Link href="/contact" className="text-grey hover:text-white transition-colors">
              Contact Us
            </Link>
            <Link href="/legal/terms" className="text-grey hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/legal/privacy" className="text-grey hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>

          {/* Follow Us & WhatsApp Callout */}
          <div className="flex flex-col gap-4 items-center text-center md:items-start md:text-left lg:items-start">
            <h3 className="font-bold text-lg mb-2">Follow Us</h3>
            <div className="flex gap-4 mb-4">
              <a
                href={siteConfig.social.facebook}
                className="bg-white/10 p-2 rounded-full hover:bg-orange hover:text-white transition-all"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href={siteConfig.social.instagram}
                className="bg-white/10 p-2 rounded-full hover:bg-orange hover:text-white transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-success hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            </div>

            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white text-textdark p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-success w-full"
            >
              <div className="text-success">
                <MessageCircle size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-textdark/70">
                  Need Help? Chat to us
                </span>
                <span className="font-bold text-base">
                  {siteConfig.whatsapp.display}
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-grey">
          <p>© {currentYear} Go Gro Mobility. All rights reserved.</p>
          <p>Designed for South African Drivers.</p>
        </div>
      </div>
    </footer>
  );
}
