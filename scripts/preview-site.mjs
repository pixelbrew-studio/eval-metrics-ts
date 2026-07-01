import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const siteDir = path.join(rootDir, "site");
const port = Number.parseInt(process.env.PORT ?? "4173", 10);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
]);

const server = http.createServer(async (request, response) => {
  try {
    const requestPath = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).pathname;
    const normalizedPath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, "");
    let filePath = path.join(siteDir, normalizedPath);

    if (requestPath.endsWith("/")) filePath = path.join(filePath, "index.html");

    const fileStats = await stat(filePath).catch(() => null);
    if (fileStats?.isDirectory()) filePath = path.join(filePath, "index.html");

    const payload = await readFile(filePath);
    const contentType = mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream";

    response.writeHead(200, { "Content-Type": contentType });
    response.end(payload);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Previewing site at http://localhost:${port}`);
});
