import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const siteDir = path.join(rootDir, "site");
const primerCssSource = path.join(rootDir, "node_modules", "@primer", "css", "dist", "primer.css");
const primerThemeSource = path.join(
  rootDir,
  "node_modules",
  "@primer",
  "primitives",
  "dist",
  "css",
  "functional",
  "themes",
  "light.css",
);

await rm(siteDir, { recursive: true, force: true });
await mkdir(siteDir, { recursive: true });

const demoDir = path.join(rootDir, "demo");
for (const entry of await readdir(demoDir)) {
  await cp(path.join(demoDir, entry), path.join(siteDir, entry), { recursive: true });
}
await cp(path.join(rootDir, "dist"), path.join(siteDir, "dist"), { recursive: true });
await cp(primerCssSource, path.join(siteDir, "primer.css"));
await cp(primerThemeSource, path.join(siteDir, "primer-theme.css"));
const demoScriptPath = path.join(siteDir, "demo.js");
const demoScript = await readFile(demoScriptPath, "utf8");
await writeFile(demoScriptPath, demoScript.replace("../dist/index.js", "./dist/index.js"));
const htmlPath = path.join(siteDir, "index.html");
const html = await readFile(htmlPath, "utf8");
await writeFile(
  htmlPath,
  html
    .replace(
      "../node_modules/@primer/primitives/dist/css/functional/themes/light.css",
      "./primer-theme.css",
    )
    .replace("../node_modules/@primer/css/dist/primer.css", "./primer.css"),
);
await writeFile(path.join(siteDir, ".nojekyll"), "");
