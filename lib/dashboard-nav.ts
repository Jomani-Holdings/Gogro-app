export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/dashboard/admin/leads", label: "Leads", icon: "FileText" },
  { href: "/dashboard/admin/submissions", label: "Submissions", icon: "ClipboardList" },
  { href: "/dashboard/admin/forms", label: "Forms", icon: "FilePlus" },
  { href: "/dashboard/admin/drivers", label: "Clients", icon: "Users" },
  { href: "/dashboard/admin/pages", label: "Pages", icon: "FileText" },
  { href: "/dashboard/admin/services", label: "Services", icon: "Wrench" },
  { href: "/dashboard/admin/partner-types", label: "Partner Types", icon: "Layers" },
  { href: "/dashboard/admin/garages", label: "Garages", icon: "MapPin" },
  { href: "/dashboard/admin/email-templates", label: "Email Templates", icon: "Mail" },
];

export const clientNav: NavItem[] = [
  { href: "/dashboard/client", label: "Home", icon: "Home" },
  { href: "/dashboard/client/garages", label: "Garages", icon: "MapPin" },
  { href: "/dashboard/client/support", label: "Support", icon: "LifeBuoy" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];
