import { readFile } from 'node:fs/promises';
import { SeedFileData } from '../../tools/seeder/data/seed-data.interface';

export async function readJsonFile<T>(filePath: string): Promise<SeedFileData<T>> {
  try {
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading or parsing JSON file at ${filePath}:`, error);
    throw error; // Re-throw the error for further handling
  }
}
