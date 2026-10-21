/**
 * وكالة كراء السيارات ابن بطوطة - Local Static Web Server
 * Runs with pure Node.js (no dependencies required)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html dir="rtl" style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>الصفحة غير موجودة (404)</h2>
          <p><a href="/">العودة إلى الصفحة الرئيسية لوكالة ابن بطوطة</a></p>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`وكالة كراء السيارات ابن بطوطة - Ibn Batouta Car Rental`);
  console.log(`الموقع يعمل الآن بنجاح على: http://localhost:${PORT}`);
  console.log(`الصفحة الرئيسية: http://localhost:${PORT}/index.html`);
  console.log(`صفحة سياراتنا:  http://localhost:${PORT}/cars.html`);
  console.log(`صفحة اتصل بنا:   http://localhost:${PORT}/contact.html`);
  console.log(`======================================================\n`);
});
