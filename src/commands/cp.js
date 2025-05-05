import { stat, cp as fsCp } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { resolve, basename } from 'path';

export async function cp(sourcePath, destinationPath, silent = false) {
  const absoluteSource = resolve(process.cwd(), sourcePath);
  const absoluteDestination = resolve(process.cwd(), destinationPath);
  const targetPath = resolve(absoluteDestination, basename(absoluteSource));

  try {
    const stats = await stat(absoluteSource);

    if (stats.isDirectory()) {
      await fsCp(absoluteSource, targetPath, { recursive: true, errorOnExist: true });
      if (!silent) {
        console.log(`Directory "${absoluteSource}" copied to "${targetPath}"\n`);
      }
      return true;
    } else {
      await new Promise((resolve, reject) => {
        const readStream = createReadStream(absoluteSource);
        const writeStream = createWriteStream(targetPath, { flags: 'wx' });

        readStream.pipe(writeStream);
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
      });

      if (!silent) {
        console.log(`File "${absoluteSource}" copied to "${targetPath}"\n`);
      }
      return true;
    }
  } catch (error) {
    console.error(`Failed to copy "${sourcePath}" to "${destinationPath}":`, error.message, '\n');
    return false;
  }
}