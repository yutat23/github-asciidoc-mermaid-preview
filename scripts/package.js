import { createWriteStream } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf-8'));
const outFile = join(root, `github-asciidoc-mermaid-preview-v${pkg.version}.zip`);

const archive = archiver('zip', { zlib: { level: 9 } });
const stream = createWriteStream(outFile);

archive.pipe(stream);
archive.directory(distDir, false);
await archive.finalize();

await new Promise((resolve, reject) => {
  stream.on('close', resolve);
  stream.on('error', reject);
});

console.log(`Created: ${outFile}`);
