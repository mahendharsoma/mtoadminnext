"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import type { JWTPayload } from "@/lib/types";

export function DashboardShell({
  user,
  children,
}: {
  user: JWTPayload;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabletCollapsed, setTabletCollapsed] = useState(true);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <NavigationProgress />
      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
        tabletCollapsed={tabletCollapsed}
        onTabletCollapsedChange={setTabletCollapsed}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-out",
          "pl-0",
          tabletCollapsed ? "md:pl-[4.5rem] lg:pl-64" : "md:pl-64"
        )}
      >
        <TopNav
          user={user}
          onMenuClick={() => setMobileOpen((open) => !open)}
          onSidebarToggle={() => setTabletCollapsed((c) => !c)}
          showSidebarToggle
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
