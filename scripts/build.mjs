import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const outputDirectory = resolve(projectRoot, 'dist');

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const entry of ['index.html', 'main.js', 'js', 'styles', 'assets']) {
  await cp(resolve(projectRoot, entry), resolve(outputDirectory, entry), { recursive: true });
}

console.log(`Static build created at ${outputDirectory}`);
