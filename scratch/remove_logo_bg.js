import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function removeWhiteBg(inputPath, outputPath) {
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

      // If pixel is white / very light gray, make transparent
      if (r > 230 && g > 230 && b > 230) {
        data[i + 3] = 0;
      } else if (r > 210 && g > 210 && b > 210) {
        // Smooth alpha feathering for anti-aliasing edges
        const avg = (r + g + b) / 3;
        const opacityFactor = (230 - avg) / 20;
        data[i + 3] = Math.max(0, Math.min(255, Math.floor(a * opacityFactor)));
      }
    }

    await sharp(data, {
      raw: { width, height, channels }
    })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(outputPath);

    console.log(`Successfully processed: ${outputPath}`);
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err);
  }
}

async function run() {
  const root = path.resolve(__dirname, '..');
  
  const filesToProcess = [
    { in: path.join(root, 'src/assets/carrentalserviceslogo2.png'), out: path.join(root, 'src/assets/carrentalserviceslogo2.png') },
    { in: path.join(root, 'src/assets/carrentalserviceslogo.png'), out: path.join(root, 'src/assets/carrentalserviceslogo.png') },
  ];

  for (const item of filesToProcess) {
    if (fs.existsSync(item.in)) {
      const tempOut = item.out + '.tmp.png';
      await removeWhiteBg(item.in, tempOut);
      if (fs.existsSync(tempOut)) {
        fs.renameSync(tempOut, item.out);
      }
    }
  }

  // Copy to public
  fs.copyFileSync(path.join(root, 'src/assets/carrentalserviceslogo2.png'), path.join(root, 'public/carrentalserviceslogo2.png'));
  fs.copyFileSync(path.join(root, 'src/assets/carrentalserviceslogo2.png'), path.join(root, 'public/carrentalserviceslogo.png'));
  fs.copyFileSync(path.join(root, 'src/assets/carrentalserviceslogo2.png'), path.join(root, 'public/logo.png'));
  console.log('Copied transparent logos to public folder.');
}

run();
