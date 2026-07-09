"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JobCard } from "@/lib/types";

export function JobCardsClient({ jobCards }: { jobCards: JobCard[] }) {
  const columns: ColumnDef<JobCard>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      accessorKey: "registration_no",
      header: "RC No",
      cell: ({ row }) => row.original.registration_no || "—",
    },
    {
      accessorKey: "it_no",
      header: "IT No",
      cell: ({ row }) => row.original.it_no || "—",
    },
    {
      accessorKey: "make_type",
      header: "Make Type",
      cell: ({ row }) => row.original.make_type || "—",
    },
    {
      accessorKey: "variant_name",
      header: "Variant",
      cell: ({ row }) => row.original.variant_name || "—",
    },
    {
      accessorKey: "officer_name",
      header: "Officer Name",
      cell: ({ row }) => row.original.officer_name || "—",
    },
    {
      accessorKey: "driver_name",
      header: "Driver Name",
      cell: ({ row }) => row.original.driver_name || "—",
    },
    {
      accessorKey: "mechanic_names",
      header: "Mechanic",
      cell: ({ row }) => row.original.mechanic_names || "—",
    },
    {
      accessorKey: "outside_parts",
      header: "Outside Parts",
      cell: ({ row }) => row.original.outside_parts?.trim() || "—",
    },
    {
      accessorKey: "created_on",
      header: "Job Card Created Date",
      cell: ({ row }) => {
        const value = row.original.created_on;
        if (!value) return "—";
        return String(value).replace("T", " ").slice(0, 19);
      },
    },
    {
      accessorKey: "job_card_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.job_card_status;
        const variant =
          status === "Approve"
            ? "success"
            : status === "Close"
              ? "secondary"
              : status === "Rejected"
                ? "destructive"
                : "warning";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Link href={`/job-cards/${row.original.job_card_id}`}>
          <Button variant="outline" size="sm" title="View">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Card List</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={jobCards}
          searchKey="registration_no"
          searchPlaceholder="Search:"
        />
      </CardContent>
    </Card>
  );
}
