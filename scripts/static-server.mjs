import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 43817);
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function resolveRequest(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const candidate = resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;
  try {
    return statSync(candidate).isDirectory() ? resolve(candidate, 'index.html') : candidate;
  } catch {
    return pathname.endsWith('/') ? resolve(candidate, 'index.html') : candidate;
  }
}

const server = createServer((request, response) => {
  request.on('error', () => {
    response.destroy();
  });
  response.on('error', () => {});

  if (request.url === '/__health') {
    response.writeHead(200, { 'content-type': 'text/plain' });
    response.end('ok');
    return;
  }

  const file = resolveRequest(request.url);
  if (!file) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-length': info.size,
      'content-type': mime[extname(file).toLowerCase()] || 'application/octet-stream',
      'x-content-type-options': 'nosniff'
    });
    if (request.method === 'HEAD') response.end();
    else {
      const stream = createReadStream(file);
      stream.on('error', () => {
        if (!response.headersSent) {
          response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
        }
        if (!response.writableEnded) response.end('Read error');
      });
      stream.pipe(response);
    }
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.on('clientError', (_, socket) => {
  socket.destroy();
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Physics test server listening on http://127.0.0.1:${port}`);
});
