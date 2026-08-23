const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const url = require('url');

const PORT = 4000;
// Workspace root directory is the parent of js/ folder
const rootDir = path.resolve(__dirname, '../..');
const rootDirResolved = rootDir + path.sep;
const imagesDir = path.join(rootDir, 'assets', 'images');

const whitelistProjects = [
  'uber', 'bambino', 'cream-stone', 'karma-kettle', 'fhd-group',
  'organo', 'eclaire', 'knot', 'sensomatic', 'amogham',
  'brew-nation', 'shian', 'v-krafts', 'over-the-wicket',
  'goldstone', 'supervek'
];

const allowedOrigins = [
  'https://disside.com',
  'https://www.disside.com',
  'http://localhost:4000',
  'http://127.0.0.1:4000'
];

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.mp4': 'video/mp4'
};

// Strict Path Confinement: Prevents Directory Traversal & Arbitrary File Reads (LFI)
function safeResolve(requestPath) {
  // Prefixing with '.' ensures requestPath is treated as relative to rootDir
  const candidate = path.resolve(rootDir, '.' + requestPath);
  if (!candidate.startsWith(rootDirResolved) && candidate !== rootDirResolved.slice(0, -1)) {
    return null; // Escaped root directory -> reject immediately
  }
  return candidate;
}

const server = http.createServer(async (req, res) => {
  // 1. Method Guard: Reject non-GET / non-HEAD requests on static server
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    res.writeHead(405, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    return res.end('Method Not Allowed');
  }

  // 2. Safe URI Decoding with try-catch (Prevents malformed URL % crashes / one-shot DoS)
  let pathname;
  let parsedUrl;
  try {
    parsedUrl = url.parse(req.url, true);
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    return res.end('Bad Request');
  }

  // CORS Headers Configuration
  const reqOrigin = req.headers.origin;
  if (reqOrigin && allowedOrigins.includes(reqOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // 3. Dynamic Gallery Discovery Endpoint
  if (pathname === '/assets/php/get-gallery.php' || pathname === '/php/get-gallery.php' || pathname === '/get-gallery.php' || pathname === '/api/gallery') {
    const rawClient = parsedUrl.query.client || parsedUrl.query.project || '';
    const client = (typeof rawClient === 'string' ? rawClient : '').toLowerCase().trim();

    if (!client || !whitelistProjects.includes(client) || !/^[a-z0-9\-]+$/.test(client)) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8', 'X-Content-Type-Options': 'nosniff' });
      return res.end(JSON.stringify({ success: false, message: 'Invalid or unapproved project identifier.', images: [] }));
    }

    const targetDir = path.join(imagesDir, client);
    try {
      const dirStat = await fsp.stat(targetDir);
      if (!dirStat.isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8', 'X-Content-Type-Options': 'nosniff' });
        return res.end(JSON.stringify({ success: false, message: 'Project directory not found.', images: [] }));
      }

      // ETag & HTTP Caching for Gallery Discovery
      const etag = `W/"gal_${client}_${dirStat.mtimeMs}"`;
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('ETag', etag);

      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304);
        return res.end();
      }

      const allowedExts = ['.jpg', '.jpeg', '.webp', '.png', '.mp4'];
      const rawEntries = await fsp.readdir(targetDir);
      
      const files = [];
      for (const file of rawEntries) {
        if (file.startsWith('.')) continue;
        const ext = path.extname(file).toLowerCase();
        if (!allowedExts.includes(ext)) continue;

        const fullFilePath = path.join(targetDir, file);
        try {
          const fileStat = await fsp.stat(fullFilePath);
          if (fileStat.isFile()) {
            files.push(`assets/images/${client}/${file}`);
          }
        } catch {
          // Skip inaccessible file
        }
      }

      // Natural sorting
      files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Content-Type-Options': 'nosniff'
      });
      return res.end(JSON.stringify({ success: true, client, total: files.length, images: files }));
    } catch {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8', 'X-Content-Type-Options': 'nosniff' });
      return res.end(JSON.stringify({ success: false, message: 'Project directory not found.', images: [] }));
    }
  }

  // 4. Secure Static File Serving with Path Confinement Check
  let cleanPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = safeResolve(cleanPath);

  if (!filePath) {
    // Attempted directory traversal -> Return 403 Forbidden
    res.writeHead(403, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    return res.end('Forbidden');
  }

  // Asynchronous stat check to prevent event loop blocking
  let stat;
  try {
    stat = await fsp.stat(filePath);
    if (stat.isDirectory()) {
      const indexPath = safeResolve(path.join(cleanPath, 'index.html'));
      if (indexPath) {
        stat = await fsp.stat(indexPath);
      } else {
        throw new Error('Not found');
      }
    }
  } catch (err) {
    // Return honest 404 (No SPA masking of arbitrary/probe URLs)
    res.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const fileSize = stat.size;

  // ETag computation based on size + modification timestamp
  const etag = `"${fileSize}-${stat.mtimeMs}"`;
  res.setHeader('ETag', etag);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Cache-Control headers
  if (['.jpg', '.jpeg', '.webp', '.png', '.svg', '.mp4'].includes(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
  }

  // Conditional request check (304 Not Modified)
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304);
    return res.end();
  }

  // 5. HTTP Range Requests (206 Partial Content) for Video Streaming & Media Seeking
  const range = req.headers.range;
  if (range && ext === '.mp4') {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
      return res.end();
    }

    const chunksize = (end - start) + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType
    });

    if (req.method === 'HEAD') {
      return res.end();
    }

    const fileStream = fs.createReadStream(filePath, { start, end });
    fileStream.on('error', () => {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end();
    });
    fileStream.pipe(res);
    return;
  }

  // 6. Regular Static File Response with Content-Length & Stream Error Handlers
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': fileSize,
    'Accept-Ranges': 'bytes'
  });

  if (req.method === 'HEAD') {
    return res.end();
  }

  const readStream = fs.createReadStream(filePath);
  readStream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end();
  });
  readStream.pipe(res);
});

server.listen(PORT, () => {
  console.log(`Disside Hardened Server running at http://localhost:${PORT}/`);
});
