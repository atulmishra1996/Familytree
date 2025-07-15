import fs from 'fs/promises';
import path from 'path';

export interface StorageError extends Error {
  code: string;
  statusCode: number;
}

export class Storage {
  private dataDir: string;

  constructor(dataDir: string = 'data') {
    this.dataDir = path.resolve(dataDir);
  }

  /**
   * Ensure data directory and subdirectories exist
   */
  async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'persons'), { recursive: true });
    } catch (error) {
      const storageError = new Error(`Failed to create data directories: ${error}`) as StorageError;
      storageError.code = 'DIRECTORY_CREATION_ERROR';
      storageError.statusCode = 500;
      throw storageError;
    }
  }

  /**
   * Read JSON data from file
   */
  async readJSON<T>(filePath: string): Promise<T | null> {
    try {
      const fullPath = path.join(this.dataDir, filePath);
      const data = await fs.readFile(fullPath, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null; // File doesn't exist
      }
      const storageError = new Error(`Failed to read file ${filePath}: ${error.message}`) as StorageError;
      storageError.code = 'FILE_READ_ERROR';
      storageError.statusCode = 500;
      throw storageError;
    }
  }

  /**
   * Write JSON data to file
   */
  async writeJSON<T>(filePath: string, data: T): Promise<void> {
    try {
      const fullPath = path.join(this.dataDir, filePath);
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(fullPath, jsonData, 'utf-8');
    } catch (error: any) {
      const storageError = new Error(`Failed to write file ${filePath}: ${error.message}`) as StorageError;
      storageError.code = 'FILE_WRITE_ERROR';
      storageError.statusCode = 500;
      throw storageError;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.dataDir, filePath);
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return; // File doesn't exist, nothing to delete
      }
      const storageError = new Error(`Failed to delete file ${filePath}: ${error.message}`) as StorageError;
      storageError.code = 'FILE_DELETE_ERROR';
      storageError.statusCode = 500;
      throw storageError;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.dataDir, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(dirPath: string): Promise<string[]> {
    try {
      const fullPath = path.join(this.dataDir, dirPath);
      const files = await fs.readdir(fullPath);
      return files.filter(file => file.endsWith('.json'));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return []; // Directory doesn't exist
      }
      const storageError = new Error(`Failed to list files in ${dirPath}: ${error.message}`) as StorageError;
      storageError.code = 'DIRECTORY_READ_ERROR';
      storageError.statusCode = 500;
      throw storageError;
    }
  }
}

// Export singleton instance
export const storage = new Storage();