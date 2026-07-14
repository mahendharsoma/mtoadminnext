"use client";

import { Copy, FileSpreadsheet, FileText, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  copyTableData,
  downloadCsv,
  downloadExcel,
  downloadPdf,
  type ExportColumn,
} from "@/lib/export-table";

export function TableExportButtons<T>({
  title,
  fileName,
  columns,
  rows,
}: {
  title: string;
  fileName: string;
  columns: ExportColumn<T>[];
  rows: T[];
}) {
  const options = { title, fileName, columns, rows, includeSerial: true };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl"
        onClick={() => void copyTableData(options)}
        disabled={rows.length === 0}
      >
        <Copy className="h-4 w-4" />
        Copy
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl"
        onClick={() => downloadCsv(options)}
        disabled={rows.length === 0}
      >
        <FileText className="h-4 w-4" />
        CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl"
        onClick={() => void downloadExcel(options)}
        disabled={rows.length === 0}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl"
        onClick={() => void downloadPdf(options)}
        disabled={rows.length === 0}
      >
        <FileDown className="h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
