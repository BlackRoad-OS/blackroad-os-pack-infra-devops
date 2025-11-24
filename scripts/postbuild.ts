import { promises as fs } from 'fs';
import path from 'path';

const beaconPath = path.join(process.cwd(), 'public', 'sig.beacon.json');

async function writeBeacon() {
  const payload = {
    ts: new Date().toISOString(),
    agent: 'InfraPack-Gen-0',
  };

  await fs.mkdir(path.dirname(beaconPath), { recursive: true });
  await fs.writeFile(beaconPath, JSON.stringify(payload, null, 2));
  console.log(`[postbuild] wrote beacon to ${beaconPath}`);
}

writeBeacon();
