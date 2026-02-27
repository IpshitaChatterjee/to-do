import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../portfolio/out");
const PORT = 3001;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

http
  .createServer((req, res) => {
    let urlPath = req.url.split("?")[0];
    // Decode percent-encoded characters (e.g. %5B→[ %5D→]) so dynamic-route
    // chunk filenames like [slug] resolve correctly on the filesystem.
    try { urlPath = decodeURIComponent(urlPath); } catch { /* keep as-is */ }
    if (urlPath === "/") urlPath = "/index.html";
    else if (!path.extname(urlPath)) urlPath = urlPath.replace(/\/$/, "") + ".html";

    const filePath = path.join(ROOT, urlPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Try index.html fallback
        fs.readFile(path.join(ROOT, "index.html"), (err2, data2) => {
          if (err2) { res.writeHead(404); res.end("Not found"); return; }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data2);
        });
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
