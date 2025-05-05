import { createReadStream, createWriteStream, unlink } from 'fs';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { resolve, basename, parse } from 'path';

export async function brotli(sourcePath, destinationDir, ext = 'br', operation = 'compress') {
  const isCompression = operation === 'compress';
  
  if (!sourcePath || !destinationDir) {
    console.error('Error: Source path and destination directory must be specified\n');
    return;
  }

  const absoluteSource = resolve(process.cwd(), sourcePath);
  const originalName = basename(absoluteSource);
  const newFileName = isCompression 
    ? `${originalName}.${ext}` 
    : parse(originalName).name;
  const absoluteDestination = resolve(process.cwd(), destinationDir, newFileName);

  try {
    await new Promise((resolve, reject) => {
      const readStream = createReadStream(absoluteSource);
      const writeStream = createWriteStream(absoluteDestination, { flags: 'wx' });
      const brotliProcessor = isCompression 
        ? createBrotliCompress() 
        : createBrotliDecompress();

      const handleError = (error) => {
        readStream.destroy();
        writeStream.destroy();
        if (!isCompression) {
          unlink(absoluteDestination, () => {});
        }
        reject(error);
      };

      readStream
        .pipe(brotliProcessor)
        .pipe(writeStream);

      readStream.on('error', handleError);
      brotliProcessor.on('error', handleError);
      writeStream.on('error', handleError);
      writeStream.on('finish', resolve);
    });

    console.log(`File "${absoluteSource}" successfully ${operation}ed to "${absoluteDestination}"\n`);
  } catch (error) {
    console.error(`Error during ${operation} operation:`, error.message, '\n');
  }
}