"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RowDataPacket } from "mysql2/promise";

interface ReportPageProps {
  title: string;
  description: string;
  columns: ColumnDef<RowDataPacket>[];
  data: RowDataPacket[];
  searchKey?: string;
  searchPlaceholder?: string;
  showDateFilter?: boolean;
  onFilter?: (from: string, to: string) => void;
}

export function ReportPageClient({
  title,
  description,
  columns,
  data,
  searchKey,
  searchPlaceholder,
  showDateFilter,
}: ReportPageProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div>
      <PageHeader title={title} description={description}>
        {showDateFilter && (
          <form method="GET" className="flex gap-2 items-end flex-wrap">
            <div><Label className="text-xs">From</Label><Input name="from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
            <div><Label className="text-xs">To</Label><Input name="to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
            <Button type="submit" size="sm">Filter</Button>
          </form>
        )}
      </PageHeader>
      <DataTable
        columns={columns}
        data={data}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        exportTitle={title}
        exportFileName={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
      />
    </div>
  );
}
