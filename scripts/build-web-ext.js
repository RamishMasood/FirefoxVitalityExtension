import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { build } from 'esbuild';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildWebExt() {
  try {
    console.log('Starting Firefox extension build process...');
    
    // Build the Vite app first
    console.log('Building Vite application...');
    execSync('npm run build', { stdio: 'inherit' });

    const distDir = path.resolve(__dirname, '../dist');
    const extensionDir = path.resolve(distDir, 'firefox-ext');
    const publicDir = path.resolve(distDir, 'public');

    // Clean and create extension directory
    console.log('Preparing extension directory...');
    await fs.promises.rm(extensionDir, { recursive: true, force: true });
    await fs.promises.mkdir(extensionDir, { recursive: true });

    // Copy manifest and update for Firefox
    console.log('Configuring Firefox manifest...');
    const manifest = JSON.parse(
      await fs.promises.readFile(path.resolve(__dirname, '../manifest.json'), 'utf-8')
    );

    // Ensure Firefox-specific settings
    manifest.manifest_version = 2;
    manifest.browser_specific_settings = {
      gecko: {
        id: "omnitools@firefox.extension",
        strict_min_version: "57.0"
      }
    };

    await fs.promises.writeFile(
      path.resolve(extensionDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Copy Vite build files
    console.log('Copying built files...');
    await fs.promises.cp(publicDir, extensionDir, { recursive: true });

    // Build background script
    console.log('Building background script...');
    await build({
      entryPoints: [path.resolve(__dirname, '../client/src/pages/Background.tsx')],
      bundle: true,
      outfile: path.resolve(extensionDir, 'background.js'),
      format: 'iife',
      platform: 'browser',
      target: 'firefox57',
      external: ['webextension-polyfill'],
      minify: true,
    });

    // Build content script
    console.log('Building content script...');
    await build({
      entryPoints: [path.resolve(__dirname, '../client/src/content.ts')],
      bundle: true,
      outfile: path.resolve(extensionDir, 'content.js'),
      format: 'iife',
      platform: 'browser',
      target: 'firefox57',
      external: ['webextension-polyfill'],
      minify: true,
    });

    // Generate icons
    console.log('Generating extension icons...');
    const iconSizes = [48, 96];
    const iconsDir = path.resolve(extensionDir, 'icons');
    await fs.promises.mkdir(iconsDir, { recursive: true });

    const iconSvg = `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" rx="20" fill="#4F46E5"/>
        <path d="M28 48h40M48 28v40" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="48" cy="48" r="32" stroke="white" stroke-width="4" stroke-opacity="0.5"/>
      </svg>
    `;

    for (const size of iconSizes) {
      const outputPath = path.resolve(iconsDir, `icon-${size}.png`);
      const pngBuffer = await sharp(Buffer.from(iconSvg))
        .resize(size, size)
        .png()
        .toBuffer();
      await fs.promises.writeFile(outputPath, pngBuffer);
    }

    // Use web-ext to build the final package
    console.log('Building web-ext package...');
    execSync(`npx web-ext build --source-dir ${extensionDir} --artifacts-dir ${distDir}/web-ext-artifacts --overwrite-dest`, {
      stdio: 'inherit'
    });

    console.log('Firefox extension build completed successfully!');
    console.log('Extension package is in:', path.resolve(distDir, 'web-ext-artifacts'));

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildWebExt();
