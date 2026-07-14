/**
 * Resolves barcode image URL for display/print.
 * Supports:
 * - New: barcodes/items/item_barcode_A0001.png
 * - Legacy CI4 filename: item_barcode_A0001.png
 * - Legacy full path: assets/images/barcodes/...
 */
export function getBarcodeImageSrc(barcodeImage: string | null | undefined): string {
  if (!barcodeImage) return "";
  const normalized = barcodeImage.replace(/\\/g, "/");
  if (normalized.includes("/")) {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
  // Filename only — try new items folder first, then CI4 path
  if (normalized.startsWith("item_barcode_")) {
    return `/barcodes/items/${normalized}`;
  }
  return `/assets/images/barcodes/${normalized}`;
}
