import fs from "fs";
import path from "path";

const root = path.resolve("src/app/(dashboard)");
const skip = new Set(["dashboard/page.tsx"]);

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name === "page.tsx") files.push(p);
  }
  return files;
}

for (const file of walk(root)) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (skip.has(rel)) continue;

  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("export default async function")) continue;
  if (src.includes("StreamPage")) continue;

  const match = src.match(/export default async function (\w+)\(([^)]*)\)\s*\{([\s\S]*)\}\s*$/);
  if (!match) {
    console.log("skip pattern:", rel);
    continue;
  }

  const [, fnName, params, body] = match;
  const contentName = `${fnName}Content`;

  if (!src.includes("stream-page")) {
    const firstImport = src.indexOf("import ");
    src = `${src.slice(0, firstImport)}import { StreamPage } from "@/components/shared/stream-page";\n${src.slice(firstImport)}`;
  }

  const paramName = params.trim() ? params.split(":")[0].trim() : "";
  const childJsx = paramName
    ? `<${contentName} ${paramName}={${paramName}} />`
    : `<${contentName} />`;

  const replacement = `export default function ${fnName}(${params}) {
  return (
    <StreamPage>
      ${childJsx}
    </StreamPage>
  );
}

async function ${contentName}(${params}) {${body}}`;

  src = src.replace(/export default async function [\s\S]*$/, replacement);
  fs.writeFileSync(file, src);
  console.log("updated:", rel);
}
