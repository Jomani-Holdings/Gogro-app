export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/dashboard/admin/applications", label: "Applications", icon: "FileText" },
  { href: "/dashboard/admin/drivers", label: "Drivers", icon: "Users" },
  { href: "/dashboard/admin/pages", label: "Pages", icon: "FileText" },
  { href: "/dashboard/admin/services", label: "Services", icon: "Wrench" },
  { href: "/dashboard/admin/partner-types", label: "Partner Types", icon: "Layers" },
  { href: "/dashboard/admin/garages", label: "Garages", icon: "MapPin" },
  { href: "/dashboard/admin/email-templates", label: "Email Templates", icon: "Mail" },
];

export const driverNav: NavItem[] = [
  { href: "/dashboard/driver", label: "Home", icon: "Home" },
  { href: "/dashboard/driver/garages", label: "Garages", icon: "MapPin" },
  { href: "/dashboard/driver/support", label: "Support", icon: "LifeBuoy" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];
