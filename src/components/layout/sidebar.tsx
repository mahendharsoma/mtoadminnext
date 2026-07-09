"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Car,
  Store,
  ClipboardList,
  Shield,
  Search,
  FileBarChart,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import type { JWTPayload } from "@/lib/types";

interface NavChild {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  children?: NavChild[];
}

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "User Management",
    icon: Users,
    children: [
      { title: "Users", href: "/users" },
      { title: "Mechanics", href: "/mechanics" },
    ],
  },
  {
    title: "Vehicle Management",
    icon: Car,
    children: [
      { title: "Vehicle Make Type", href: "/vehicle-make-type" },
      { title: "Vehicle Variant", href: "/vehicle-variant" },
      { title: "Vehicles", href: "/vehicles" },
    ],
  },
  {
    title: "Inventory",
    icon: Store,
    children: [
      { title: "Add Item Name", href: "/add-item-name" },
      { title: "Vendors", href: "/vendors" },
      { title: "Received Vouchers", href: "/received-voucher" },
      { title: "Stock", href: "/total-stock" },
      { title: "Lubricant Setup", href: "/lubricants" },
      { title: "Lubricant Receive Voucher", href: "/lubricant-receive-voucher" },
      { title: "Lubricant Inventory", href: "/lubricant-inventory" },
    ],
  },
  {
    title: "Service Management",
    icon: ClipboardList,
    children: [{ title: "Job Cards", href: "/job-cards" }],
  },
  {
    title: "PS & Officers",
    icon: Shield,
    children: [
      { title: "Police Stations", href: "/ps" },
      { title: "Officers", href: "/officers" },
      { title: "Officer Vehicle Allotment", href: "/officer-vehicle-allotment" },
    ],
  },
  {
    title: "Inspections",
    icon: Search,
    children: [
      { title: "Vehicle Types", href: "/vehicle-types" },
      { title: "Inspection Titles", href: "/inspection-titles" },
      { title: "Inspections", href: "/inspection" },
      { title: "Vehicle Inspection", href: "/inspection/by-vehicle" },
    ],
  },
  {
    title: "Reports",
    icon: FileBarChart,
    children: [
      { title: "RV-DC Report", href: "/reports/rv-dc" },
      { title: "Daily Job Card", href: "/reports/daily-job-card" },
      { title: "Condemnation", href: "/reports/condemnation" },
      { title: "Stock Report", href: "/reports/stock" },
      { title: "Issued Stock", href: "/reports/issued-stock" },
      { title: "Allotment Report", href: "/reports/allotment" },
      { title: "Inspection Title Report", href: "/reports/inspection-title" },
      { title: "Vehicle Fuel", href: "/reports/vehicle-fuel" },
    ],
  },
];

const springSnappy = { type: "spring" as const, stiffness: 420, damping: 32 };
const springSmooth = { type: "spring" as const, stiffness: 280, damping: 28 };

const navListVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.06 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: springSnappy },
};

const submenuContainerVariants = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: {
      height: springSmooth,
      opacity: { duration: 0.2 },
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { height: { duration: 0.22 }, opacity: { duration: 0.15 } },
  },
};

const submenuItemVariants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: springSnappy },
};

/** Exact route match — avoids /inspection matching /inspection-titles */
function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ActiveBar({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.span
      layoutId="sidebar-active-bar"
      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
      transition={springSnappy}
    />
  );
}

function HoverGlow() {
  return (
    <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/[0.07] to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  );
}

function NavIcon({ icon: Icon, active }: { icon: LucideIcon; active?: boolean }) {
  return (
    <motion.span
      className="relative z-10 flex shrink-0 items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      transition={springSnappy}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] transition-all duration-300",
          active ? "text-white drop-shadow-sm" : "text-sidebar-foreground/75 group-hover:text-white"
        )}
        strokeWidth={active ? 2.25 : 1.75}
      />
    </motion.span>
  );
}

