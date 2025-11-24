import { env } from 'process';

const token = env.RAILWAY_TOKEN;
const service = env.SERVICE;
const target = Number(env.SCALE_TARGET ?? '1');
const endpoint = env.GATEWAY_URL ?? 'https://gateway.blackroad.internal/scale';

if (!token || !service) {
  throw new Error('RAILWAY_TOKEN and SERVICE are required to scale services');
}

const payload = {
  service,
  replicas: target,
  token,
};

console.log(`[scale] Scaling ${service} to ${target} replicas`);

const request = new Request(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

async function main() {
  try {
    const res = await fetch(request);
    const body = await res.text();
    if (!res.ok) {
      throw new Error(`Scale failed (${res.status}): ${body}`);
    }
    console.log(`[scale] Response: ${body}`);
  } catch (err: any) {
    console.error(`[scale] Error: ${err.message}`);
    process.exitCode = 1;
  }
}

main();
