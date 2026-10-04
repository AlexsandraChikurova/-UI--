import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const host = '127.0.0.1';
const port = 4173;
const root = process.cwd();

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
};

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = normalize(join(root, relativePath));

  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Файл не найден');
    return;
  }

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': contentTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Порт ${port} уже занят. Закройте старое окно сервера и попробуйте снова.`);
  } else {
    console.error('Не удалось запустить сервер:', error.message);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log('Focus Deck запущен:');
  console.log(`http://${host}:${port}/`);
  console.log('Не закрывайте это окно, пока работаете с сайтом.');
});
