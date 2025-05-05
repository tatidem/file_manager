import { rename } from 'fs/promises';
import { resolve, basename } from 'path';
import { fileExist } from '../utils/fileExist.js';

export async function rn (sourceName, targetName) {
  if (!sourceName || !targetName) {
    console.error('Error: Both source and target names must be provided');
    return;
  }

  const sourcePath = resolve(process.cwd(), sourceName);
  const targetPath = resolve(process.cwd(), targetName);

  try {
    const sourceExists = await fileExist(sourcePath);
    if (!sourceExists) {
      console.error(`Error: Source file "${sourceName}" does not exist\n`);
      return;
    }

    const targetExists = await fileExist(targetPath);
    if (targetExists) {
      console.error(`Error: Target file "${targetName}" already exists\n`);
      return;
    }

    await rename(sourcePath, targetPath);
    console.log(`"${basename(sourcePath)}" renamed to "${basename(targetPath)}"\n`);
  } catch (error) {
    console.error('Error renaming file:', error.message, '\n');
  }
};