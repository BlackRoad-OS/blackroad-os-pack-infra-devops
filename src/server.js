const http = require('http');

function createServer() {
  return http.createServer((req, res) => {
    if (req.url === '/health') {
      const payload = JSON.stringify({ status: 'ok' });
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      });
      res.end(payload);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });
}

module.exports = { createServer };
