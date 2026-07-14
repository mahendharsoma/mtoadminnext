import dynamic from "next/dynamic";
import { StreamPage } from "@/components/shared/stream-page";
import { dashboardRepository } from "@/lib/db/repositories/dashboard.repository";
import { PageHeader, StatCard } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Car,
  ClipboardCheck,
  ClipboardList,
  Package,
  Building2,
  FileText,
  Wrench,
} from "lucide-react";

const DashboardCharts = dynamic(
  () =>
    import("@/components/dashboard/dashboard-charts").then((m) => ({
      default: m.DashboardCharts,
    })),
  {
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    ),
  }
);

export default function DashboardPage() {
  return (
    <StreamPage
      fallback={
        <div className="space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <DashboardPageContent />
    </StreamPage>
  );
}

async function DashboardPageContent() {
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
