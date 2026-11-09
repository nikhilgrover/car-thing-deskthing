import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

async function build() {
  console.log('🚀 Building DeskThing Kiosk for BridgeThing...');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 1. Bundle JavaScript with esbuild
  console.log('📦 Bundling src/app.js with esbuild...');
  await esbuild.build({
    entryPoints: ['src/app.js'],
    bundle: true,
    minify: true,
    sourcemap: false,
    format: 'esm',
    target: ['chrome100'],
    outfile: path.join(distDir, 'app.js'),
  });

  // 2. Copy static files into dist
  console.log('📋 Copying index.html, styles.css, manifest.json, icon.svg...');
  fs.copyFileSync('src/index.html', path.join(distDir, 'index.html'));
  fs.copyFileSync('src/styles.css', path.join(distDir, 'styles.css'));
  fs.copyFileSync('src/manifest.json', path.join(distDir, 'manifest.json'));
  fs.copyFileSync('src/icon.svg', path.join(distDir, 'icon.svg'));

  // 3. Create installable zip package for BridgeThing
  const zipPath = path.join(distDir, 'deskthing-kiosk.zip');
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  console.log('🗜️  Packaging into dist/deskthing-kiosk.zip...');
  execSync('zip -q -9 deskthing-kiosk.zip index.html manifest.json icon.svg app.js styles.css', {
    cwd: distDir,
  });

  // 4. Calculate SHA256 checksum and size
  const zipBuffer = fs.readFileSync(zipPath);
  const sha256 = crypto.createHash('sha256').update(zipBuffer).digest('hex');
  const sizeKb = (zipBuffer.length / 1024).toFixed(2);

  console.log('\n======================================================');
  console.log('✅ BridgeThing WebApp Package Built Successfully!');
  console.log(`📁 Output File: ${zipPath}`);
  console.log(`⚖️  Size:        ${sizeKb} KB (${zipBuffer.length} bytes)`);
  console.log(`🔒 SHA256:      ${sha256}`);
  console.log('======================================================\n');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
