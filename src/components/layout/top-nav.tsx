"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import {
  Bell,
  Car,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeft,
  Plus,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/hooks/use-theme";
import { quickActions, searchNavItems } from "@/lib/nav-search";
import type { JWTPayload } from "@/lib/types";
import { logoutAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    title: "Job cards pending approval",
    message: "Review active job cards awaiting approval.",
    time: "5m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Stock below threshold",
    message: "Some inventory items need replenishment.",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    title: "Vehicle service due",
    message: "Scheduled servicing reminders for this week.",
    time: "3h ago",
    unread: false,
  },
];

function NavIconButton({
  children,
  label,
  className,
  badge,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative h-9 w-9 shrink-0 rounded-xl text-muted-foreground transition-all duration-200",
        "hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Button>
  );
}

export function TopNav({
  user,
  onMenuClick,
  onSidebarToggle,
  showSidebarToggle = false,
}: {
  user: JWTPayload;
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
}) {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return searchNavItems.slice(0, 8);
    return searchNavItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function goTo(href: string) {
    router.push(href);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur-xl supports-[backdrop-filter]:bg-card/75">
      <div className="flex h-16 items-center gap-3 px-3 md:gap-4 md:px-6 lg:px-8">
        {/* Left: menu + brand */}
        <div className="flex min-w-0 shrink-0 items-center gap-2 md:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl md:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {showSidebarToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 shrink-0 rounded-xl md:flex lg:hidden"
              onClick={onSidebarToggle}
              aria-label="Toggle sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}

          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="relative shrink-0">
              <div className="absolute -inset-0.5 rounded-lg bg-primary/10 blur-sm" />
              <BrandLogo size={34} className="relative rounded-lg" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-bold tracking-tight text-foreground">MTO Command</p>
              <p className="truncate text-[11px] text-muted-foreground">Hyderabad Police · Motor Transport</p>
            </div>
          </Link>
        </div>

        {/* Center: search (desktop) */}
        <div className="hidden min-w-0 flex-1 md:flex md:max-w-md lg:max-w-lg">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex h-10 w-full items-center gap-2 rounded-xl border border-input bg-muted/40 px-3 text-sm text-muted-foreground",
                  "transition-all duration-200 hover:border-primary/25 hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring/30"
                )}
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="truncate">Search modules, reports, pages…</span>
                <kbd className="ml-auto hidden rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium lg:inline">
                  Ctrl K
                </kbd>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(100vw-2rem,28rem)] p-0" align="start">
              <div className="border-b border-border p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Search pages…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {filteredSearch.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results found</p>
                ) : (
                  filteredSearch.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => goTo(item.href)}
                      className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.group}</span>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right: actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* Mobile search toggle */}
          <NavIconButton
            label="Search"
            className="md:hidden"
            onClick={() => setMobileSearchOpen((v) => !v)}
          >
            {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </NavIconButton>

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                className="hidden h-9 gap-1.5 rounded-xl px-3 sm:flex"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">Quick Actions</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem key={action.href} asChild>
                  <Link href={action.href} className="flex flex-col items-start gap-0.5 py-2">
                    <span className="font-medium">{action.title}</span>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <NavIconButton label="Quick actions" className="sm:hidden">
                <Plus className="h-4 w-4" />
              </NavIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {quickActions.map((action) => (
                <DropdownMenuItem key={action.href} asChild>
                  <Link href={action.href}>{action.title}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <NavIconButton label="Notifications" badge={unreadCount}>
                <Bell className="h-4 w-4" />
              </NavIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {unreadCount} new
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-3">
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className={cn("text-sm font-medium", n.unread && "text-foreground")}>
                      {n.title}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.message}</span>
                  {n.unread && <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* Dark mode */}
          <NavIconButton
            label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </NavIconButton>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-xl border border-border/80 bg-muted/30 py-1 pl-1 pr-2",
                  "transition-all duration-200 hover:border-primary/20 hover:bg-muted/60"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="max-w-[120px] truncate text-xs font-semibold leading-tight lg:max-w-[140px]">
                    {user.userName}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">{user.userRole}</p>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span>{user.userName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/job-cards" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Job Cards
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/vehicles" className="gap-2">
                  <Car className="h-4 w-4" />
                  Vehicles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={() => setLogoutOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="border-t border-border/80 bg-card/95 p-3 md:hidden">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search pages…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {filteredSearch.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => goTo(item.href)}
                className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-muted"
              >
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.group}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Do you want to logout from MTO Command Center?</p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setLogoutOpen(false)}>
              No
            </Button>
            <form action={logoutAction}>
              <Button type="submit" className="rounded-xl">
                Yes, Logout
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
