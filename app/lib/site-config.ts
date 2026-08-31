export const siteConfig = {
  name: "Go Gro Mobility",
  tagline: "Mobility Solutions That Move You Forward",
  description:
    "Fuel credit, vehicle rentals, management and repairs. All in one platform. Built for drivers.",
  logo: {
    src: "/images/logo/logo-horizontal.svg",
    alt: "Go Gro Mobility",
    width: 158,
    height: 40,
  },
  logoMark: {
    src: "/images/logo/GoGro-logo.svg",
    alt: "Go Gro Mobility",
  },
  whatsapp: {
    number: "27780827940",
    display: "078 082 7940",
    defaultMessage:
      "Hi Go Gro Mobility, I'd like to know more about your services.",
  },
  email: "info@gogromobility.co.za",
  social: {
    facebook: "https://web.facebook.com/profile.php?id=61590311141014",
    instagram: "#",
  },
  nav: {
    about: { label: "About Us", href: "/about" },
    services: { label: "Services", href: "/services" },
    rewards: { label: "Driver Rewards", href: "/rewards" },
    partners: { label: "Partners", href: "/partners" },
    contact: { label: "Contact Us", href: "/contact" },
    join: { label: "Join Go Gro", href: "/apply" },
    login: { label: "Login", href: "/login" },
  },
  services: [
    { label: "Fuel Credit", href: "/services/fuel-credit" },
    { label: "Vehicle Rental", href: "/services/vehicle-rental" },
    { label: "Vehicle Management", href: "/services/vehicle-management" },
    { label: "Vehicle Repairs", href: "/services/vehicle-repairs" },
  ],
} as const;

export function getWhatsAppLink(message?: string): string {
  const text = encodeURIComponent(message ?? siteConfig.whatsapp.defaultMessage);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${text}`;
}
