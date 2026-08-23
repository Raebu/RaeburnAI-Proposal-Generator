import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const standalone = resolve(root, '.next/standalone');

if (!existsSync(resolve(standalone, 'server.js'))) {
  throw new Error('Standalone production build is missing. Run npm run build first.');
}

mkdirSync(resolve(standalone, '.next'), { recursive: true });
cpSync(resolve(root, '.next/static'), resolve(standalone, '.next/static'), {
  recursive: true
});
if (existsSync(resolve(root, 'public'))) {
  cpSync(resolve(root, 'public'), resolve(standalone, 'public'), { recursive: true });
}

await import(pathToFileURL(resolve(standalone, 'server.js')).href);
