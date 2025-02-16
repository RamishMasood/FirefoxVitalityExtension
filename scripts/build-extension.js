import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildExtension() {
  try {
    const distDir = path.resolve(__dirname, '../dist');
    const extensionDir = path.resolve(distDir, 'extension');

    // Create dist/extension directory if it doesn't exist
    await fsPromises.mkdir(extensionDir, { recursive: true });

    // Copy manifest.json
    await fsPromises.copyFile(
      path.resolve(__dirname, '../manifest.json'),
      path.resolve(extensionDir, 'manifest.json')
    );

    // Build background script
    await build({
      entryPoints: [path.resolve(__dirname, '../client/src/pages/Background.tsx')],
      bundle: true,
      outfile: path.resolve(extensionDir, 'background.js'),
      format: 'esm',
      platform: 'browser',
      target: 'es2015',
      external: ['webextension-polyfill'],
    });

    // Build content script
    await build({
      entryPoints: [path.resolve(__dirname, '../client/src/content.ts')],
      bundle: true,
      outfile: path.resolve(extensionDir, 'content.js'),
      format: 'iife',
      platform: 'browser',
      target: 'es2015',
      external: ['webextension-polyfill'],
    });

    // Copy other necessary files from Vite build
    const viteDistDir = path.resolve(distDir, 'public');
    if (fs.existsSync(viteDistDir)) {
      await fsPromises.cp(viteDistDir, extensionDir, { recursive: true });
    }

    // Create icons directory and copy icons if they exist
    const iconsDir = path.resolve(extensionDir, 'icons');
    await fsPromises.mkdir(iconsDir, { recursive: true });

    console.log('Extension build completed successfully!');
    console.log('Extension files are in:', extensionDir);
  } catch (error) {
    console.error('Error building extension:', error);
    process.exit(1);
  }
}

buildExtension();