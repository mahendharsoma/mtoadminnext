import { toast } from "sonner";

export type ExportColumn<T> = {
  header: string;
  getValue: (row: T) => string | number | null | undefined;
};

export type ExportTableOptions<T> = {
  title: string;
  fileName: string;
  columns: ExportColumn<T>[];
  rows: T[];
  includeSerial?: boolean;
};

function cellText(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function buildMatrix<T>({
  columns,
  rows,
  includeSerial = true,
}: ExportTableOptions<T>): { headers: string[]; data: string[][] } {
  const headers = includeSerial
    ? ["S.No", ...columns.map((c) => c.header)]
    : columns.map((c) => c.header);

  const data = rows.map((row, index) => {
    const values = columns.map((c) => cellText(c.getValue(row)));
    return includeSerial ? [String(index + 1), ...values] : values;
  });

  return { headers, data };
}

function downloadBlob(content: BlobPart, mime: string, fileName: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function copyTableData<T>(options: ExportTableOptions<T>) {
  const { headers, data } = buildMatrix(options);
  const text = [headers, ...data].map((row) => row.join("\t")).join("\n");
  await navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

export function downloadCsv<T>(options: ExportTableOptions<T>) {
  const { headers, data } = buildMatrix(options);
  const csv = [headers, ...data].map((row) => row.map(escapeCsv).join(",")).join("\n");
  downloadBlob(`\uFEFF${csv}`, "text/csv;charset=utf-8;", `${options.fileName}.csv`);
  toast.success("CSV downloaded");
}

export async function downloadExcel<T>(options: ExportTableOptions<T>) {
  const XLSX = await import("xlsx");
  const { headers, data } = buildMatrix(options);
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Sheet1");
  XLSX.writeFile(book, `${options.fileName}.xlsx`);
  toast.success("Excel downloaded");
}

export async function downloadPdf<T>(options: ExportTableOptions<T>) {
  const { jsPDF } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");
  const { headers, data } = buildMatrix(options);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(options.title, 40, 36);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 50,
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [15, 76, 129], textColor: 255 },
    alternateRowStyles: { fillColor: [244, 247, 250] },
  });

  doc.save(`${options.fileName}.pdf`);
  toast.success("PDF downloaded");
}
