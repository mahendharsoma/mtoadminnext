import { getLayoutSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getLayoutSession();
  if (!session) redirect("/login");

  return <DashboardShell user={session}>{children}</DashboardShell>;
}
