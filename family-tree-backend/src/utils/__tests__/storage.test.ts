import fs from 'fs/promises';
import path from 'path';
import { Storage } from '../storage';

describe('Storage Utility Tests', () => {
  let storage: Storage;
  const testDataDir = 'test-data';

  beforeEach(() => {
    storage = new Storage(testDataDir);
  });

  afterEach(async () => {
    // Clean up test data directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Directory Management', () => {
    it('should create data directories', async () => {
      await storage.ensureDirectories();

      const dataDir = await fs.stat(testDataDir);
      expect(dataDir.isDirectory()).toBe(true);

      const personsDir = await fs.stat(path.join(testDataDir, 'persons'));
      expect(personsDir.isDirectory()).toBe(true);
    });
  });

  describe('JSON File Operations', () => {
    beforeEach(async () => {
      await storage.ensureDirectories();
    });

    it('should write and read JSON data', async () => {
      const testData = { id: '1', name: 'Test Person', age: 30 };
      
      await storage.writeJSON('test.json', testData);
      const readData = await storage.readJSON('test.json');

      expect(readData).toEqual(testData);
    });

    it('should return null for non-existent files', async () => {
      const result = await storage.readJSON('non-existent.json');
      expect(result).toBeNull();
    });

    it('should handle file deletion', async () => {
      const testData = { test: 'data' };
      
      await storage.writeJSON('delete-test.json', testData);
      expect(await storage.fileExists('delete-test.json')).toBe(true);
      
      await storage.deleteFile('delete-test.json');
      expect(await storage.fileExists('delete-test.json')).toBe(false);
    });

    it('should check file existence', async () => {
      expect(await storage.fileExists('non-existent.json')).toBe(false);
      
      await storage.writeJSON('exists-test.json', { test: 'data' });
      expect(await storage.fileExists('exists-test.json')).toBe(true);
    });

    it('should list JSON files in directory', async () => {
      await storage.writeJSON('file1.json', { id: 1 });
      await storage.writeJSON('file2.json', { id: 2 });
      await storage.writeJSON('persons/person1.json', { id: 3 });

      const rootFiles = await storage.listFiles('.');
      expect(rootFiles).toContain('file1.json');
      expect(rootFiles).toContain('file2.json');
      expect(rootFiles).not.toContain('person1.json');

      const personFiles = await storage.listFiles('persons');
      expect(personFiles).toContain('person1.json');
    });

    it('should return empty array for non-existent directory', async () => {
      const files = await storage.listFiles('non-existent-dir');
      expect(files).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should throw StorageError for write failures', async () => {
      // Try to write to an invalid path
      const invalidStorage = new Storage('/invalid/path/that/cannot/be/created');
      
      await expect(invalidStorage.writeJSON('test.json', {}))
        .rejects
        .toMatchObject({
          code: 'FILE_WRITE_ERROR',
          statusCode: 500
        });
    });

    it('should throw StorageError for read failures on corrupted files', async () => {
      await storage.ensureDirectories();
      
      // Create a file with invalid JSON
      const filePath = path.join(testDataDir, 'invalid.json');
      await fs.writeFile(filePath, 'invalid json content');

      await expect(storage.readJSON('invalid.json'))
        .rejects
        .toMatchObject({
          code: 'FILE_READ_ERROR',
          statusCode: 500
        });
    });
  });
});