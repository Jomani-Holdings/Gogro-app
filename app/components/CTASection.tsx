import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface CTASectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
  bgColor?: "navy" | "offwhite";
}

export function CTASection({
  title,
  subtitle,
  buttonText,
  buttonHref,
  bgColor = "offwhite",
}: CTASectionProps) {
  const isNavy = bgColor === "navy";
  const isExternal = buttonHref.startsWith("http");

  return (
    <section
      className={`pt-16 pb-0 ${isNavy ? "bg-navy text-white" : "bg-offwhite text-textdark"}`}
    >
      <div className="container mx-auto px-6 md:px-12">
        <div
          className={`flex flex-col items-center text-center gap-8 p-12 md:p-16 rounded-t-2xl max-w-4xl mx-auto ${
            isNavy ? "bg-navy-dark" : "bg-success/10"
          }`}
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
            <p className={`text-lg ${isNavy ? "text-grey" : "text-textdark/80"}`}>
              {subtitle}
            </p>
          </div>

          <Link
            href={buttonHref}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-lg hover:-translate-y-1"
          >
            <MessageCircle size={20} />
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
