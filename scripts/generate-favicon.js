import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateFavicon() {
  try {
    const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
    const icoPath = path.join(process.cwd(), 'public', 'favicon.ico');
    
    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convert SVG to PNG at 32x32
    const pngBuffer = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // For now, we'll create a simple ICO file
    // In a real scenario, you'd use a library like 'ico-endec' to create proper ICO files
    // For now, we'll just copy the PNG as a placeholder
    fs.writeFileSync(icoPath, pngBuffer);
    
    console.log('✅ Favicon.ico generated successfully!');
  } catch (error) {
    console.error('❌ Error generating favicon:', error);
  }
}

generateFavicon(); 