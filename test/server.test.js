const assert = require('assert');
const http = require('http');
const { once } = require('events');
const { test, before, after } = require('node:test');
const { createServer } = require('../src/server');

let server;
let address;

before(async () => {
  server = createServer();
  server.listen(0);
  await once(server, 'listening');
  address = server.address();
});

after(async () => {
  server.close();
  await once(server, 'close');
});

const makeRequest = (path) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: '127.0.0.1',
    port: address.port,
    path,
    method: 'GET',
  }, (res) => {
    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
      resolve({
        statusCode: res.statusCode,
        body: Buffer.concat(chunks).toString(),
        headers: res.headers,
      });
    });
  });

  req.on('error', reject);
  req.end();
});

test('responds with health status', async () => {
  const response = await makeRequest('/health');
  assert.strictEqual(response.statusCode, 200);
  const json = JSON.parse(response.body);
  assert.deepStrictEqual(json, { status: 'ok' });
});

test('returns 404 for unknown routes', async () => {
  const response = await makeRequest('/missing');
  assert.strictEqual(response.statusCode, 404);
  const json = JSON.parse(response.body);
  assert.deepStrictEqual(json, { error: 'Not Found' });
});