function NavLinkItem({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const isActive = isRouteActive(pathname, item.href!);
  const Icon = item.icon;

  return (
    <motion.div variants={navItemVariants}>
      <motion.div whileHover={{ x: collapsed ? 0 : 3 }} transition={springSnappy}>
        <Link
          href={item.href!}
          prefetch
          title={collapsed ? item.title : undefined}
          className={cn(
            "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium",
            collapsed && "justify-center px-2",
            isActive ? "text-white" : "text-sidebar-foreground/80"
          )}
        >
          <ActiveBar active={isActive} />
          {isActive ? (
            <motion.span
              layoutId="sidebar-active-bg"
              className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/30"
              transition={springSnappy}
            />
          ) : (
            <>
              <HoverGlow />
              <span className="absolute inset-0 rounded-xl bg-white/0 transition-all duration-300 group-hover:bg-white/[0.08]" />
            </>
          )}
          <NavIcon icon={Icon} active={isActive} />
          {!collapsed && (
            <span className="relative z-10 truncate transition-colors duration-300 group-hover:text-white">
              {item.title}
            </span>
          )}
        </Link>
      </motion.div>
    </motion.div>
  );
}

function NavGroupItem({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const isChildActive =
    item.children?.some((child) => isRouteActive(pathname, child.href)) ?? false;
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  useEffect(() => {
    setOpen(isChildActive);
  }, [isChildActive]);

  if (collapsed) {
    const activeChild = item.children?.find((c) => isRouteActive(pathname, c.href));
    const href = activeChild?.href ?? item.children?.[0]?.href ?? "#";

    return (
      <motion.div variants={navItemVariants}>
        <Link
          href={href}
          prefetch
          title={item.title}
          className={cn(
            "group relative flex items-center justify-center rounded-xl px-2 py-2.5",
            isChildActive ? "text-white" : "text-sidebar-foreground/80"
          )}
        >
          <ActiveBar active={isChildActive} />
          {isChildActive ? (
            <motion.span
              layoutId="sidebar-active-bg"
              className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/25"
              transition={springSnappy}
            />
          ) : (
            <span className="absolute inset-0 rounded-xl bg-white/0 transition-all duration-300 group-hover:bg-white/[0.08]" />
          )}
          <NavIcon icon={Icon} active={isChildActive} />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={navItemVariants} className="space-y-0.5">
      <motion.div whileHover={{ x: 2 }} transition={springSnappy}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "group relative flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
            isChildActive ? "text-white" : "text-sidebar-foreground/80"
          )}
        >
          <ActiveBar active={isChildActive} />
          {isChildActive && (
            <motion.span
              className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.08]"
              layoutId="sidebar-group-active"
              transition={springSnappy}
            />
          )}
          {!isChildActive && (
            <>
              <HoverGlow />
              <span className="absolute inset-0 rounded-xl bg-white/0 transition-all duration-300 group-hover:bg-white/[0.08]" />
            </>
          )}
          <span className="relative z-10 flex min-w-0 items-center gap-3">
            <NavIcon icon={Icon} active={isChildActive} />
            <span className="truncate transition-colors duration-300 group-hover:text-white">
              {item.title}
            </span>
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={springSnappy}
            className="relative z-10 shrink-0 text-sidebar-foreground/50 group-hover:text-white/80"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>
      </motion.div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            variants={submenuContainerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="relative ml-4 border-l border-white/10 py-1 pl-3">
              {item.children?.map((child) => {
                const childActive = isRouteActive(pathname, child.href);
                return (
                  <motion.div key={child.href} variants={submenuItemVariants}>
                    <motion.div whileHover={{ x: 4 }} transition={springSnappy}>
                      <Link
                        href={child.href}
                        prefetch
                        className={cn(
                          "group relative my-0.5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                          childActive
                            ? "font-medium text-white"
                            : "text-sidebar-foreground/60"
                        )}
                      >
                        {childActive ? (
                          <motion.span
                            layoutId="sidebar-child-active-bg"
                            className="absolute inset-0 rounded-lg bg-primary shadow-md shadow-primary/25"
                            transition={springSnappy}
                          />
                        ) : (
                          <>
                            <HoverGlow />
                            <span className="absolute inset-0 rounded-lg bg-white/0 transition-all duration-300 group-hover:bg-white/[0.06]" />
                          </>
                        )}
                        {childActive && (
                          <motion.span
                            layoutId="sidebar-child-active-bar"
                            className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-white/90"
                            transition={springSnappy}
                          />
                        )}
                        <ChevronRight
                          className={cn(
                            "relative z-10 h-3 w-3 shrink-0 transition-all duration-300",
                            childActive
                              ? "text-white"
                              : "text-sidebar-foreground/35 group-hover:translate-x-0.5 group-hover:text-white/70"
                          )}
                        />
                        <span
                          className={cn(
                            "relative z-10 truncate transition-colors duration-300",
                            !childActive && "group-hover:text-white"
                          )}
                        >
                          {child.title}
                        </span>
                      </Link>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NavGroup({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  if (item.href) {
    return <NavLinkItem item={item} pathname={pathname} collapsed={collapsed} />;
  }
  return <NavGroupItem item={item} pathname={pathname} collapsed={collapsed} />;
}

export function Sidebar({
  user,
  mobileOpen,
  onMobileOpenChange,
  tabletCollapsed,
  onTabletCollapsedChange,
}: {
  user: JWTPayload;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  tabletCollapsed: boolean;
  onTabletCollapsedChange: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLargeScreen(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname, onMobileOpenChange]);

  const navItems =
    user.userRole === "Admin"
      ? adminNavItems
      : adminNavItems.filter((i) => i.title === "Dashboard" || i.title === "Inventory");

  const isCollapsed = tabletCollapsed && !isLargeScreen;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-[#0a1628]/60 backdrop-blur-sm md:hidden"
            onClick={() => onMobileOpenChange(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar",
          "transition-[transform,width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "w-64 -translate-x-full md:translate-x-0",
          mobileOpen && "translate-x-0",
          isCollapsed ? "md:w-[4.5rem] lg:w-64" : "md:w-64"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "flex h-16 shrink-0 items-center gap-3 border-b border-white/8 px-4",
            isCollapsed && "md:justify-center md:px-2 lg:justify-start lg:px-4"
          )}
        >
          <motion.div
            className="relative shrink-0"
            whileHover={{ scale: 1.06 }}
            transition={springSnappy}
          >
            <div className="absolute -inset-1 rounded-full bg-primary/20 blur-sm" />
            <BrandLogo size={36} className="relative rounded-lg" />
          </motion.div>
          {(!isCollapsed || isLargeScreen) && (
            <div className={cn("min-w-0", isCollapsed && "md:hidden lg:block")}>
              <p className="truncate text-sm font-semibold tracking-wide text-white">MTO Command</p>
              <p className="truncate text-[11px] text-sidebar-foreground/55">Hyderabad Police</p>
            </div>
          )}
        </motion.div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabletCollapsedChange(!tabletCollapsed)}
          className="mx-3 mt-3 hidden items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-sidebar-foreground/70 md:flex lg:hidden"
        >
          {isCollapsed ? (
            <>
              <PanelLeft className="h-4 w-4" />
              Expand
            </>
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Collapse
            </>
          )}
        </motion.button>

        <motion.nav
          variants={navListVariants}
          initial="hidden"
          animate="show"
          className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3 lg:p-4"
        >
          {navItems.map((item) => (
            <NavGroup key={item.title} item={item} pathname={pathname} collapsed={isCollapsed} />
          ))}
        </motion.nav>

        <div
          className={cn(
            "flex shrink-0 items-center gap-2 border-t border-white/8 p-4",
            isCollapsed && "md:hidden lg:flex"
          )}
        >
          <Circle className="h-2 w-2 animate-pulse fill-success text-success" />
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40">MTO Admin v1.0</p>
        </div>
      </aside>
    </>
  );
}
