"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";

const CHART_COLORS = ["#0F4C81", "#1D3557", "#16A34A", "#F59E0B"];

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const jobCardData = [
    { name: "Active", value: stats.activeJobCards },
    { name: "Approved", value: stats.approvedJobCards },
    { name: "Closed", value: stats.closedJobCards },
  ];

  const fleetData = [
    { name: "Vehicles", count: stats.totalVehicles },
    { name: "Mechanics", count: stats.totalMechanics },
    { name: "Police Stations", count: stats.psCount },
    { name: "Vouchers", count: stats.receivedVouchers },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle>Job Card Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobCardData}
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={96}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {jobCardData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 16px -4px rgb(15 76 129 / 0.12)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle>Fleet Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 16px -4px rgb(15 76 129 / 0.12)",
                  }}
                />
                <Bar dataKey="count" fill="#0F4C81" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
