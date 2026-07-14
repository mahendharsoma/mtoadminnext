"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { TableExportButtons } from "@/components/shared/table-export-buttons";
import type { ExportColumn } from "@/lib/export-table";
import { cn } from "@/lib/utils";

export type DataTableExportConfig<TData> = {
  title: string;
  fileName: string;
  columns: ExportColumn<TData>[];
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  /** Prefixed S.No column (respects pagination). Default: true */
  showSerialNumber?: boolean;
  /** Show Copy / CSV / Excel / PDF. Default: true */
  enableExport?: boolean;
  /** Override auto export title */
  exportTitle?: string;
  /** Override auto export file name (without extension) */
  exportFileName?: string;
  /** Full override for export columns (keeps title/fileName from this or props) */
  exportConfig?: DataTableExportConfig<TData>;
}

const SKIP_EXPORT_IDS = new Set(["actions", "__serial", "serial", "s_no", "action"]);

function getColumnId<TData, TValue>(col: ColumnDef<TData, TValue>): string {
  if (col.id) return String(col.id);
  if ("accessorKey" in col && col.accessorKey != null) return String(col.accessorKey);
  return "";
}

function isSerialColumn<TData, TValue>(col: ColumnDef<TData, TValue>): boolean {
  const id = getColumnId(col).toLowerCase();
  return id === "serial" || id === "s_no" || id === "__serial";
}

function isActionsColumn<TData, TValue>(col: ColumnDef<TData, TValue>): boolean {
  const id = getColumnId(col).toLowerCase();
  return id === "actions" || id === "action" || id.includes("action");
}

function headerLabel<TData, TValue>(col: ColumnDef<TData, TValue>, fallback: string): string {
  if (typeof col.header === "string") return col.header;
  return fallback;
}

function buildAutoExportColumns<TData, TValue>(
  columns: ColumnDef<TData, TValue>[]
): ExportColumn<TData>[] {
  const result: ExportColumn<TData>[] = [];

  for (const col of columns) {
    const id = getColumnId(col);
    if (!id || SKIP_EXPORT_IDS.has(id.toLowerCase()) || isActionsColumn(col) || isSerialColumn(col)) {
      continue;
    }
    if (!("accessorKey" in col) || col.accessorKey == null) continue;

    const accessorKey = String(col.accessorKey);
    result.push({
      header: headerLabel(col, accessorKey),
      getValue: (row) => {
        const value = (row as unknown as Record<string, unknown>)[accessorKey];
        if (value === null || value === undefined) return "";
        return value as string | number;
      },
    });
  }

  return result;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "export";
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  showSerialNumber = true,
  enableExport = true,
  exportTitle = "Data Export",
  exportFileName,
  exportConfig,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  function applySearch() {
    setGlobalFilter(searchInput.trim());
  }

  const baseColumns = useMemo(
    () => columns.filter((col) => !isSerialColumn(col)),
    [columns]
  );

  const tableColumns = useMemo(() => {
    if (!showSerialNumber) return baseColumns;
    const serialCol: ColumnDef<TData, TValue> = {
      id: "__serial",
      header: "S.No",
      enableSorting: false,
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        return pageIndex * pageSize + row.index + 1;
      },
    };
    return [serialCol, ...baseColumns];
  }, [baseColumns, showSerialNumber]);

  const resolvedExport = useMemo(() => {
    if (!enableExport) return null;
    if (exportConfig) return exportConfig;

    const autoColumns = buildAutoExportColumns(baseColumns);
    if (autoColumns.length === 0) return null;

    return {
      title: exportTitle,
      fileName: exportFileName || slugify(exportTitle),
      columns: autoColumns,
    };
  }, [enableExport, exportConfig, baseColumns, exportTitle, exportFileName]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
  });

  const exportRows = table.getFilteredRowModel().rows.map((r) => r.original);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        {searchKey ? (
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              applySearch();
            }}
          >
            <div className="relative min-w-[220px] flex-1 max-w-sm space-y-1">
              <label className="text-sm font-medium text-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" size="sm" className="mb-0.5">
              Search
            </Button>
          </form>
        ) : (
          <div />
        )}

        {resolvedExport && (
          <TableExportButtons
            title={resolvedExport.title}
            fileName={resolvedExport.fileName}
            columns={resolvedExport.columns}
            rows={exportRows}
          />
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border/80 bg-muted/40">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "h-12 whitespace-nowrap px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                        header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground",
                        header.column.id === "actions" &&
                          "sticky right-0 z-10 bg-muted/95 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 transition-colors duration-150 last:border-0 hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "whitespace-nowrap px-4 py-3.5 align-middle",
                          cell.column.id === "actions" &&
                            "sticky right-0 z-10 bg-card shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tableColumns.length} className="p-0">
                    <EmptyState
                      title="No results found"
                      description="Try adjusting your search or filters to find what you're looking for."
                      className="border-0 bg-transparent"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
