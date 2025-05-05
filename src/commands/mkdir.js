import { mkdir as newDir } from 'fs/promises';
import { resolve } from 'path';

export async function mkdir(dirName, readlineInterface) {
  if (!dirName) {
    const answer = await readlineInterface.question('Enter directory name to create: ');
    dirName = answer.trim();
    if (!dirName) {
      console.error('Error: No directory name provided');
      return;
    }
  }

  const dirPath = resolve(process.cwd(), dirName);

  try {
    await newDir(dirPath, { recursive: false });
    console.log(`Directory "${dirPath}" created successfully\n`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.error(`Error: Directory "${dirPath}" already exists\n`);
    } else {
      console.error('Error creating directory:', error.message, '\n');
    }
  }
}