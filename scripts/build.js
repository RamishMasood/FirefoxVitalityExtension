
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // First run vite build
  console.log('\nBuilding the Vite application...');
  execSync('vite build', { stdio: 'inherit' });

  // Then build the extension
  console.log('\nBuilding the extension...');
  execSync('node scripts/build-extension.js', { stdio: 'inherit' });

  console.log('\nBuild completed successfully! The extension files are ready in dist/extension');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
