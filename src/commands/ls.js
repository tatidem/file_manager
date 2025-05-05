import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function ls(directory = '.') {
  try {
    const items = await readdir(directory, { withFileTypes: true });
    
    const contents = await Promise.all(
      items.map(async (item) => {
        return {
          Name: item.name,
          Type: item.isDirectory() ? 'Directory' : 'File',
        };
      })
    );

    contents.sort((a, b) => {
      if (a.Type === b.Type) {
        return a.Name.localeCompare(b.Name);
      }
      return a.Type === 'Directory' ? -1 : 1;
    });

    const indexedContents = contents.map((item, index) => ({
      ...item
    }));

    console.table(indexedContents, ['Name', 'Type']);
  } catch (error) {
    console.error('Error reading directory:', error.message);
  }
}