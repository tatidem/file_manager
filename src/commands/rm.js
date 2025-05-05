import { rm as fsRm } from 'fs/promises';
import { resolve, basename } from 'path';

export async function rm(filePath, silent = false) {
  try {
    const fullPath = resolve(process.cwd(), filePath);
    await fsRm(fullPath, { recursive: true, force: false });

    if (!silent) {
      console.log(`"${basename(fullPath)}" deleted successfully\n`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete "${filePath}":`, error.message, '\n');
    return false;
  }
}