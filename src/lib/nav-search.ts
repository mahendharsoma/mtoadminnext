export interface SearchNavItem {
  title: string;
  href: string;
  group: string;
}

export const searchNavItems: SearchNavItem[] = [
  { title: "Dashboard", href: "/dashboard", group: "Main" },
  { title: "Users", href: "/users", group: "User Management" },
  { title: "Mechanics", href: "/mechanics", group: "User Management" },
  { title: "Vehicle Make Type", href: "/vehicle-make-type", group: "Vehicles" },
  { title: "Vehicle Variant", href: "/vehicle-variant", group: "Vehicles" },
  { title: "Vehicles", href: "/vehicles", group: "Vehicles" },
  { title: "Job Cards", href: "/job-cards", group: "Service" },
  { title: "Police Stations", href: "/ps", group: "PS & Officers" },
  { title: "Officers", href: "/officers", group: "PS & Officers" },
  { title: "Received Vouchers", href: "/received-voucher", group: "Inventory" },
  { title: "Stock", href: "/total-stock", group: "Inventory" },
  { title: "Inspections", href: "/inspection", group: "Inspections" },
  { title: "Inspection Report", href: "/reports/inspection", group: "Reports" },
  { title: "Officer Vehicle Allotment Report", href: "/reports/allotment", group: "Reports" },
  { title: "Daily Job Card Report", href: "/reports/daily-job-card", group: "Reports" },
  { title: "Stock Report", href: "/reports/stock", group: "Reports" },
  { title: "Vehicle Fuel Report", href: "/reports/vehicle-fuel", group: "Reports" },
];

export const quickActions = [
  { title: "New Job Card", href: "/job-cards", description: "Create or manage job cards" },
  { title: "Add Vehicle", href: "/vehicles", description: "Vehicle registry" },
  { title: "Received Voucher", href: "/received-voucher", description: "Store inward stock" },
  { title: "Officer Allotment", href: "/officer-vehicle-allotment", description: "Assign vehicles" },
  { title: "Reports", href: "/reports/daily-job-card", description: "View daily reports" },
];
