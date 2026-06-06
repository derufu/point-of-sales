import http from 'http';
import https from 'https';
import { URL } from 'url';

const TARGET = process.env.TARGET || 'http://localhost:8000';
const PORT = Number(process.env.PORT) || 3000;

const targetUrl = new URL(TARGET);
const isSecure = targetUrl.protocol === 'https:';
const client = isSecure ? https : http;

// 1. Connection Pooling Optimizer: Reuses sockets to prevent "Socket Starvation" under load
const proxyAgent = isSecure 
  ? new https.Agent({ keepAlive: true, maxSockets: 100 }) 
  : new http.Agent({ keepAlive: true, maxSockets: 100 });

const server = http.createServer((req, res) => {
  // 2. Safe Path Resolution: Combines target base path + incoming request path perfectly
  const baseTargetPath = targetUrl.pathname.replace(/\/$/, '');
  const destinationPath = baseTargetPath + (req.url || '/');

  // 3. Security Hardening: Strip hop-by-hop and untrusted forward headers
  const sanitizedHeaders = { ...req.headers };
  delete sanitizedHeaders['connection'];
  delete sanitizedHeaders['keep-alive'];
  delete sanitizedHeaders['proxy-authenticate'];
  delete sanitizedHeaders['proxy-authorization'];
  delete sanitizedHeaders['te'];
  delete sanitizedHeaders['trailers'];
  delete sanitizedHeaders['transfer-encoding'];
  delete sanitizedHeaders['upgrade'];

  // Override host header to match the internal destination target server
  sanitizedHeaders['host'] = targetUrl.host;

  const options: http.RequestOptions = {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port: targetUrl.port ? Number(targetUrl.port) : (isSecure ? 443 : 80),
    method: req.method,
    path: destinationPath,
    headers: sanitizedHeaders,
    agent: proxyAgent, // Apply connection pool agent
  };

  // Forward the request to the upstream target api/app
  const proxyReq = client.request(options, (proxyRes) => {
    // Forward status code and upstream response headers safely
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    // Stream response data directly to the client browser
    proxyRes.pipe(res, { end: true });
  });

  // 4. Robust Error Handling: Prevents the proxy server from crashing on network timeouts
  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error] Connection failed to ${TARGET}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway: Upstream service unavailable.');
  });

  // Catch client request cancellation errors or drops early
  req.on('error', (err) => {
    console.error('[Client Error] Incoming stream broke:', err.message);
    proxyReq.destroy();
  });

  // Stream incoming request payload body (POST/PUT data) directly to the target
  req.pipe(proxyReq, { end: true });
});

// Protect the server from sudden connection drops or socket floods
server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    return;
  }
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, () => {
  console.log(`🚀 Secure Proxy Server running: http://localhost:${PORT} -> ${TARGET}`);
});

export {};
