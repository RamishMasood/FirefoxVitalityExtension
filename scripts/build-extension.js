import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildExtension() {
  try {
    const distDir = path.resolve(__dirname, '../dist/extension');

    // Create dist/extension directory if it doesn't exist
    await fs.mkdir(distDir, { recursive: true });

    // Copy manifest.json
    await fs.copyFile(
      path.resolve(__dirname, '../manifest.json'),
      path.resolve(distDir, 'manifest.json')
    );

    // Build background script
    await build({
      entryPoints: [path.resolve(__dirname, '../client/src/pages/Background.tsx')],
      bundle: true,
      outfile: path.resolve(distDir, 'background.js'),
      format: 'esm',
      platform: 'browser',
      target: 'es2015',
      external: ['webextension-polyfill'],
    });

    // Build content script
    await build({
      entryPoints: [path.resolve(__dirname, '../client/src/content.ts')],
      bundle: true,
      outfile: path.resolve(distDir, 'content.js'),
      format: 'iife',
      platform: 'browser',
      target: 'es2015',
      external: ['webextension-polyfill'],
    });

    // Copy built files from Vite
    await fs.cp(
      path.resolve(__dirname, '../dist/public'),
      distDir,
      { recursive: true }
    );

    console.log('Extension build completed successfully!');
  } catch (error) {
    console.error('Error building extension:', error);
    process.exit(1);
  }
}

buildExtension();