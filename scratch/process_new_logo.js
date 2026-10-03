import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function removeWhiteBg(inputPath, outputPaths) {
  try {
    const image = sharp(inputPath);
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    const pixelCount = width * height;

    for (let i = 0; i < pixelCount * channels; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Aggressive background removal: if pixel is light/white/gray background, make alpha 0
      if (r > 175 && g > 175 && b > 175) {
        data[i + 3] = 0;
      } else if (r > 140 && g > 140 && b > 140) {
        const avg = (r + g + b) / 3;
        const opacityFactor = (175 - avg) / 35;
        data[i + 3] = Math.max(0, Math.min(255, Math.floor(a * opacityFactor)));
      }
    }

    for (const outputPath of outputPaths) {
      await sharp(data, {
        raw: { width, height, channels }
      })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(outputPath);
      console.log(`Saved 100% transparent logo to: ${outputPath}`);
    }
  } catch (err) {
    console.error(`Error processing logo:`, err);
  }
}

async function run() {
  const root = path.resolve(__dirname, '..');
  const generatedLogo = 'C:\\Users\\HP-PC\\.gemini\\antigravity-ide\\brain\\4be78ab2-f1e7-494d-ab2e-7d4e99ee3c09\\luxury_golden_car_rental_logo_1785504193435.png';
  
  const targets = [
    path.join(root, 'src', 'assets', 'carrentalserviceslogo2.png'),
    path.join(root, 'src', 'assets', 'carrentalserviceslogo.png'),
    path.join(root, 'public', 'carrentalserviceslogo2.png'),
    path.join(root, 'public', 'logo.png')
  ];

  await removeWhiteBg(generatedLogo, targets);
}

run();
