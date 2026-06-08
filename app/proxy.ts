import http from 'http';
import https from 'https';
import { URL } from 'url';

const TARGET = process.env.TARGET || 'http://localhost:8000';
const PORT = Number(process.env.PORT) || 3000;

const targetUrl = new URL(TARGET);
const isSecure = targetUrl.protocol === 'https:';
const client = isSecure ? https : http;

// Connection pooling optimizer
const proxyAgent = isSecure
  ? new https.Agent({ keepAlive: true, maxSockets: 100 })
  : new http.Agent({ keepAlive: true, maxSockets: 100 });

const server = http.createServer((req, res) => {
  const baseTargetPath = targetUrl.pathname.replace(/\/$/, '');
  const destinationPath = baseTargetPath + (req.url || '/');

  // Sanitize headers
  const sanitizedHeaders = { ...req.headers };

  delete sanitizedHeaders['connection'];
  delete sanitizedHeaders['keep-alive'];
  delete sanitizedHeaders['proxy-authenticate'];
  delete sanitizedHeaders['proxy-authorization'];
  delete sanitizedHeaders['te'];
  delete sanitizedHeaders['trailers'];
  delete sanitizedHeaders['transfer-encoding'];
  delete sanitizedHeaders['upgrade'];

  sanitizedHeaders['host'] = targetUrl.host;

  const options: http.RequestOptions = {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port: targetUrl.port
      ? Number(targetUrl.port)
      : isSecure
      ? 443
      : 80,
    method: req.method,
    path: destinationPath,
    headers: sanitizedHeaders,
    agent: proxyAgent,
  };

  const proxyReq = client.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error] ${TARGET}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway: Upstream service unavailable.');
  });

  req.on('error', (err) => {
    console.error('[Client Error]:', err.message);
    proxyReq.destroy();
  });

  req.pipe(proxyReq, { end: true });
});

/**
 * FIXED TYPE ERROR HERE (NO err.code direct access)
 */
server.on('clientError', (err, socket) => {
  const code = (err as unknown as { code?: string })?.code;

  if (code === 'ECONNRESET' || code === 'EPIPE') {
    return;
  }

  if (!socket.writable) {
    return;
  }

  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, () => {
  console.log(
    `🚀 Secure Proxy Server running: http://localhost:${PORT} -> ${TARGET}`
  );
});

export {};