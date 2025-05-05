import { writeFile } from 'fs/promises';
import { resolve } from 'path';

export async function add(fileName, readlineInterface) {
  if (!fileName) {
    const answer = await readlineInterface.question('Enter file name to create: ');
    fileName = answer.trim();
    if (!fileName) {
      console.error('Error: No file name provided');
      return;
    }
  }

  const filePath = resolve(process.cwd(), fileName);

  try {
    await writeFile(filePath, '', { flag: 'wx' });
    console.log(`File "${filePath}" created successfully\n`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.error(`Error: File "${filePath}" already exists\n`);
    } else {
      console.error('Error creating file:', error.message, '\n');
    }
  }
}