import { promises as fsPromises } from 'fs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate extension icons
async function generateIcons(extensionDir) {
  try {
    const iconSizes = [48, 96];
    const iconsDir = path.resolve(extensionDir, 'icons');

    // Ensure icons directory exists
    await fsPromises.mkdir(iconsDir, { recursive: true });
    console.log('Created icons directory:', iconsDir);

    // Generate icons using SVG template with a more visible design
    const iconSvg = `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" rx="20" fill="#4F46E5"/>
        <path d="M28 48h40M48 28v40" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="48" cy="48" r="32" stroke="white" stroke-width="4" stroke-opacity="0.5"/>
      </svg>
    `;

    // Generate different icon sizes
    for (const size of iconSizes) {
      const outputPath = path.resolve(iconsDir, `icon-${size}.png`);
      console.log(`Generating icon size ${size}x${size}...`);

      try {
        const pngBuffer = await sharp(Buffer.from(iconSvg))
          .resize(size, size)
          .png()
          .toBuffer();

        await fsPromises.writeFile(outputPath, pngBuffer);
        console.log(`Successfully generated icon: ${outputPath}`);
      } catch (error) {
        console.error(`Error generating icon size ${size}:`, error);
        throw error;
      }
    }

    // Verify icons were created
    const files = await fsPromises.readdir(iconsDir);
    console.log('Generated icons:', files);

    if (files.length !== iconSizes.length) {
      throw new Error(`Expected ${iconSizes.length} icons but found ${files.length}`);
    }
  } catch (error) {
    console.error('Icon generation failed:', error);
    throw error;
  }
}

async function buildExtension() {
  try {
    console.log('Starting extension build process...');
    const distDir = path.resolve(__dirname, '../dist');
    const extensionDir = path.resolve(distDir, 'extension');
    const publicDir = path.resolve(distDir, 'public');

    // Clean and create extension directory
    console.log('Cleaning extension directory...');
    await fsPromises.rm(extensionDir, { recursive: true, force: true });
    await fsPromises.mkdir(extensionDir, { recursive: true });

    // Generate icons first
    console.log('Generating extension icons...');
    await generateIcons(extensionDir);

    // Copy and update manifest.json
    console.log('Copying and updating manifest.json...');
    const manifestPath = path.resolve(__dirname, '../manifest.json');
    const manifest = JSON.parse(await fsPromises.readFile(manifestPath, 'utf-8'));

    // Ensure Firefox-specific settings
    manifest.manifest_version = 2;
    manifest.browser_specific_settings = {
      gecko: {
        id: "omnitools@firefox.extension",
        strict_min_version: "57.0"
      }
    };

    await fsPromises.writeFile(
      path.resolve(extensionDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

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

    // Copy Vite build files
    console.log('Copying Vite build files...');
    if (fs.existsSync(publicDir)) {
      await fsPromises.cp(publicDir, extensionDir, { recursive: true });
    } else {
      throw new Error('Vite build files not found. Make sure to run vite build first.');
    }

    // Verify all required files exist
    const requiredFiles = ['manifest.json', 'background.js', 'content.js', 'index.html'];
    const missingFiles = [];

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.resolve(extensionDir, file))) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }

    console.log('Extension build completed successfully!');
    console.log('Extension files are in:', extensionDir);

    // List all generated files
    const files = await fsPromises.readdir(extensionDir);
    console.log('Generated files:', files);
  } catch (error) {
    console.error('Error building extension:', error);
    process.exit(1);
  }
}

buildExtension();