import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');

async function convert() {
  const logoPath = path.join(frontendDir, 'public', 'logo.webp');
  const iconPath = path.join(frontendDir, 'assets', 'icon.png');
  const splashPath = path.join(frontendDir, 'assets', 'splash.png');

  await sharp(logoPath)
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(iconPath);
    
  await sharp(logoPath)
    .resize(2732, 2732, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(splashPath);
    
  console.log("Assets converted successfully.");
}

convert().catch(console.error);
