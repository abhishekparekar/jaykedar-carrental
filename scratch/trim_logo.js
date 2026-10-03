import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function trimLogo() {
  const logoPaths = [
    path.join(__dirname, '../src/assets/carrentalserviceslogo2.png'),
    path.join(__dirname, '../public/carrentalserviceslogo2.png'),
    path.join(__dirname, '../src/assets/carrentalserviceslogo.png'),
    path.join(__dirname, '../public/logo.png'),
  ];

  for (const inputPath of logoPaths) {
    try {
      console.log('Trimming logo at:', inputPath);
      const trimmedBuffer = await sharp(inputPath)
        .trim({ threshold: 10 })
        .toBuffer();

      const tmpPath = inputPath + '.tmp.png';
      await sharp(trimmedBuffer).toFile(tmpPath);
      fs.copyFileSync(tmpPath, inputPath);
      fs.unlinkSync(tmpPath);
      console.log('Successfully trimmed logo at:', inputPath);
    } catch (err) {
      console.error('Error trimming logo:', inputPath, err);
    }
  }
}

trimLogo();
