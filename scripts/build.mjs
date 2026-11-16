import { copyFile, lstat, mkdir, mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const destination = join(root, 'dist');
const entryFiles = ['index.html', 'style.css', 'game.js', 'world.js', 'level.js'];
const assetExtensions = new Set(['.png', '.svg', '.ttf']);

async function exists(path) {
  try { return await lstat(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function filesBelow(directory) {
  const files = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not included in the static export: ${relative(root, path)}`);
    if (entry.isDirectory()) files.push(...await filesBelow(path));
    else if (entry.isFile()) files.push(path);
    else throw new Error(`Unsupported export entry: ${relative(root, path)}`);
  }
  return files;
}

const assetRoot = join(root, 'assets');
const assetRootStat = await lstat(assetRoot);
if (!assetRootStat.isDirectory() || assetRootStat.isSymbolicLink()) throw new Error('assets must be a regular project directory, not a symlink.');
const assetFiles = (await filesBelow(assetRoot))
  .filter(path => assetExtensions.has(extname(path)) || relative(root, path) === join('assets', 'fonts', 'OFL.txt'))
  .map(path => relative(root, path));
const files = [...entryFiles, ...assetFiles];
const allowed = new Set(files);

// Validate before touching a previous export. Never replace a symlink or a
// directory containing files outside this exact frontend allowlist.
for (const file of files) {
  const stat = await lstat(join(root, file));
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Expected a regular frontend file: ${file}`);
}
const existing = await exists(destination);
if (existing) {
  if (existing.isSymbolicLink() || !existing.isDirectory()) throw new Error('dist must be a regular generated directory, not a symlink or file.');
  for (const file of await filesBelow(destination)) {
    if (!allowed.has(relative(destination, file))) {
      throw new Error(`Refusing to replace dist containing an unexpected file: ${relative(destination, file)}`);
    }
  }
}

const staging = await mkdtemp(join(root, '.dist-stage-'));
let backup;
let previousMoved = false;
try {
  for (const file of files) {
    await mkdir(dirname(join(staging, file)), { recursive: true });
    await copyFile(join(root, file), join(staging, file));
  }
  if (existing) {
    backup = await mkdtemp(join(root, '.dist-backup-'));
    await rename(destination, join(backup, 'dist'));
    previousMoved = true;
  }
  try {
    await rename(staging, destination);
  } catch (error) {
    if (previousMoved) {
      await rename(join(backup, 'dist'), destination);
      previousMoved = false;
    }
    throw error;
  }
  if (backup) {
    await rm(backup, { recursive: true, force: true });
    backup = null;
  }
  console.log(`Static export ready: dist/ (${files.length} frontend files, no runtime server).`);
} finally {
  await rm(staging, { recursive: true, force: true });
  // Keep a backup intact if an exceptional rollback could not restore it.
  if (backup && !previousMoved) await rm(backup, { recursive: true, force: true });
}
