import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { resolve, basename } from 'path';

export async function hash(filePath, algorithm = 'sha256') {
  if (!filePath) {
    console.error('Error: File path must be specified\n');
    return;
  }

  const absolutePath = resolve(process.cwd(), filePath);
  const hashAlgorithm = algorithm.toLowerCase();

  try {
    const hash = createHash(hashAlgorithm);
    const stream = createReadStream(absolutePath);

    await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => {
        const result = hash.digest('hex');
        console.log(`${hashAlgorithm.toUpperCase()} hash for "${basename(absolutePath)}":`);
        console.log(`${result}\n`);
        resolve();
      });
      stream.on('error', reject);
    });
  } catch (error) {
    console.error(`Error calculating ${hashAlgorithm} hash for "${basename(absolutePath)}":`);
    console.error(`${error.message}\n`);
  }
}