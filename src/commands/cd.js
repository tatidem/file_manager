import { resolve } from 'path';

export function cd(targetPath) {
  try {
    const absolutePath = resolve(process.cwd(), targetPath);
    process.chdir(absolutePath);
    console.log();
  } catch (error) {
    console.error('Directory Change Error:', error.message, '\n');
  }
}