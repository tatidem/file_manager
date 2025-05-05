import { createReadStream } from 'fs';
import { resolve, basename } from 'path';
import { fileExist } from '../utils/fileExist.js';

export async function cat(filePath, readlineInterface) {
  if (!filePath) {
    console.error('Error: Invalid input - no file specified');
    return;
  }

  const absolutePath = resolve(process.cwd(), String(filePath));
  const fileExists = await fileExist(absolutePath);

  if (!fileExists) {
    console.error(`Error: File "${absolutePath}" does not exist`);
    return;
  }

  let wasInterrupted = false;
  
  const cleanupListeners = () => {
    readlineInterface.removeAllListeners('SIGINT');
  };

  readlineInterface.removeAllListeners('SIGINT');
  readlineInterface.on('SIGINT', () => {
    wasInterrupted = true;
  });

  try {
    await new Promise((resolve, reject) => {
      const fileStream = createReadStream(absolutePath, { encoding: 'utf8' });

      fileStream.on('open', () => {
        console.log(`Reading file "${basename(absolutePath)}"...\nContent:\n`);
      });

      fileStream.on('data', (chunk) => {
        if (wasInterrupted) {
          fileStream.destroy();
          console.log('... Stopped');
          resolve();
        } else {
          process.stdout.write(chunk.toString());
        }
      });

      fileStream.on('end', () => {
        console.log('\n');
        resolve();
      });

      fileStream.on('error', reject);
    });
  } catch (error) {
    console.error(`Error reading file "${basename(absolutePath)}":`, error.message);
  } finally {
    cleanupListeners();
  }
}