import fs from "fs";
import path from "path";

const root = path.resolve("src/app/(dashboard)");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name === "page.tsx") files.push(p);
  }
  return files;
}

const broken = /<(\w+Content) \{\s*(\w+),\s*\}\=\{\{\s*\2,\s*\}\} \/>/gs;

for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  if (!broken.test(src)) continue;
  broken.lastIndex = 0;
  src = src.replace(broken, "<$1 $2={$2} />");
  fs.writeFileSync(file, src);
  console.log("fixed:", path.relative(root, file));
}
