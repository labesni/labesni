const https = require("https");
const http = require("http");

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/claude") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
      if (!apiKey) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "API key not set" }));
        return;
      }

      let parsed;
      try { parsed = JSON.parse(body); }
      catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }

      const payload = JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1800,
        messages: parsed.messages,
      });

      const options = {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const proxyReq = https.request(options, proxyRes => {
        let data = "";
        proxyRes.on("data", chunk => { data += chunk; });
        proxyRes.on("end", () => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(data);
        });
      });

      proxyReq.on("error", err => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      });

      proxyReq.write(payload);
      proxyReq.end();
    });
    return;
  }

  // Serve static files
  const fs = require("fs");
  const path = require("path");
  let filePath = path.join(__dirname, "build", req.url === "/" ? "index.html" : req.url);
  
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, "build", "index.html");
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    ".html": "text/html", ".js": "application/javascript",
    ".css": "text/css", ".png": "image/png",
    ".ico": "image/x-icon", ".json": "application/json"
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    res.end(content);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
