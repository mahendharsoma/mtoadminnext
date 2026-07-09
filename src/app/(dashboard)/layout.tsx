import { getSession } from "@/lib/auth/jwt";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return <DashboardShell user={session}>{children}</DashboardShell>;
}
