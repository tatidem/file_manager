import { stat } from 'fs/promises';
import { resolve, basename } from 'path';
import { cp } from './cp.js';
import { rm } from './rm.js';

export async function mv(sourcePath, destinationPath) {
  const copySuccess = await cp(sourcePath, destinationPath, true);
  
  if (!copySuccess) {
    return false;
  }

  const targetPath = resolve(process.cwd(), destinationPath, basename(sourcePath));
  try {
    await stat(targetPath);
  } catch {
    console.error(`Copy succeeded but target file not found at "${targetPath}"\n`);
    return false;
  }

  const deleteSuccess = await rm(sourcePath, true);
  
  if (!deleteSuccess) {
    await rm(targetPath, true).catch(() => {});
    return false;
  }

  console.log(`"${basename(sourcePath)}" moved to "${targetPath}"\n`);
  return true;
}