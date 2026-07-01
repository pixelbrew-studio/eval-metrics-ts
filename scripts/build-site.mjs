import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const siteDir = path.join(rootDir, "site");

await rm(siteDir, { recursive: true, force: true });
await mkdir(siteDir, { recursive: true });

await cp(path.join(rootDir, "demo"), siteDir, { recursive: true });
await cp(path.join(rootDir, "dist"), path.join(siteDir, "dist"), { recursive: true });
const demoScriptPath = path.join(siteDir, "demo.js");
const demoScript = await readFile(demoScriptPath, "utf8");
await writeFile(demoScriptPath, demoScript.replace("../dist/index.js", "./dist/index.js"));
await writeFile(path.join(siteDir, ".nojekyll"), "");
