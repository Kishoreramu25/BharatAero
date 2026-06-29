import sharp from 'sharp';

async function convert() {
  await sharp('./public/logo.webp')
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile('./assets/icon.png');
    
  await sharp('./public/logo.webp')
    .resize(2732, 2732, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile('./assets/splash.png');
    
  console.log("Assets converted successfully.");
}

convert().catch(console.error);
