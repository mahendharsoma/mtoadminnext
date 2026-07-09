import { dashboardRepository } from "@/lib/db/repositories/dashboard.repository";
import { PageHeader, StatCard } from "@/components/shared/page-header";
import {
  Car,
  ClipboardCheck,
  ClipboardList,
  Package,
  Building2,
  FileText,
  Wrench,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

export default async function DashboardPage() {
  const stats = await dashboardRepository.getStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Command Dashboard"
        description="Real-time overview of fleet operations, job cards, inventory, and police station metrics."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Vehicles" value={stats.totalVehicles} icon={<Car className="h-6 w-6" />} />
        <StatCard
          title="Active Job Cards"
          value={stats.activeJobCards}
          icon={<ClipboardList className="h-6 w-6" />}
        />
        <StatCard
          title="Approved Job Cards"
          value={stats.approvedJobCards}
          icon={<ClipboardCheck className="h-6 w-6" />}
        />
        <StatCard
          title="Closed Job Cards"
          value={stats.closedJobCards}
          icon={<FileText className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Received Vouchers"
          value={stats.receivedVouchers}
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          title="Available Stock Qty"
          value={stats.totalStockQuantity}
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard title="Mechanics" value={stats.totalMechanics} icon={<Wrench className="h-6 w-6" />} />
        <StatCard title="Police Stations" value={stats.psCount} icon={<Building2 className="h-6 w-6" />} />
      </div>

      <DashboardCharts stats={stats} />
    </div>
  );
}
