// Reverse proxy so the app is reachable on the shared work-host port.
// Usage: node scripts/serve-port.mjs <listenPort> <targetPort>
import http from "node:http";

const listenPort = Number(process.argv[2] || 12000);
const targetPort = Number(process.argv[3] || 8080);

const server = http.createServer((req, res) => {
  const upstream = http.request(
    {
      host: "127.0.0.1",
      port: targetPort,
      method: req.method,
      path: req.url,
      headers: { ...req.headers, host: `127.0.0.1:${targetPort}` },
    },
    (up) => {
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    },
  );
  upstream.on("error", (err) => {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end(`proxy error: ${err.message}`);
  });
  req.pipe(upstream);
});

server.listen(listenPort, "0.0.0.0", () => {
  console.log(`[serve-port] 0.0.0.0:${listenPort} -> 127.0.0.1:${targetPort}`);
});
