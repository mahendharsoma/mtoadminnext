import fs from "fs/promises";
import path from "path";

/** Mirrors CI4 generateSequentialBarcode: A0001, A0002 … Z9999, AA0001, … */
export function generateSequentialBarcode(pk: number): string {
  const maxNumber = 9999;
  const number = ((pk - 1) % maxNumber) + 1;
  const numberStr = String(number).padStart(4, "0");
  const letterIndex = Math.floor((pk - 1) / maxNumber);
  return `${numberToLetters(letterIndex)}${numberStr}`;
}

function numberToLetters(num: number): string {
  let letters = "";
  let n = num;
  while (n >= 0) {
    const remainder = n % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    n = Math.floor(n / 26) - 1;
  }
  return letters;
}

/**
 * Saves Code128 PNG under public/barcodes/items/
 * Returns relative path stored in DB: barcodes/items/item_barcode_{code}.png
 */
export async function generateBarcodeImage(barcode: string): Promise<string> {
  const bwipjs = await import("bwip-js");
  const pngBuffer = await bwipjs.toBuffer({
    bcid: "code128",
    text: barcode,
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: "center",
    paddingwidth: 8,
    paddingheight: 8,
  });

  const relativeDir = path.join("barcodes", "items");
  const barcodeDir = path.join(process.cwd(), "public", relativeDir);
  await fs.mkdir(barcodeDir, { recursive: true });

  const filename = `item_barcode_${barcode}.png`;
  await fs.writeFile(path.join(barcodeDir, filename), pngBuffer);

  return `${relativeDir.replace(/\\/g, "/")}/${filename}`;
}
