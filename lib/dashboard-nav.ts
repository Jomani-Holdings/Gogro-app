export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export type NavGroup = {
  label: string;
  icon: string;
  items: NavItem[];
};

export const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/dashboard/admin/drivers", label: "Drivers", icon: "Users" },
  { href: "/dashboard/admin/repairs", label: "Repairs", icon: "Wrench" },
  { href: "/dashboard/admin/vehicles", label: "Vehicles", icon: "Car" },
  { href: "/dashboard/admin/leads", label: "Leads", icon: "FileText" },
  { href: "/dashboard/admin/submissions", label: "Submissions", icon: "ClipboardList" },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: "Receipt" },
  { href: "/dashboard/admin/payments", label: "Payments", icon: "Banknote" },
  { href: "/dashboard/admin/forms", label: "Forms", icon: "FilePlus" },
];

export const adminSiteGroup: NavGroup = {
  label: "Site",
  icon: "Globe",
  items: [
    { href: "/dashboard/admin/pages", label: "Pages", icon: "FileText" },
    { href: "/dashboard/admin/services", label: "Services", icon: "Wrench" },
    { href: "/dashboard/admin/partner-types", label: "Partner Types", icon: "Layers" },
    { href: "/dashboard/admin/garages", label: "Garages", icon: "MapPin" },
    { href: "/dashboard/admin/gallery", label: "Gallery", icon: "Images" },
    { href: "/dashboard/admin/seo", label: "SEO", icon: "Search" },
    { href: "/dashboard/admin/email-templates", label: "Email Templates", icon: "Mail" },
  ],
};

export const clientNav: NavItem[] = [
  { href: "/dashboard/client", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/client/finances", label: "My Finances", icon: "Receipt" },
  { href: "/dashboard/client/documents", label: "My Documents", icon: "FileText" },
  { href: "/dashboard/client/support", label: "Support Center", icon: "LifeBuoy" },
];