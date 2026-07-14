import fs from "fs";
import path from "path";

const root = path.resolve("src/components");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name.endsWith(".tsx")) files.push(p);
  }
  return files;
}

/** Add exportTitle near bare <DataTable if missing, using nearby PageHeader/CardTitle when possible. */
for (const file of walk(root)) {
  if (file.includes(`${path.sep}shared${path.sep}`)) continue;
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("<DataTable")) continue;
  if (src.includes("exportTitle=") || src.includes("exportConfig=")) {
    // still ensure enableExport defaults work; skip if already configured
    continue;
  }

  // Find titles from PageHeader / CardTitle in the same file
  const titleMatch =
    src.match(/PageHeader\s+title=\"([^\"]+)\"/) ||
    src.match(/<CardTitle>([^<]+)<\/CardTitle>/) ||
    src.match(/title=\{`([^`$]+)/);

  const title = titleMatch?.[1]?.trim() || path.basename(path.dirname(file)).replace(/-/g, " ");
  const fileName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Inject exportTitle into each <DataTable that lacks export props
  src = src.replace(/<DataTable(\s[^>]*?)(\/>|>)/gs, (full, attrs, end) => {
    if (attrs.includes("exportTitle") || attrs.includes("exportConfig")) return full;
    const inject = ` exportTitle="${title}" exportFileName="${fileName}"`;
    return `<DataTable${attrs}${inject}${end}`;
  });

  fs.writeFileSync(file, src);
  console.log("updated:", path.relative(root, file), "->", title);
}
