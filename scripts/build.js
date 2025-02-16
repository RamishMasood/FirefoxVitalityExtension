import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // First run the Vite build
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Then build the extension
  console.log('\nBuilding the Firefox extension...');
  execSync('node scripts/build-extension.js', { stdio: 'inherit' });

  console.log('\nBuild completed successfully! The extension is ready in dist/extension');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
