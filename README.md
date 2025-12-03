# blackroad-os-pack-infra-devops

Minimal Node.js service with a `/health` endpoint suitable for Railway or Cloudflare deployments.

## Running locally

```bash
npm install
npm start
```

The server listens on `PORT` (defaults to `8080`). Visit `http://localhost:8080/health` to verify it responds with `{"status":"ok"}`.

## Testing

```bash
npm test
```

Tests use the built-in `node:test` runner to exercise the health endpoint and 404 handling.
