import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketHandlers } from './lib/socket/handlers';
import { getAdminStats } from './lib/game/room-manager';
import { createLogger } from './lib/logger';

const log = createLogger('server');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);

      // Health check endpoint (supports both with and without basePath)
      const healthPath = basePath ? `${basePath}/health` : '/health';
      if ((parsedUrl.pathname === '/health' || parsedUrl.pathname === healthPath) && req.method === 'GET') {
        res.statusCode = 200;
        res.end('OK');
        return;
      }

      // Handle admin stats API directly to access server-side room state
      const adminStatsPath = basePath ? `${basePath}/api/admin/stats` : '/api/admin/stats';
      if ((parsedUrl.pathname === '/api/admin/stats' || parsedUrl.pathname === adminStatsPath) && req.method === 'GET') {
        const stats = getAdminStats();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(stats));
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      log.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Create Socket.io server
  const io = new SocketIOServer(httpServer, {
    path: `${basePath}/socket.io`,
    cors: {
      origin: dev ? '*' : false, // Allow all origins in dev, restrict in production
      methods: ['GET', 'POST'],
    },
  });

  // Setup Socket.io event handlers
  setupSocketHandlers(io);

  // Start server
  httpServer.listen(port, () => {
    log.info(`Ready on http://${hostname}:${port}${basePath}`);
    log.info(`Environment: ${dev ? 'development' : 'production'}`);
    log.info(`Socket.io server running on path: ${basePath}/socket.io`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log.info('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
      log.info('HTTP server closed');
    });
  });
});
