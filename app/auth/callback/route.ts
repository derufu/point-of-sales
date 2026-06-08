import http from 'node:http';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer(async (req, res) => {
    try {
      // Basic safety headers (light hardening)
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');

      await handle(req, res);
    } catch (err) {
      console.error('Server request error:', err);

      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }
  });

  /**
   * Handles low-level socket/client errors
   * Fixes TypeScript issue: Error has no "code" property
   */
  server.on('clientError', (err: NodeJS.ErrnoException, socket) => {
    const code = err.code;

    // Ignore harmless disconnects
    if (code === 'ECONNRESET' || code === 'EPIPE') {
      return;
    }

    // Avoid writing to dead sockets
    if (!socket.writable) {
      return;
    }

    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  server.listen(port, () => {
    console.log(`> Server running on http://${hostname}:${port}`);
  });
});