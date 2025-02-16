import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // Build the Firefox extension using web-ext
  console.log('\nBuilding the Firefox extension...');
  execSync('node scripts/build-web-ext.js', { stdio: 'inherit' });

  console.log('\nBuild completed successfully! The extension package is ready in dist/web-ext-artifacts');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}